import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBell,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaExclamationCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import getBaseUrl from "../../untils/baseURL";

const StudentNotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/api/notifications/${id}`);
        if (!response.ok) throw new Error("ไม่พบข้อมูลการแจ้งเตือน");
        const data = await response.json();
        setNotification(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotification();
  }, [id]);

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

  if (loading) return <div className="p-10 text-center">กำลังโหลด...</div>;
  if (error)
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-500 underline cursor-pointer"
        >
          กลับ
        </button>
      </div>
    );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      <header
        className={`py-4 px-6 shadow-md sticky top-0 z-10 ${
          isDarkMode ? "bg-slate-800" : "bg-white"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-slate-700 text-white"
                  : "hover:bg-gray-100 text-gray-800"
              }`}
            >
              <FaArrowLeft />
            </button>
            <h1
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              รายละเอียด
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div
          className={`rounded-2xl shadow-lg p-4 md:p-8 ${
            isDarkMode ? "bg-slate-800" : "bg-white"
          }`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="text-3xl bg-gray-100 dark:bg-slate-700 p-3 rounded-full">
              {getIcon(notification.type)}
            </div>
            <div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded uppercase mb-1 inline-block ${
                  notification.type === "warning"
                    ? "bg-yellow-100 text-yellow-800"
                    : notification.type === "success"
                    ? "bg-green-100 text-green-800"
                    : notification.type === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {notification.type}
              </span>
              <h1
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {notification.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm opacity-60 mb-6 border-b pb-4 dark:border-slate-700">
            <FaCalendarAlt />
            {formatDate(notification.createdAt)}
          </div>

          <div
            className={`leading-relaxed whitespace-pre-wrap ${
              isDarkMode ? "text-slate-300" : "text-gray-700"
            }`}
          >
            {notification.message}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentNotificationDetail;
