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
  const { showConfirmSwal, showErrorSwal, showInfoSwal } = useCustomSwals();

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

  const logout = useCallback(
    async (isConfirmed = true) => {
      if (!isConfirmed) {
        const confirmed = await showConfirmSwal(
          "Yakin ingin Logout?",
          "Anda akan segera mengakhiri sesi ini!"
        );
        if (!confirmed) return;
      }

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
    },
    [navigate, showConfirmSwal, showErrorSwal, showInfoSwal, updateUser]
  );

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

  useEffect(() => {
    const sessionExpiresAt = localStorage.getItem("sessionExpiresAt");
    let timer;

    if (user && sessionExpiresAt) {
      const expiresIn = new Date(parseInt(sessionExpiresAt, 10)) - Date.now();
      const refreshTimeout = expiresIn - 60 * 1000;

      if (refreshTimeout > 0) {
        timer = setTimeout(async () => {
          try {
            const response = await instance.post("/auth/refresh-token");
            updateUser(response.data.user);
          } catch (error) {
            logout(true);
          }
        }, refreshTimeout);
      } else {
        logout(true);
      }
    }
    return () => clearTimeout(timer);
  }, [user, updateUser, logout]);

  const value = useMemo(
    () => ({
      user,
      setUser: updateUser,
      loading,
      refetchUser: fetchUser,
      logout: () => logout(false),
    }),
    [user, loading, updateUser, fetchUser, logout]
  );

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};
