import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaClipboardList,
  FaClipboardCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaArrowLeft,
  FaChevronDown,
  FaChevronUp,
  FaBook,
} from "react-icons/fa";
import getBaseUrl from "../../untils/baseURL";
import { useTheme } from "../../context/ThemeContext";

const MyTests = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [grouped, setGrouped] = useState([]);
  const [filter, setFilter] = useState("all"); // all, pretest, posttest
  const [expandedChapter, setExpandedChapter] = useState(null);

  useEffect(() => {
    fetchTestResults();
  }, []);

  const fetchTestResults = async () => {
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${getBaseUrl()}/api/students/my-tests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch test results");
      }

      const data = await response.json();
      setGrouped(data.grouped || []);
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

  const getScoreColor = (percentage, passed) => {
    if (passed) return "text-green-500";
    if (percentage >= 50) return "text-amber-500";
    return "text-red-500";
  };

  // Filter and sort grouped results (sort by chapter name ascending)
  const filteredGrouped = grouped
    .filter((item) => {
      if (filter === "all") return item.pretest || item.posttest;
      if (filter === "pretest") return item.pretest;
      if (filter === "posttest") return item.posttest;
      return true;
    })
    .sort((a, b) => {
      const nameA = a.chapter?.chapter_name || "";
      const nameB = b.chapter?.chapter_name || "";
      return nameA.localeCompare(nameB, "th", { numeric: true });
    });

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
              <FaClipboardList className="text-blue-500" />
              ผลการทดสอบ
            </h1>
            <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
              ดูรายละเอียด Pretest และ Posttest ที่ทำไปแล้ว
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          className={`flex gap-2 mb-6 p-1 rounded-xl ${
            isDarkMode ? "bg-slate-800" : "bg-white shadow-md"
          }`}
        >
          {[
            { key: "all", label: "ทั้งหมด" },
            { key: "pretest", label: "Pretest" },
            { key: "posttest", label: "Posttest" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition cursor-pointer ${
                filter === tab.key
                  ? "bg-blue-500 text-white"
                  : isDarkMode
                  ? "text-slate-400 hover:bg-slate-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        {filteredGrouped.length === 0 ? (
          <div
            className={`rounded-2xl p-8 text-center ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            <FaClipboardList
              className={`text-5xl mx-auto mb-4 opacity-20 ${
                isDarkMode ? "text-slate-500" : "text-gray-400"
              }`}
            />
            <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
              ยังไม่มีผลการทดสอบ
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGrouped.map((item, index) => (
              <div
                key={item.chapter?._id || index}
                className={`rounded-2xl overflow-hidden shadow-lg ${
                  isDarkMode ? "bg-slate-800" : "bg-white"
                }`}
              >
                {/* Chapter Header */}
                <div
                  className={`p-4 cursor-pointer transition ${
                    isDarkMode ? "hover:bg-slate-700/50" : "hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    setExpandedChapter(
                      expandedChapter === item.chapter?._id
                        ? null
                        : item.chapter?._id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isDarkMode ? "bg-blue-500/20" : "bg-blue-100"
                        }`}
                      >
                        <FaBook className="text-blue-500" />
                      </div>
                      <div>
                        <h3
                          className={`font-bold ${
                            isDarkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {item.chapter?.chapter_name || "ไม่ระบุบท"}
                        </h3>
                      </div>
                    </div>

                    {/* Quick Summary */}
                    <div className="flex items-center gap-4">
                      {/* Pretest Badge */}
                      {item.pretest &&
                        (filter === "all" || filter === "pretest") && (
                          <div
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                              item.pretest.passed
                                ? "bg-green-500/20 text-green-500"
                                : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            <FaClipboardList className="text-xs" />
                            <span>{item.pretest.percentage}%</span>
                          </div>
                        )}
                      {/* Posttest Badge */}
                      {item.posttest &&
                        (filter === "all" || filter === "posttest") && (
                          <div
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                              item.posttest.passed
                                ? "bg-green-500/20 text-green-500"
                                : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            <FaClipboardCheck className="text-xs" />
                            <span>{item.posttest.percentage}%</span>
                          </div>
                        )}
                      {/* Chevron */}
                      <div
                        className={
                          isDarkMode ? "text-slate-400" : "text-gray-400"
                        }
                      >
                        {expandedChapter === item.chapter?._id ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedChapter === item.chapter?._id && (
                  <div
                    className={`border-t p-4 space-y-4 ${
                      isDarkMode ? "border-slate-700" : "border-gray-100"
                    }`}
                  >
                    {/* Pretest Result */}
                    {item.pretest &&
                      (filter === "all" || filter === "pretest") && (
                        <TestResultCard
                          title="Pretest (ก่อนเรียน)"
                          icon={<FaClipboardList />}
                          result={item.pretest}
                          isDarkMode={isDarkMode}
                          formatDate={formatDate}
                          getScoreColor={getScoreColor}
                        />
                      )}

                    {/* Posttest Result */}
                    {item.posttest &&
                      (filter === "all" || filter === "posttest") && (
                        <TestResultCard
                          title="Posttest (หลังเรียน)"
                          icon={<FaClipboardCheck />}
                          result={item.posttest}
                          isDarkMode={isDarkMode}
                          formatDate={formatDate}
                          getScoreColor={getScoreColor}
                        />
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Test Result Card Component
const TestResultCard = ({
  title,
  icon,
  result,
  isDarkMode,
  formatDate,
  getScoreColor,
}) => {
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <div
      className={`rounded-xl p-4 ${
        isDarkMode ? "bg-slate-700/50" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-blue-500">{icon}</span>
          <span
            className={`font-medium ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {result.passed ? (
            <span className="flex items-center gap-1 text-green-500 text-sm">
              <FaCheckCircle />
              ผ่าน
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-500 text-sm">
              <FaTimesCircle />
              ไม่ผ่าน
            </span>
          )}
        </div>
      </div>

      {/* Score Stats */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="text-center">
          <p
            className={`text-2xl font-bold ${getScoreColor(
              result.percentage,
              result.passed
            )}`}
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
        <div className="text-center">
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
        <div className="text-center">
          <p
            className={`text-sm ${
              isDarkMode ? "text-slate-300" : "text-gray-700"
            }`}
          >
            {formatDate(result.submittedAt)}
          </p>
          <p
            className={`text-xs ${
              isDarkMode ? "text-slate-400" : "text-gray-500"
            }`}
          >
            ทำเมื่อ
          </p>
        </div>
      </div>

      {/* Toggle Answers */}
      {result.answers && result.answers.length > 0 && (
        <>
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className={`w-full py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              isDarkMode
                ? "bg-slate-600 text-slate-300 hover:bg-slate-500"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {showAnswers ? "ซ่อนคำตอบ" : "ดูคำตอบทั้งหมด"} (
            {result.answers.length} ข้อ)
          </button>

          {/* Answers List */}
          {showAnswers && (
            <div className="mt-4 space-y-3">
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
        </>
      )}
    </div>
  );
};

export default MyTests;
