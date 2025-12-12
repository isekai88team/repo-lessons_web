import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaClipboardList,
  FaFileAlt,
  FaBook,
  FaPlus,
  FaSpinner,
  FaChevronRight,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import {
  useFetchAllSubjectsQuery,
  useFetchFinalExamBySubjectQuery,
} from "../../redux/features/admin/adminApi";

const QuizBank = () => {
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const { data: subjectsData, isLoading } = useFetchAllSubjectsQuery();

  const subjects = subjectsData?.subjects || [];

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <FaSpinner
          className="animate-spin text-4xl"
          style={{ color: colors.primary }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6 lg:p-10 font-sans transition-colors"
      style={{
        backgroundColor: isDarkMode
          ? colors.background
          : `${colors.background}50`,
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#8B5CF620" }}
          >
            <FaClipboardList className="text-xl" style={{ color: "#8B5CF6" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              คลังข้อสอบ
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              จัดการข้อสอบ Final Exam ของแต่ละวิชา
            </p>
          </div>
        </div>
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <SubjectCard
            key={subject._id}
            subject={subject}
            isDarkMode={isDarkMode}
            colors={colors}
            navigate={navigate}
          />
        ))}
      </div>

      {subjects.length === 0 && (
        <div
          className="text-center py-20"
          style={{ color: colors.textSecondary }}
        >
          <FaBook className="text-5xl mx-auto mb-4 opacity-30" />
          <p className="mb-4">ยังไม่มีรายวิชา</p>
          <Link
            to="/admin/add-subject"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ backgroundColor: colors.primary, color: "#FFF" }}
          >
            <FaPlus /> เพิ่มรายวิชา
          </Link>
        </div>
      )}
    </div>
  );
};

// SubjectCard component with Final Exam status
const SubjectCard = ({ subject, isDarkMode, colors, navigate }) => {
  const { data: finalExamData, isLoading } = useFetchFinalExamBySubjectQuery(
    subject._id
  );

  const hasFinalExam = !!finalExamData?.finalExam;
  const finalExam = finalExamData?.finalExam;

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-lg transition-all hover:shadow-xl"
      style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.border}30`,
      }}
    >
      {/* Header */}
      <div
        className="p-4 border-b"
        style={{ borderColor: `${colors.border}30` }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#8B5CF620" }}
          >
            <FaBook className="text-lg" style={{ color: "#8B5CF6" }} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold" style={{ color: colors.text }}>
              {subject.subject_name}
            </h3>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              {subject.code}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <FaSpinner
              className="animate-spin"
              style={{ color: colors.textSecondary }}
            />
          </div>
        ) : hasFinalExam ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <FaCheck className="text-green-500" />
              <span style={{ color: colors.text }}>มี Final Exam แล้ว</span>
            </div>
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(255,255,255,0.05)"
                  : "#F5F6F7",
              }}
            >
              <p style={{ color: colors.text }} className="font-medium mb-1">
                {finalExam.title}
              </p>
              <div
                className="flex gap-4 text-xs"
                style={{ color: colors.textSecondary }}
              >
                <span>📝 {finalExam.questions?.length || 0} ข้อ</span>
                <span>⏱️ {finalExam.duration} นาที</span>
                <span>🎯 {finalExam.passingScore}%</span>
              </div>
            </div>
            <button
              onClick={() =>
                navigate(`/admin/create-final-exam/${subject._id}`)
              }
              className="w-full py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(139,92,246,0.2)"
                  : "#8B5CF620",
                color: "#8B5CF6",
              }}
            >
              <FaFileAlt /> แก้ไข Final Exam
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <FaTimes className="text-gray-400" />
              <span style={{ color: colors.textSecondary }}>
                ยังไม่มี Final Exam
              </span>
            </div>
            <button
              onClick={() =>
                navigate(`/admin/create-final-exam/${subject._id}`)
              }
              className="w-full py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition"
              style={{
                backgroundColor: "#F59E0B",
                color: "#FFF",
              }}
            >
              <FaPlus /> สร้าง Final Exam
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-3 border-t flex items-center justify-between"
        style={{ borderColor: `${colors.border}30` }}
      >
        <Link
          to={`/admin/subject/${subject._id}`}
          className="text-xs font-medium flex items-center gap-1"
          style={{ color: colors.primary }}
        >
          ดูรายละเอียดวิชา <FaChevronRight className="text-[10px]" />
        </Link>
      </div>
    </div>
  );
};

export default QuizBank;
