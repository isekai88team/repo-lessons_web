import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBell,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import getBaseUrl from "../../untils/baseURL";
import toast from "react-hot-toast";

const StudentNotifications = () => {
  const { isDarkMode, colors } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("studentToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Try authenticated endpoint first, fallback to public
        let response;
        if (token) {
          response = await fetch(`${getBaseUrl()}/api/students/notifications`, {
            headers,
          });
        }

        // Fallback to public notifications if not authenticated or failed
        if (!response || !response.ok) {
          response = await fetch(`${getBaseUrl()}/api/notifications/active`);
        }

        if (!response.ok) throw new Error("Failed to fetch notifications");
        const data = await response.json();
        setNotifications(data.notifications || data);
      } catch (error) {
        toast.error("ไม่สามารถโหลดการแจ้งเตือนได้");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "warning":
        return <FaExclamationTriangle className="text-yellow-500" />;
      case "success":
        return <FaCheckCircle className="text-green-500" />;
      case "error":
        return <FaExclamationCircle className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <header
        className={`py-4 px-4 md:px-6 shadow-md sticky top-0 z-10 ${
          isDarkMode ? "bg-slate-800" : "bg-white"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className={`p-2 rounded-lg transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-slate-700 text-white"
                  : "hover:bg-gray-100 text-gray-800"
              }`}
            >
              <FaArrowLeft />
            </button>
            <h1
              className={`text-xl font-bold flex items-center gap-2 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              <FaBell className="text-blue-500" />
              การแจ้งเตือน
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {loading ? (
          <div className="text-center py-10 opacity-50">กำลังโหลด...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center opacity-50">
            <FaBell className="text-6xl mb-4 text-gray-400" />
            <p>ไม่มีการแจ้งเตือนในขณะนี้</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((item) => (
              <Link
                to={`/notifications/${item._id}`}
                key={item._id}
                className={`block p-4 rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 ${
                  isDarkMode
                    ? "bg-slate-800 hover:bg-slate-750"
                    : "bg-white hover:bg-gray-50"
                }`}
                style={{
                  borderLeftColor:
                    item.type === "warning"
                      ? "#EAB308"
                      : item.type === "success"
                      ? "#22C55E"
                      : item.type === "error"
                      ? "#EF4444"
                      : "#3B82F6",
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-xl">{getIcon(item.type)}</div>
                  <div className="flex-1">
                    <h3
                      className={`font-bold mb-1 ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`text-sm mb-2 line-clamp-2 ${
                        isDarkMode ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      {item.message}
                    </p>
                    <span className="text-xs opacity-50 block text-right">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;
