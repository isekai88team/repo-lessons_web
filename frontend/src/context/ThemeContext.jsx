import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem("adminTheme");
    return saved ? saved === "dark" : true; // Default to dark mode
  });

  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem("adminTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Theme colors based on user's palette
  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode
      ? {
          // Dark Mode
          primary: "#272829",
          secondary: "#61677A",
          accent: "#D8D9DA",
          background: "#272829",
          surface: "#363739",
          text: "#FFF6E0",
          textSecondary: "#D8D9DA",
          border: "#61677A",
          cardBg: "#363739",
          tableHeader: "#1a1b1c",
          hover: "#61677A",
          inputBg: "#363739",
        }
      : {
          // Light Mode
          primary: "#272829",
          secondary: "#61677A",
          accent: "#D8D9DA",
          background: "#FFF6E0",
          surface: "#FFFFFF",
          text: "#272829",
          textSecondary: "#61677A",
          border: "#D8D9DA",
          cardBg: "#FFFFFF",
          tableHeader: "#272829",
          hover: "#FFF6E0",
          inputBg: "#F5F6F7",
        },
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export default ThemeContext;
