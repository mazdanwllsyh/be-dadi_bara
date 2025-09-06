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
      "Anda akan segera melakukan Logout!"
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
