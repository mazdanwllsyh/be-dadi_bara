import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import instance from "../../utils/axios.js";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const updateData = useCallback((newData) => {
    setData((prevData) => ({ ...prevData, ...newData }));
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await instance.get("/landing-config");
        setData(response.data);
      } catch (error) {
        console.error("Gagal mengambil data awal:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";

    localStorage.setItem("theme", newTheme);

    setTheme(newTheme);
  }, [theme]); 

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

  const contextValue = useMemo(
    () => ({
      data,
      updateData,
      theme,
      toggleTheme,
    }),
    [data, updateData, theme, toggleTheme]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {!isLoading && children}
    </AppContext.Provider>
  );
};
