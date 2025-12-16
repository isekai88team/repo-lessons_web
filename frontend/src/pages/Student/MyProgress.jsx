import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaPlay,
  FaFileAlt,
  FaCheckCircle,
  FaSpinner,
  FaArrowLeft,
  FaGraduationCap,
  FaChartLine,
  FaPercent,
  FaBook,
} from "react-icons/fa";
import getBaseUrl from "../../untils/baseURL";
import { useTheme } from "../../context/ThemeContext";

const MyProgress = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchMyProgress();
  }, []);

  const fetchMyProgress = async () => {
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${getBaseUrl()}/api/students/my-progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch progress");
      }

      const data = await response.json();
      setStudent(data.student);
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error(error);
      toast.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "#22C55E";
    if (progress >= 50) return "#F59E0B";
    if (progress > 0) return "#3B82F6";
    return isDarkMode ? "#475569" : "#CBD5E1";
  };

  // Get the first subject (since there's only one)
  const subjectData = subjects[0];

  // Calculate stats from chapters
  const chapters = subjectData?.chapters || [];
  const totalChapters = chapters.length;
  const watchedChapters = chapters.filter(
    (c) => c.progress?.videoWatched
  ).length;
  const averageProgress = subjectData?.progress || 0;

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

  if (!student) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-slate-900" : "bg-blue-50"
        }`}
      >
        <div className="text-center">
          <FaGraduationCap
            className={`text-6xl mx-auto mb-4 opacity-30 ${
              isDarkMode ? "text-slate-600" : "text-gray-400"
            }`}
          />
          <p
            className={`text-xl mb-4 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            กรุณาเข้าสู่ระบบ
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition"
          >
            เข้าสู่ระบบ
          </button>
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
            className={`p-3 rounded-xl shadow-md hover:shadow-lg transition ${
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
              <FaChartLine className="text-blue-500" />
              ความก้าวหน้าการเรียน
            </h1>
            <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
              สวัสดี {student.firstName} {student.lastName}
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div
          className={`rounded-2xl p-6 mb-8 shadow-lg ${
            isDarkMode ? "bg-slate-800" : "bg-white"
          }`}
        >
          <h2
            className={`text-lg font-bold mb-4 flex items-center gap-2 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            <FaGraduationCap className="text-blue-500" />
            สรุปภาพรวม
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {/* Completed Chapters */}
            <div
              className={`p-4 rounded-xl text-center ${
                isDarkMode ? "bg-slate-700/50" : "bg-green-50"
              }`}
            >
              <FaCheckCircle className="text-2xl text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-500">
                {chapters.filter((c) => c.progress?.isCompleted).length}
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                บทที่เรียนจบ
              </p>
            </div>

            {/* Watched Chapters */}
            <div
              className={`p-4 rounded-xl text-center ${
                isDarkMode ? "bg-slate-700/50" : "bg-purple-50"
              }`}
            >
              <FaPlay className="text-2xl text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-500">
                {watchedChapters}/{totalChapters}
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                บทที่ดูวิดีโอจบ
              </p>
            </div>

            {/* Average Progress */}
            <div
              className={`p-4 rounded-xl text-center ${
                isDarkMode ? "bg-slate-700/50" : "bg-amber-50"
              }`}
            >
              <FaPercent className="text-2xl text-amber-500 mx-auto mb-2" />
              <p
                className="text-2xl font-bold"
                style={{ color: getProgressColor(averageProgress) }}
              >
                {averageProgress}%
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                ความก้าวหน้าเฉลี่ย
              </p>
            </div>
          </div>
        </div>

        {/* Chapters List - Direct display without dropdown */}
        <div className="space-y-4">
          <h2
            className={`text-lg font-bold flex items-center gap-2 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            <FaBook className="text-blue-500" />
            รายละเอียดบทเรียน
          </h2>

          {!subjectData || chapters.length === 0 ? (
            <div
              className={`rounded-2xl p-8 text-center ${
                isDarkMode ? "bg-slate-800" : "bg-white"
              }`}
            >
              <FaBook
                className={`text-5xl mx-auto mb-4 opacity-20 ${
                  isDarkMode ? "text-slate-500" : "text-gray-400"
                }`}
              />
              <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                ยังไม่มีข้อมูลการเรียน
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition"
              >
                ดูวิชาทั้งหมด
              </button>
            </div>
          ) : (
            <div
              className={`rounded-2xl overflow-hidden shadow-lg ${
                isDarkMode ? "bg-slate-800" : "bg-white"
              }`}
            >
              <div className="p-5 space-y-3">
                {chapters.map((chapter, idx) => (
                  <div
                    key={chapter._id}
                    className={`flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-4 rounded-xl cursor-pointer transition ${
                      isDarkMode
                        ? "bg-slate-700/50 hover:bg-slate-700"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => navigate(`/chapter/${chapter._id}`)}
                  >
                    {/* Chapter name */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          chapter.progress?.isCompleted
                            ? "bg-green-500 text-white"
                            : isDarkMode
                            ? "bg-slate-600 text-slate-400"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {chapter.progress?.isCompleted ? (
                          <FaCheckCircle className="text-sm" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span
                        className={`text-sm truncate ${
                          isDarkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {chapter.chapter_name}
                      </span>
                    </div>

                    {/* Status icons - Video and Document only */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Video Status */}
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          chapter.progress?.videoWatched
                            ? "text-green-500"
                            : isDarkMode
                            ? "text-slate-500"
                            : "text-gray-400"
                        }`}
                        title="วิดีโอ"
                      >
                        <FaPlay className="text-xs" />
                        <span>{chapter.progress?.videoProgress || 0}%</span>
                      </div>

                      {/* Document Status */}
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          chapter.progress?.documentViewed
                            ? "text-green-500"
                            : isDarkMode
                            ? "text-slate-500"
                            : "text-gray-400"
                        }`}
                        title="เอกสาร"
                      >
                        <FaFileAlt className="text-xs" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div
          className={`mt-8 p-4 rounded-xl text-sm ${
            isDarkMode
              ? "bg-slate-800/50 text-slate-400"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          <p className="font-medium mb-2">คำอธิบายสัญลักษณ์:</p>
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-1">
              <FaPlay className="text-xs" /> วิดีโอ
            </span>
            <span className="flex items-center gap-1">
              <FaFileAlt className="text-xs" /> เอกสาร
            </span>
            <span className="flex items-center gap-1">
              <FaCheckCircle className="text-xs text-green-500" /> เรียนจบแล้ว
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProgress;
