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
    const saved = localStorage.getItem("siteTheme");
    if (saved) {
      return saved === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem("siteTheme", isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Softer, faded blue theme colors
  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode
      ? {
          // Dark Mode - Soft Faded Blue
          primary: "#1e3a5f",
          secondary: "#4a7ab0", // Softer blue
          accent: "#6b9bd1", // Faded accent
          background: "#151922", // Darker, muted
          surface: "#1c222d",
          text: "#e2e8f0",
          textSecondary: "#8892a3",
          border: "#2a3444",
          cardBg: "#1c222d",
          tableHeader: "#151922",
          hover: "#252d3a",
          inputBg: "#1c222d",
          gradient: "from-slate-900/90 via-blue-950/70 to-slate-900/90",
          buttonPrimary: "#4a7ab0",
          buttonHover: "#3d6a9a",
          success: "#4ade80",
          warning: "#fbbf24",
          error: "#f87171",
        }
      : {
          // Light Mode - Soft Faded Blue
          primary: "#3d6a9a", // Softer blue
          secondary: "#5a8ac0",
          accent: "#80a8d0",
          background: "#f5f7fa", // Soft off-white
          surface: "#ffffff",
          text: "#2d3748", // Softer gray
          textSecondary: "#718096",
          border: "#e2e8f0",
          cardBg: "#ffffff",
          tableHeader: "#3d6a9a",
          hover: "#f0f4f8",
          inputBg: "#f7fafc",
          gradient: "from-blue-100/80 via-white to-blue-50/60",
          buttonPrimary: "#5a8ac0",
          buttonHover: "#4a7ab0",
          success: "#48bb78",
          warning: "#ed8936",
          error: "#f56565",
        },
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export default ThemeContext;
