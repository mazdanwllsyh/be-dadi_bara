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

  const logout = useCallback(async () => {
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
  }, [navigate, showConfirmSwal, showErrorSwal, showInfoSwal, updateUser]);

  const fetchUser = useCallback(async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await instance.get(`/auth/getuser?t=${timestamp}`, {
        withCredentials: true,
      });

      if (response.data.user) {
        updateUser(response.data.user);
      } else {
        updateUser(null);
      }
    } catch (error) {
      updateUser(null);
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

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
