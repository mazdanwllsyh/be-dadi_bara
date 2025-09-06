import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import instance from "../../utils/axios.js";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const value = useMemo(
    () => ({
      user,
      setUser: updateUser,
      loading,
      refetchUser: fetchUser,
    }),
    [user, loading, updateUser, fetchUser]
  );

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};
