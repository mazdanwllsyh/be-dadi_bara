import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { googleLogout } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import instance from "../../utils/axios.js";
import useCustomSwals from "../Dashboard/useCustomSwals.jsx";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {
    showConfirmSwal,
    showSuccessSwal,
    showErrorSwal,
    showInfoSwal,
    showQuestionSwal,
  } = useCustomSwals();

  const updateUser = useCallback((newUserData) => {
    if (newUserData) {
      setUser(newUserData);
      if (newUserData.sessionExpiresAt) {
        localStorage.setItem("sessionExpiresAt", newUserData.sessionExpiresAt);
      }
    } else {
      setUser(null);
      localStorage.removeItem("sessionExpiresAt");
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await instance.get("/auth/getuser", {
        withCredentials: true,
      });
      updateUser(response.data.user);
    } catch (error) {
      updateUser(null);
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = async () => {
    const isConfirmed = await showConfirmSwal(
      "Yakin ingin Logout?",
      "Anda akan segera mengakhiri sesi ini!"
    );

    if (isConfirmed) {
      try {
        await instance.get("/auth/logout", { withCredentials: true });
        googleLogout();
        sessionStorage.clear();
        updateUser(null);
        showInfoSwal("Anda telah berhasil logout.");
        navigate("/");
      } catch (error) {
        console.error("Logout error:", error);
        googleLogout();
        sessionStorage.clear();
        updateUser(null);
        showErrorSwal("Gagal logout dari server, sesi frontend telah dihapus.");
        navigate("/");
      }
    }
  };

  useEffect(() => {
    const sessionExpiresAt = localStorage.getItem("sessionExpiresAt");
    if (user && sessionExpiresAt) {
      const expiresIn = new Date(parseInt(sessionExpiresAt, 10)) - Date.now();
      const refreshTimeout = expiresIn - 60 * 1000;

      if (refreshTimeout > 0) {
        const timer = setTimeout(async () => {
          try {
            console.log("Sesi akan habis, mencoba refresh token...");
            const response = await instance.post("/auth/refresh-token");
            updateUser(response.data.user);
            console.log("Token berhasil di-refresh.");
          } catch (error) {
            console.error(
              "Gagal refresh token, melakukan logout paksa.",
              error
            );
            logout();
          }
        }, refreshTimeout);

        return () => clearTimeout(timer);
      } else {
        console.log("Token sudah kedaluwarsa, melakukan logout.");
        logout();
      }
    }
  }, [user, updateUser, logout]);

  const value = useMemo(
    () => ({
      user,
      setUser: updateUser,
      loading,
      refetchUser: fetchUser,
      logout,
    }),
    [user, loading, updateUser, fetchUser, logout]
  );

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};
