import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaBook,
  FaChevronDown,
  FaChevronUp,
  FaPlay,
  FaFileAlt,
  FaClipboardList,
  FaClipboardCheck,
  FaCheckCircle,
  FaTrophy,
  FaSpinner,
  FaArrowLeft,
  FaGraduationCap,
  FaChartLine,
  FaPercent,
} from "react-icons/fa";
import getBaseUrl from "../../untils/baseURL";
import { useTheme } from "../../context/ThemeContext";

const MyProgress = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [expandedSubject, setExpandedSubject] = useState(null);

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

  // Calculate overall stats
  const totalSubjects = subjects.length;
  const completedSubjects = subjects.filter(
    (s) => s.progress === 100 && s.completedChapters === s.totalChapters
  ).length;
  const totalChapters = subjects.reduce((sum, s) => sum + s.totalChapters, 0);
  const watchedChapters = subjects.reduce(
    (sum, s) => sum + (s.videoWatchedChapters || 0),
    0
  );
  const averageProgress =
    totalSubjects > 0
      ? Math.round(
          subjects.reduce((sum, s) => sum + s.progress, 0) / totalSubjects
        )
      : 0;

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Subjects Count */}
            <div
              className={`p-4 rounded-xl text-center ${
                isDarkMode ? "bg-slate-700/50" : "bg-blue-50"
              }`}
            >
              <FaBook className="text-2xl text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-500">
                {totalSubjects}
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                วิชาทั้งหมด
              </p>
            </div>

            {/* Completed Subjects */}
            <div
              className={`p-4 rounded-xl text-center ${
                isDarkMode ? "bg-slate-700/50" : "bg-green-50"
              }`}
            >
              <FaCheckCircle className="text-2xl text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-500">
                {completedSubjects}
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                วิชาที่เรียนจบ
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

        {/* Subjects List */}
        <div className="space-y-4">
          <h2
            className={`text-lg font-bold flex items-center gap-2 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            <FaBook className="text-blue-500" />
            รายวิชาของฉัน
          </h2>

          {subjects.length === 0 ? (
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
            subjects.map((subjectData) => (
              <div
                key={subjectData.subject._id}
                className={`rounded-2xl overflow-hidden shadow-lg ${
                  isDarkMode ? "bg-slate-800" : "bg-white"
                }`}
              >
                {/* Subject Header */}
                <div
                  className={`p-5 cursor-pointer transition-colors ${
                    isDarkMode ? "hover:bg-slate-700/50" : "hover:bg-blue-50/50"
                  }`}
                  onClick={() =>
                    setExpandedSubject(
                      expandedSubject === subjectData.subject._id
                        ? null
                        : subjectData.subject._id
                    )
                  }
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Left side */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isDarkMode ? "bg-blue-500/20" : "bg-blue-100"
                        }`}
                      >
                        <FaBook className="text-lg text-blue-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`font-bold text-lg truncate ${
                            isDarkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {subjectData.subject.subject_name}
                        </h3>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-slate-400" : "text-gray-500"
                          }`}
                        >
                          รหัส: {subjectData.subject.code}
                          {subjectData.subject.teacher && (
                            <span className="hidden sm:inline">
                              {" "}
                              • ครู: {
                                subjectData.subject.teacher.firstName
                              }{" "}
                              {subjectData.subject.teacher.lastName}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Right side - Progress */}
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p
                            className="text-xl font-bold"
                            style={{
                              color: getProgressColor(subjectData.progress),
                            }}
                          >
                            {subjectData.progress}%
                          </p>
                          <p
                            className={`text-xs ${
                              isDarkMode ? "text-slate-400" : "text-gray-500"
                            }`}
                          >
                            {subjectData.videoWatchedChapters || 0}/
                            {subjectData.totalChapters} บท
                          </p>
                        </div>
                        {/* Progress Bar */}
                        <div
                          className={`hidden sm:block w-24 h-2 rounded-full ${
                            isDarkMode ? "bg-slate-700" : "bg-gray-200"
                          }`}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${subjectData.progress}%`,
                              backgroundColor: getProgressColor(
                                subjectData.progress
                              ),
                            }}
                          />
                        </div>
                      </div>
                      {/* Chevron */}
                      <div
                        className={
                          isDarkMode ? "text-slate-400" : "text-gray-400"
                        }
                      >
                        {expandedSubject === subjectData.subject._id ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Progress Bar */}
                  <div
                    className={`sm:hidden mt-3 w-full h-2 rounded-full ${
                      isDarkMode ? "bg-slate-700" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${subjectData.progress}%`,
                        backgroundColor: getProgressColor(subjectData.progress),
                      }}
                    />
                  </div>
                </div>

                {/* Expanded Chapters */}
                {expandedSubject === subjectData.subject._id && (
                  <div
                    className={`border-t p-5 ${
                      isDarkMode ? "border-slate-700" : "border-gray-100"
                    }`}
                  >
                    <h4
                      className={`font-medium mb-3 ${
                        isDarkMode ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      รายละเอียดบทเรียน
                    </h4>
                    <div className="space-y-3">
                      {subjectData.chapters.map((chapter, idx) => (
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
                                chapter.progress.isCompleted
                                  ? "bg-green-500 text-white"
                                  : isDarkMode
                                  ? "bg-slate-600 text-slate-400"
                                  : "bg-gray-200 text-gray-500"
                              }`}
                            >
                              {chapter.progress.isCompleted ? (
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

                          {/* Status icons */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {/* Video Status */}
                            <div
                              className={`flex items-center gap-1 text-xs ${
                                chapter.progress.videoWatched
                                  ? "text-green-500"
                                  : isDarkMode
                                  ? "text-slate-500"
                                  : "text-gray-400"
                              }`}
                              title="วิดีโอ"
                            >
                              <FaPlay className="text-xs" />
                              <span>{chapter.progress.videoProgress}%</span>
                            </div>

                            {/* Document Status */}
                            <div
                              className={`flex items-center gap-1 text-xs ${
                                chapter.progress.documentViewed
                                  ? "text-green-500"
                                  : isDarkMode
                                  ? "text-slate-500"
                                  : "text-gray-400"
                              }`}
                              title="เอกสาร"
                            >
                              <FaFileAlt className="text-xs" />
                            </div>

                            {/* Pretest Status */}
                            <div
                              className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                                chapter.progress.pretestCompleted
                                  ? chapter.progress.pretestPassed
                                    ? "bg-green-500/20 text-green-500"
                                    : "bg-red-500/20 text-red-500"
                                  : isDarkMode
                                  ? "bg-slate-600 text-slate-400"
                                  : "bg-gray-200 text-gray-400"
                              }`}
                              title="แบบทดสอบก่อนเรียน"
                            >
                              <FaClipboardList className="text-xs" />
                              <span>
                                {chapter.progress.pretestCompleted
                                  ? `${chapter.progress.pretestPercentage}%`
                                  : "-"}
                              </span>
                            </div>

                            {/* Posttest Status */}
                            <div
                              className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                                chapter.progress.posttestCompleted
                                  ? chapter.progress.posttestPassed
                                    ? "bg-green-500/20 text-green-500"
                                    : "bg-red-500/20 text-red-500"
                                  : isDarkMode
                                  ? "bg-slate-600 text-slate-400"
                                  : "bg-gray-200 text-gray-400"
                              }`}
                              title="แบบทดสอบหลังเรียน"
                            >
                              <FaClipboardCheck className="text-xs" />
                              <span>
                                {chapter.progress.posttestCompleted
                                  ? `${chapter.progress.posttestPercentage}%`
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Final Exam Status */}
                    {subjectData.finalExam && (
                      <div
                        className={`mt-4 p-4 rounded-xl flex items-center justify-between ${
                          subjectData.finalExam.result
                            ? subjectData.finalExam.result.passed
                              ? "bg-green-500/20 border border-green-500/30"
                              : "bg-red-500/20 border border-red-500/30"
                            : "bg-amber-500/20 border border-amber-500/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FaTrophy
                            className={`text-xl ${
                              subjectData.finalExam.result
                                ? subjectData.finalExam.result.passed
                                  ? "text-green-500"
                                  : "text-red-500"
                                : "text-amber-500"
                            }`}
                          />
                          <div>
                            <p
                              className={`font-bold ${
                                isDarkMode ? "text-white" : "text-gray-800"
                              }`}
                            >
                              Final Exam: {subjectData.finalExam.title}
                            </p>
                            <p
                              className={`text-sm ${
                                isDarkMode ? "text-slate-400" : "text-gray-500"
                              }`}
                            >
                              {subjectData.finalExam.canTake
                                ? "พร้อมสอบ"
                                : "ต้องเรียนให้ครบทุกบทก่อน"}
                            </p>
                          </div>
                        </div>
                        {subjectData.finalExam.result ? (
                          <div className="text-right">
                            <p
                              className={`text-lg font-bold ${
                                subjectData.finalExam.result.passed
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {subjectData.finalExam.result.percentage}%
                            </p>
                            <p
                              className={`text-xs ${
                                isDarkMode ? "text-slate-400" : "text-gray-500"
                              }`}
                            >
                              {subjectData.finalExam.result.passed
                                ? "ผ่าน ✓"
                                : "ไม่ผ่าน ✗"}
                            </p>
                          </div>
                        ) : (
                          <span className="px-3 py-1 rounded-lg text-sm font-medium bg-amber-500 text-white">
                            ยังไม่ได้ทำ
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
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
              <FaClipboardList className="text-xs" /> แบบทดสอบก่อนเรียน
            </span>
            <span className="flex items-center gap-1">
              <FaClipboardCheck className="text-xs" /> แบบทดสอบหลังเรียน
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProgress;
