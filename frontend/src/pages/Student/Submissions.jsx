import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaPaperPlane,
  FaSpinner,
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaImage,
  FaFilePdf,
  FaFileWord,
  FaFileAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";
import getBaseUrl from "../../untils/baseURL";
import { useTheme } from "../../context/ThemeContext";

const Submissions = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${getBaseUrl()}/api/students/submissions`, {
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
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error(error);
      toast.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (type) => {
    if (type === "image") return <FaImage className="text-purple-500" />;
    if (type === "pdf") return <FaFilePdf className="text-red-500" />;
    if (type === "doc") return <FaFileWord className="text-blue-500" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  const getStatusBadge = (status) => {
    // Check for completed statuses: graded or approved
    if (status === "graded" || status === "approved") {
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
            isDarkMode
              ? "bg-green-900/30 text-green-400"
              : "bg-green-100 text-green-600"
          }`}
        >
          <FaCheckCircle />
          {status === "graded" ? "ตรวจแล้ว" : "ผ่านแล้ว"}
        </span>
      );
    }
    // Rejected status
    if (status === "rejected") {
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
            isDarkMode
              ? "bg-red-900/30 text-red-400"
              : "bg-red-100 text-red-600"
          }`}
        >
          ❌ ไม่ผ่าน
        </span>
      );
    }
    // Pending/submitted status
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
          isDarkMode
            ? "bg-blue-900/30 text-blue-400"
            : "bg-blue-100 text-blue-600"
        }`}
      >
        <FaClock />
        รอตรวจ
      </span>
    );
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-slate-900" : "bg-blue-50"
        }`}
      >
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-blue-500 mx-auto mb-4" />
          <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
            กำลังโหลดข้อมูล...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-8 px-4 transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-blue-50 via-white to-blue-50"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
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
                isDarkMode ? "text-white" : "text-blue-700"
              }`}
            >
              <FaPaperPlane className="text-blue-500" />
              การส่งงาน
            </h1>
            <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
              ประวัติการส่งงานทั้งหมด
            </p>
          </div>
        </div>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div
            className={`rounded-2xl p-8 text-center shadow-lg ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            <FaPaperPlane
              className={`text-6xl mx-auto mb-4 opacity-20 ${
                isDarkMode ? "text-slate-500" : "text-gray-400"
              }`}
            />
            <p
              className={`text-lg mb-2 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              ยังไม่มีการส่งงาน
            </p>
            <button
              onClick={() => navigate("/worksheets")}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition cursor-pointer"
            >
              ดูใบงานทั้งหมด
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub._id}
                className={`rounded-2xl overflow-hidden shadow-lg ${
                  isDarkMode ? "bg-slate-800" : "bg-white"
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          sub.status === "graded" || sub.status === "approved"
                            ? "bg-gradient-to-br from-green-400 to-emerald-500"
                            : sub.status === "rejected"
                            ? "bg-gradient-to-br from-red-400 to-red-500"
                            : isDarkMode
                            ? "bg-slate-700"
                            : "bg-blue-100"
                        }`}
                      >
                        {sub.status === "graded" ||
                        sub.status === "approved" ? (
                          <FaCheckCircle className="text-xl text-white" />
                        ) : sub.status === "rejected" ? (
                          <span className="text-xl text-white">❌</span>
                        ) : (
                          <FaClock
                            className={`text-xl ${
                              isDarkMode ? "text-blue-400" : "text-blue-600"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-bold text-lg ${
                            isDarkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {sub.worksheet?.title || "ใบงาน"}
                        </h3>
                        {sub.worksheet?.chapter && (
                          <p
                            className={`text-sm ${
                              isDarkMode ? "text-slate-400" : "text-gray-500"
                            }`}
                          >
                            {sub.worksheet.chapter.chapter_name}
                          </p>
                        )}
                        <p
                          className={`text-sm mt-1 ${
                            isDarkMode ? "text-slate-400" : "text-gray-500"
                          }`}
                        >
                          ส่งเมื่อ: {formatDate(sub.submittedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(sub.status)}
                      {(sub.status === "graded" || sub.status === "approved") &&
                        sub.score !== undefined && (
                          <span className="text-2xl font-bold text-green-500">
                            {sub.score}
                          </span>
                        )}
                    </div>
                  </div>

                  {/* File Info */}
                  <div
                    className={`mt-4 p-3 rounded-lg flex items-center justify-between ${
                      isDarkMode ? "bg-slate-700/50" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getFileIcon(sub.fileType)}
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-slate-300" : "text-gray-700"
                        }`}
                      >
                        {sub.fileName}
                      </span>
                    </div>
                    {sub.fileUrl && (
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm"
                      >
                        <FaExternalLinkAlt />
                        ดูไฟล์
                      </a>
                    )}
                  </div>

                  {/* Feedback */}
                  {sub.feedback && (
                    <div
                      className={`mt-3 p-3 rounded-lg ${
                        isDarkMode ? "bg-green-900/20" : "bg-green-50"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-green-400" : "text-green-700"
                        }`}
                      >
                        💬 ความคิดเห็นจากอาจารย์:
                      </p>
                      <p
                        className={`text-sm mt-1 ${
                          isDarkMode ? "text-slate-300" : "text-gray-700"
                        }`}
                      >
                        {sub.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Submissions;
