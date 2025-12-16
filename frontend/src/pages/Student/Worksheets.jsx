import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaFileAlt,
  FaSpinner,
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import getBaseUrl from "../../untils/baseURL";
import { useTheme } from "../../context/ThemeContext";

const Worksheets = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [worksheets, setWorksheets] = useState([]);

  useEffect(() => {
    fetchWorksheets();
  }, []);

  const fetchWorksheets = async () => {
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${getBaseUrl()}/api/students/worksheets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch");
      }

      const data = await response.json();
      setWorksheets(data.worksheets || []);
    } catch (error) {
      console.error(error);
      toast.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "ไม่มีกำหนด";
    return new Date(dateString).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date() > new Date(deadline);
  };

  const getStatusDisplay = (worksheet) => {
    // Completed statuses
    if (worksheet.status === "graded" || worksheet.status === "approved") {
      return {
        text: worksheet.status === "graded" ? "ตรวจแล้ว" : "ผ่านแล้ว",
        color: "text-green-500",
        bg: isDarkMode ? "bg-green-900/30" : "bg-green-100",
        icon: <FaCheckCircle />,
      };
    }
    // Rejected
    if (worksheet.status === "rejected") {
      return {
        text: "ไม่ผ่าน",
        color: "text-red-500",
        bg: isDarkMode ? "bg-red-900/30" : "bg-red-100",
        icon: <FaTimesCircle />,
      };
    }
    // Submitted and waiting
    if (worksheet.status === "submitted") {
      return {
        text: "รอตรวจ",
        color: "text-blue-500",
        bg: isDarkMode ? "bg-blue-900/30" : "bg-blue-100",
        icon: <FaClock />,
      };
    }
    // Overdue
    if (isOverdue(worksheet.deadline)) {
      return {
        text: "เลยกำหนด",
        color: "text-red-500",
        bg: isDarkMode ? "bg-red-900/30" : "bg-red-100",
        icon: <FaTimesCircle />,
      };
    }
    // Pending
    return {
      text: "รอส่ง",
      color: "text-yellow-500",
      bg: isDarkMode ? "bg-yellow-900/30" : "bg-yellow-100",
      icon: <FaClock />,
    };
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-slate-900" : "bg-gray-50"
        }`}
      >
        <FaSpinner className="animate-spin text-5xl text-blue-500" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-8 px-4 ${
        isDarkMode ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className={`p-3 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer ${
              isDarkMode
                ? "bg-slate-800 text-blue-400 hover:bg-slate-700"
                : "bg-white text-blue-600 hover:bg-blue-50"
            }`}
          >
            <FaArrowLeft />
          </button>
          <div className="flex-1">
            <h1
              className={`text-2xl font-bold flex items-center gap-3 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              <FaFileAlt className="text-blue-500" />
              ใบงานทั้งหมด
            </h1>
          </div>
        </div>

        {/* Worksheets List */}
        {worksheets.length === 0 ? (
          <div
            className={`rounded-lg p-8 text-center ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            <FaFileAlt
              className={`text-6xl mx-auto mb-4 opacity-20 ${
                isDarkMode ? "text-slate-500" : "text-gray-400"
              }`}
            />
            <p className={isDarkMode ? "text-white" : "text-gray-800"}>
              ยังไม่มีใบงาน
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {worksheets.map((worksheet) => {
              const status = getStatusDisplay(worksheet);
              return (
                <div
                  key={worksheet._id}
                  onClick={() => navigate(`/worksheets/${worksheet._id}`)}
                  className={`rounded-lg border p-4 cursor-pointer transition hover:shadow-md ${
                    isDarkMode
                      ? "bg-slate-800 border-slate-700 hover:bg-slate-700"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <FaFileAlt className="text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-medium truncate ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {worksheet.title}
                      </h3>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-slate-400" : "text-gray-500"
                        }`}
                      >
                        {worksheet.chapter?.chapter_name} • กำหนดส่ง{" "}
                        {formatDate(worksheet.deadline)}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.bg} ${status.color}`}
                    >
                      {status.icon}
                      {status.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Worksheets;
