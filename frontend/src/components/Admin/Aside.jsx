import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaChartPie,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaBook,
  FaClipboardList,
  FaCog,
  FaSignOutAlt,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const Aside = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, colors } = useTheme();

  // เมนู Admin (จัดกลุ่มตามความเหมาะสม)
  const menuItems = [
    { name: "ภาพรวม (Summary)", path: "/admin/dashboard", icon: FaChartPie },
    { name: "จัดการครู", path: "/admin/teachers", icon: FaChalkboardTeacher },
    { name: "จัดการนักเรียน", path: "/admin/students", icon: FaUserGraduate },
    { name: "รายวิชา", path: "/admin/subjects", icon: FaBook },
    { name: "คลังข้อสอบ", path: "/admin/quizzes", icon: FaClipboardList },
    { name: "ตั้งค่าระบบ", path: "/admin/settings", icon: FaCog },
  ];

  return (
    <aside
      className="w-64 h-screen sticky top-0 flex flex-col font-sans shadow-xl z-50 transition-colors duration-300"
      style={{ backgroundColor: isDarkMode ? "#272829" : "#FFFFFF" }}
    >
      {/* --- 1. Logo Section --- */}
      <div
        className="h-24 flex items-center px-8 border-b transition-colors duration-300"
        style={{ borderColor: isDarkMode ? "rgba(97,103,122,0.3)" : "#D8D9DA" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg"
            style={{
              backgroundColor: isDarkMode ? "#61677A" : "#272829",
              color: "#FFF6E0",
            }}
          >
            <span className="font-bold">IS</span>
          </div>
          <div className="flex flex-col">
            <span
              className="font-bold text-lg tracking-tight leading-none"
              style={{ color: isDarkMode ? "#FFF6E0" : "#272829" }}
            >
              ISEKAI
            </span>
            <span
              className="text-[10px] font-medium tracking-widest mt-1"
              style={{ color: isDarkMode ? "#D8D9DA" : "#61677A" }}
            >
              ADMIN PANEL
            </span>
          </div>
        </div>
      </div>

      {/* --- Theme Toggle Button --- */}
      <div className="px-6 py-4">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-300"
          style={{
            backgroundColor: isDarkMode ? "rgba(97,103,122,0.3)" : "#F5F6F7",
            color: isDarkMode ? "#FFF6E0" : "#272829",
          }}
        >
          <div className="flex items-center gap-3">
            {isDarkMode ? (
              <FaMoon className="text-yellow-400" />
            ) : (
              <FaSun className="text-orange-400" />
            )}
            <span className="text-sm font-medium">
              {isDarkMode ? "Dark Mode" : "Light Mode"}
            </span>
          </div>
          {/* Toggle Switch */}
          <div
            className="w-12 h-6 rounded-full relative transition-colors duration-300"
            style={{ backgroundColor: isDarkMode ? "#61677A" : "#D8D9DA" }}
          >
            <div
              className="w-5 h-5 rounded-full absolute top-0.5 transition-all duration-300 shadow"
              style={{
                backgroundColor: isDarkMode ? "#FFF6E0" : "#272829",
                left: isDarkMode ? "26px" : "2px",
              }}
            />
          </div>
        </button>
      </div>

      {/* --- 2. Menu Navigation --- */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-4 px-3"
          style={{ color: "#61677A" }}
        >
          Main Menu
        </p>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive
                ? isDarkMode
                  ? "#61677A"
                  : "#272829"
                : "transparent",
              color: isActive ? "#FFF6E0" : isDarkMode ? "#D8D9DA" : "#61677A",
            })}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`text-lg transition-transform duration-300 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                />
                <span
                  className={`text-sm ${
                    isActive ? "font-bold" : "font-medium"
                  }`}
                >
                  {item.name}
                </span>

                {/* Active Indicator */}
                {isActive && (
                  <div
                    className="ml-auto w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#FFF6E0" }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* --- 3. Profile Card --- */}
      <div className="p-4">
        <div
          className="rounded-2xl p-4 flex flex-col items-center text-center transition-colors duration-300"
          style={{
            backgroundColor: isDarkMode ? "rgba(97,103,122,0.2)" : "#F5F6F7",
            border: `1px solid ${
              isDarkMode ? "rgba(97,103,122,0.3)" : "#D8D9DA"
            }`,
          }}
        >
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-full mb-3 relative"
            style={{
              border: `2px solid ${
                isDarkMode ? "rgba(255,246,224,0.3)" : "#D8D9DA"
              }`,
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
              alt="Admin Profile"
              className="w-full h-full rounded-full object-cover"
            />
            <span
              className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full"
              style={{
                border: `2px solid ${isDarkMode ? "#272829" : "#FFFFFF"}`,
              }}
            />
          </div>

          {/* Name & Role */}
          <h4
            className="font-bold text-sm"
            style={{ color: isDarkMode ? "#FFF6E0" : "#272829" }}
          >
            Administrator
          </h4>
          <p
            className="text-xs mb-3"
            style={{ color: isDarkMode ? "#D8D9DA" : "#61677A" }}
          >
            Super User
          </p>

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("adminUser");
              navigate("/admin");
            }}
            className="w-full text-xs font-bold px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              color: "#ef4444",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#ef4444";
              e.target.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(239,68,68,0.1)";
              e.target.style.color = "#ef4444";
            }}
          >
            <FaSignOutAlt />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Aside;
