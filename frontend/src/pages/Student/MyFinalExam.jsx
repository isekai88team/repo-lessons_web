import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaTrophy,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaArrowLeft,
} from "react-icons/fa";
import getBaseUrl from "../../untils/baseURL";
import { useTheme } from "../../context/ThemeContext";

const MyFinalExam = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [showAnswers, setShowAnswers] = useState({});

  useEffect(() => {
    fetchFinalExamResults();
  }, []);

  const fetchFinalExamResults = async () => {
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${getBaseUrl()}/api/students/my-final-results`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch");
      }

      const data = await response.json();
      setResults(data.results || []);
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

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-slate-900" : "bg-blue-50"
        }`}
      >
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-yellow-500 mx-auto mb-4" />
          <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
            กำลังโหลดข้อมูล...
          </p>
        </div>
      </div>
    );
  }

  // Get the latest result (most recent attempt)
  const result = results[0];

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
              <FaTrophy className="text-yellow-500" />
              Final Exam
            </h1>
            <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}></p>
          </div>
        </div>

        {/* No Results */}
        {!result ? (
          <div
            className={`rounded-2xl p-8 text-center shadow-lg ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            <FaTrophy
              className={`text-6xl mx-auto mb-4 opacity-20 ${
                isDarkMode ? "text-slate-500" : "text-gray-400"
              }`}
            />
            <p
              className={`text-lg mb-2 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              ยังไม่มีผลสอบ Final Exam
            </p>
            <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
              เรียนให้ครบทุกบทแล้วมาทำ Final Exam นะ!
            </p>
          </div>
        ) : (
          <div
            className={`rounded-2xl overflow-hidden shadow-lg ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            {/* Result Header */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      result.passed
                        ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                        : isDarkMode
                        ? "bg-slate-700"
                        : "bg-gray-200"
                    }`}
                  >
                    <FaTrophy
                      className={`text-3xl ${
                        result.passed ? "text-white" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`font-bold text-xl ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Final Exam
                    </h3>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-slate-400" : "text-gray-500"
                      }`}
                    >
                      ทำเมื่อ: {formatDate(result.submittedAt)}
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p
                    className={`text-3xl font-bold ${
                      result.passed ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {result.percentage}%
                  </p>
                  <div className="flex items-center gap-1 text-sm justify-end">
                    {result.passed ? (
                      <>
                        <FaCheckCircle className="text-green-500" />
                        <span className="text-green-500 font-medium">ผ่าน</span>
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="text-red-500" />
                        <span className="text-red-500 font-medium">
                          ไม่ผ่าน
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div
                  className={`p-4 rounded-xl text-center ${
                    isDarkMode ? "bg-slate-700/50" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-2xl font-bold ${
                      result.passed ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {result.percentage}%
                  </p>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    คะแนน
                  </p>
                </div>
                <div
                  className={`p-4 rounded-xl text-center ${
                    isDarkMode ? "bg-slate-700/50" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-lg font-medium ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {result.score}/{result.totalPoints}
                  </p>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    ได้/เต็ม
                  </p>
                </div>
                <div
                  className={`p-4 rounded-xl text-center ${
                    isDarkMode ? "bg-slate-700/50" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-lg font-medium ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {result.answers?.length || 0}
                  </p>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    จำนวนข้อ
                  </p>
                </div>
              </div>

              {/* Answers Toggle */}
              {result.answers && result.answers.length > 0 && (
                <div className="space-y-3">
                  <button
                    onClick={() =>
                      setShowAnswers((prev) => ({
                        ...prev,
                        [result._id]: !prev[result._id],
                      }))
                    }
                    className={`w-full py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                      isDarkMode
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {showAnswers[result._id] ? "ซ่อนคำตอบ" : "ดูคำตอบทั้งหมด"} (
                    {result.answers.length} ข้อ)
                  </button>

                  {showAnswers[result._id] && (
                    <div className="space-y-3 mt-4">
                      {result.answers.map((answer, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg flex items-center gap-3 ${
                            answer.isCorrect
                              ? isDarkMode
                                ? "bg-green-900/30 border border-green-500/30"
                                : "bg-green-50 border border-green-200"
                              : isDarkMode
                              ? "bg-red-900/30 border border-red-500/30"
                              : "bg-red-50 border border-red-200"
                          }`}
                        >
                          {/* Question Number */}
                          <span
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              answer.isCorrect
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {idx + 1}
                          </span>

                          {/* Question Text */}
                          <p
                            className={`flex-1 text-sm ${
                              isDarkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {answer.questionText || `ข้อที่ ${idx + 1}`}
                          </p>

                          {/* Correct/Incorrect Icon */}
                          <div className="flex items-center gap-2">
                            {answer.isCorrect ? (
                              <div className="flex items-center gap-1 text-green-500">
                                <FaCheckCircle className="text-lg" />
                                <span className="text-sm font-medium">ถูก</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-red-500">
                                <FaTimesCircle className="text-lg" />
                                <span className="text-sm font-medium">ผิด</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFinalExam;
