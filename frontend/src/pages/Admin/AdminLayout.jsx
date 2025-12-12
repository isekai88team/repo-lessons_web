// pages/Admin/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Aside from "../../components/Admin/Aside";
import { ThemeProvider, useTheme } from "../../context/ThemeContext";

const AdminContent = () => {
  const { colors, isDarkMode } = useTheme();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDarkMode ? "#363739" : "#FFFFFF",
            color: isDarkMode ? "#FFF6E0" : "#272829",
            border: `1px solid ${isDarkMode ? "#61677A" : "#D8D9DA"}`,
            borderRadius: "12px",
            padding: "12px 16px",
          },
          success: {
            iconTheme: { primary: "#22c55e", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />
      <div
        className="flex min-h-screen font-sans transition-colors duration-300"
        style={{ backgroundColor: colors.background }}
      >
        <Aside />
        <main className="flex-1 overflow-x-hidden w-full">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

const AdminLayout = () => {
  return (
    <ThemeProvider>
      <AdminContent />
    </ThemeProvider>
  );
};

export default AdminLayout;
