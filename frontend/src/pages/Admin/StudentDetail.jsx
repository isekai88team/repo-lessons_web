import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useFetchStudentProgressQuery,
  useFetchStudentByIdQuery,
  useFetchAllWorksheetsQuery,
} from "../../redux/features/admin/adminApi";
import {
  FaUserGraduate,
  FaSpinner,
  FaArrowLeft,
  FaPlay,
  FaClipboardList,
  FaClipboardCheck,
  FaTrophy,
  FaCheckCircle,
  FaFileAlt,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const StudentDetail = () => {
  const { id: studentId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();

  const { data: progressData, isLoading } =
    useFetchStudentProgressQuery(studentId);
  const { data: studentData } = useFetchStudentByIdQuery(studentId);
  const { data: worksheetsData } = useFetchAllWorksheetsQuery();

  const [expandedChapters, setExpandedChapters] = useState(true);

  const student = progressData?.student || studentData?.student;
  const subjects = progressData?.subjects || [];
  const worksheets = worksheetsData?.worksheets || [];

  // Get all chapters from all subjects (assuming single subject)
  const allChapters = subjects.length > 0 ? subjects[0]?.chapters || [] : [];
  const finalExam = subjects.length > 0 ? subjects[0]?.finalExam : null;

  // Calculate stats
  const videoWatched = allChapters.filter(
    (c) => c.progress?.videoWatched
  ).length;
  const pretestAvg =
    allChapters.filter((c) => c.progress?.pretestCompleted).length > 0
      ? Math.round(
          allChapters
            .filter((c) => c.progress?.pretestCompleted)
            .reduce((sum, c) => sum + (c.progress?.pretestPercentage || 0), 0) /
            allChapters.filter((c) => c.progress?.pretestCompleted).length
        )
      : 0;
  const posttestAvg =
    allChapters.filter((c) => c.progress?.posttestCompleted).length > 0
      ? Math.round(
          allChapters
            .filter((c) => c.progress?.posttestCompleted)
            .reduce(
              (sum, c) => sum + (c.progress?.posttestPercentage || 0),
              0
            ) / allChapters.filter((c) => c.progress?.posttestCompleted).length
        )
      : 0;

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: colors.background }}
      >
        <FaSpinner
          className="animate-spin text-5xl"
          style={{ color: "#8B5CF6" }}
        />
      </div>
    );
  }

  if (!student) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen"
        style={{
          backgroundColor: colors.background,
          color: colors.textSecondary,
        }}
      >
        <FaUserGraduate className="text-5xl mb-4 opacity-20" />
        <p>ไม่พบข้อมูลนักเรียน</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 rounded-xl"
          style={{ backgroundColor: "#8B5CF6", color: "#FFF" }}
        >
          กลับ
        </button>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "#22C55E";
    if (score >= 50) return "#F59E0B";
    return "#EF4444";
  };

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
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-3 rounded-xl shadow-sm"
          style={{
            backgroundColor: colors.cardBg,
            color: colors.textSecondary,
          }}
        >
          <FaArrowLeft />
        </button>
        <div className="flex-1">
          <h1
            className="text-2xl font-bold flex items-center gap-3"
            style={{ color: colors.text }}
          >
            <FaUserGraduate style={{ color: "#8B5CF6" }} />
            ข้อมูลนักเรียน
          </h1>
        </div>
      </div>

      {/* Student Info Card */}
      <div
        className="rounded-2xl p-6 mb-8"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}30`,
        }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ backgroundColor: "#8B5CF620", color: "#8B5CF6" }}
          >
            {student.firstName?.[0]}
            {student.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: colors.text }}>
              {student.firstName} {student.lastName}
            </h2>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              @{student.username} • ห้อง {student.classRoom}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Video */}
          <div
            className="p-4 rounded-xl text-center"
            style={{
              backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <FaPlay style={{ color: "#3B82F6" }} />
              <span className="text-2xl font-bold" style={{ color: "#3B82F6" }}>
                {videoWatched}/{allChapters.length}
              </span>
            </div>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              วิดีโอที่ดู
            </p>
          </div>

          {/* Pretest */}
          <div
            className="p-4 rounded-xl text-center"
            style={{
              backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <FaClipboardList style={{ color: "#F59E0B" }} />
              <span
                className="text-2xl font-bold"
                style={{ color: getScoreColor(pretestAvg) }}
              >
                {pretestAvg}%
              </span>
            </div>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              Pretest เฉลี่ย
            </p>
          </div>

          {/* Posttest */}
          <div
            className="p-4 rounded-xl text-center"
            style={{
              backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <FaClipboardCheck style={{ color: "#22C55E" }} />
              <span
                className="text-2xl font-bold"
                style={{ color: getScoreColor(posttestAvg) }}
              >
                {posttestAvg}%
              </span>
            </div>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              Posttest เฉลี่ย
            </p>
          </div>

          {/* Final */}
          <div
            className="p-4 rounded-xl text-center"
            style={{
              backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <FaTrophy style={{ color: "#8B5CF6" }} />
              <span
                className="text-2xl font-bold"
                style={{
                  color: finalExam?.result
                    ? getScoreColor(finalExam.result.percentage)
                    : colors.textSecondary,
                }}
              >
                {finalExam?.result ? `${finalExam.result.percentage}%` : "-"}
              </span>
            </div>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              Final Exam
            </p>
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <div
        className="rounded-2xl overflow-hidden mb-8"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}30`,
        }}
      >
        <div
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedChapters(!expandedChapters)}
          style={{
            borderBottom: expandedChapters
              ? `1px solid ${colors.border}30`
              : "none",
          }}
        >
          <h2
            className="font-bold flex items-center gap-2"
            style={{ color: colors.text }}
          >
            <FaPlay style={{ color: "#3B82F6" }} />
            รายละเอียดบทเรียน ({allChapters.length} บท)
          </h2>
          {expandedChapters ? (
            <FaChevronUp style={{ color: colors.textSecondary }} />
          ) : (
            <FaChevronDown style={{ color: colors.textSecondary }} />
          )}
        </div>

        {expandedChapters && (
          <div className="p-4 space-y-3">
            {allChapters.map((chapter, idx) => (
              <div
                key={chapter._id}
                className="p-4 rounded-xl flex flex-wrap items-center justify-between gap-3"
                style={{
                  backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
                  border: `1px solid ${colors.border}20`,
                }}
              >
                {/* Chapter Name */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{
                      backgroundColor: chapter.progress?.isCompleted
                        ? "#22C55E"
                        : `${colors.border}40`,
                      color: chapter.progress?.isCompleted
                        ? "#FFF"
                        : colors.textSecondary,
                    }}
                  >
                    {chapter.progress?.isCompleted ? (
                      <FaCheckCircle className="text-sm" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className="text-sm font-medium truncate"
                    style={{ color: colors.text }}
                  >
                    {chapter.chapter_name}
                  </span>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Video */}
                  <div
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: chapter.progress?.videoWatched
                        ? "#3B82F620"
                        : `${colors.border}30`,
                      color: chapter.progress?.videoWatched
                        ? "#3B82F6"
                        : colors.textSecondary,
                    }}
                  >
                    <FaPlay className="text-[10px]" />
                    {chapter.progress?.videoProgress || 0}%
                  </div>

                  {/* Pretest */}
                  <div
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: chapter.progress?.pretestCompleted
                        ? chapter.progress?.pretestPassed
                          ? "#22C55E20"
                          : "#EF444420"
                        : `${colors.border}30`,
                      color: chapter.progress?.pretestCompleted
                        ? chapter.progress?.pretestPassed
                          ? "#22C55E"
                          : "#EF4444"
                        : colors.textSecondary,
                    }}
                  >
                    <FaClipboardList className="text-[10px]" />
                    {chapter.progress?.pretestCompleted
                      ? `${chapter.progress?.pretestPercentage || 0}%`
                      : "-"}
                  </div>

                  {/* Posttest */}
                  <div
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: chapter.progress?.posttestCompleted
                        ? chapter.progress?.posttestPassed
                          ? "#22C55E20"
                          : "#EF444420"
                        : `${colors.border}30`,
                      color: chapter.progress?.posttestCompleted
                        ? chapter.progress?.posttestPassed
                          ? "#22C55E"
                          : "#EF4444"
                        : colors.textSecondary,
                    }}
                  >
                    <FaClipboardCheck className="text-[10px]" />
                    {chapter.progress?.posttestCompleted
                      ? `${chapter.progress?.posttestPercentage || 0}%`
                      : "-"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Worksheets Section */}
      <div
        className="rounded-2xl p-6"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}30`,
        }}
      >
        <h2
          className="font-bold flex items-center gap-2 mb-4"
          style={{ color: colors.text }}
        >
          <FaFileAlt style={{ color: "#F59E0B" }} />
          ใบงาน ({worksheets.length} ใบงาน)
        </h2>

        {worksheets.length === 0 ? (
          <p
            className="text-center py-8"
            style={{ color: colors.textSecondary }}
          >
            ยังไม่มีใบงานในระบบ
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {worksheets.map((ws) => (
              <div
                key={ws._id}
                className="p-4 rounded-xl flex items-center gap-3"
                style={{
                  backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
                  border: `1px solid ${colors.border}20`,
                }}
              >
                {/* Checkbox placeholder - will be functional when submission model exists */}
                <div
                  className="w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: "transparent",
                  }}
                >
                  {/* Will show check when submitted */}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: colors.text }}
                  >
                    {ws.title}
                  </p>
                  {ws.deadline && (
                    <p
                      className="text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      กำหนดส่ง:{" "}
                      {new Date(ws.deadline).toLocaleDateString("th-TH")}
                    </p>
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

export default StudentDetail;
