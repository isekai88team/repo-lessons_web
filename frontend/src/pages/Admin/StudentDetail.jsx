import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useFetchStudentProgressQuery,
  useFetchStudentByIdQuery,
  useFetchStudentWorksheetSubmissionsQuery,
} from "../../redux/features/admin/adminApi";
import {
  FaUserGraduate,
  FaArrowLeft,
  FaPlay,
  FaClipboardList,
  FaClipboardCheck,
  FaTrophy,
  FaCheckCircle,
  FaFileAlt,
  FaChevronDown,
  FaChevronUp,
  FaEnvelope,
  FaPhone,
  FaSchool,
  FaUsers,
  FaTimesCircle,
  FaClock,
  FaCheck,
  FaHourglassHalf,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import {
  PageSkeleton,
  DetailHeaderSkeleton,
  CardListSkeleton,
} from "../../components/Admin/SkeletonLoader";

const StudentDetail = () => {
  const { id: studentId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();

  const { data: progressData, isLoading } =
    useFetchStudentProgressQuery(studentId);
  const { data: studentData } = useFetchStudentByIdQuery(studentId);
  const { data: worksheetsData } =
    useFetchStudentWorksheetSubmissionsQuery(studentId);

  const [expandedChapters, setExpandedChapters] = useState(true);
  const [expandedWorksheets, setExpandedWorksheets] = useState(true);

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

  const pretestCompleted = allChapters.filter(
    (c) => c.progress?.pretestCompleted || c.lastPretestResult
  ).length;

  const posttestCompleted = allChapters.filter(
    (c) => c.progress?.posttestCompleted || c.lastPosttestResult
  ).length;

  const pretestAvg =
    pretestCompleted > 0
      ? Math.round(
          allChapters
            .filter((c) => c.progress?.pretestCompleted || c.lastPretestResult)
            .reduce(
              (sum, c) =>
                sum +
                (c.lastPretestResult?.percentage ||
                  c.progress?.pretestPercentage ||
                  0),
              0
            ) / pretestCompleted
        )
      : 0;

  const posttestAvg =
    posttestCompleted > 0
      ? Math.round(
          allChapters
            .filter(
              (c) => c.progress?.posttestCompleted || c.lastPosttestResult
            )
            .reduce(
              (sum, c) =>
                sum +
                (c.lastPosttestResult?.percentage ||
                  c.progress?.posttestPercentage ||
                  0),
              0
            ) / posttestCompleted
        )
      : 0;

  // Worksheet stats
  const submittedWorksheets = worksheets.filter((ws) => ws.submission).length;
  const approvedWorksheets = worksheets.filter(
    (ws) => ws.submission?.status === "approved"
  ).length;

  if (isLoading) {
    return (
      <PageSkeleton>
        <DetailHeaderSkeleton />
        <CardListSkeleton count={4} />
      </PageSkeleton>
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
          className="mt-4 px-4 py-2 rounded-xl cursor-pointer"
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return {
          bg: "#22C55E20",
          color: "#22C55E",
          text: "ผ่าน",
          icon: FaCheck,
        };
      case "rejected":
        return {
          bg: "#EF444420",
          color: "#EF4444",
          text: "ไม่ผ่าน",
          icon: FaTimesCircle,
        };
      case "graded":
        return {
          bg: "#3B82F620",
          color: "#3B82F6",
          text: "ตรวจแล้ว",
          icon: FaCheckCircle,
        };
      case "submitted":
        return {
          bg: "#F59E0B20",
          color: "#F59E0B",
          text: "รอตรวจ",
          icon: FaHourglassHalf,
        };
      default:
        return {
          bg: `${colors.border}30`,
          color: colors.textSecondary,
          text: "ยังไม่ส่ง",
          icon: FaClock,
        };
    }
  };

  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-10 font-sans transition-colors"
      style={{
        backgroundColor: isDarkMode
          ? colors.background
          : `${colors.background}50`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-3 rounded-xl shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            backgroundColor: colors.cardBg,
            color: colors.textSecondary,
          }}
        >
          <FaArrowLeft />
        </button>
        <div className="flex-1">
          <h1
            className="text-xl md:text-2xl font-bold flex items-center gap-3"
            style={{ color: colors.text }}
          >
            <FaUserGraduate style={{ color: "#8B5CF6" }} />
            ข้อมูลนักเรียน
          </h1>
        </div>
      </div>

      {/* Student Info Card */}
      <div
        className="rounded-2xl p-4 md:p-6 mb-6"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}30`,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden flex-shrink-0"
            style={{ backgroundColor: "#8B5CF620", color: "#8B5CF6" }}
          >
            {student.profileImage ? (
              <img
                src={student.profileImage}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                {student.firstName?.[0]}
                {student.lastName?.[0]}
              </>
            )}
          </div>

          {/* Student Info */}
          <div className="flex-1">
            <h2
              className="text-xl font-bold mb-1"
              style={{ color: colors.text }}
            >
              {student.firstName} {student.lastName}
            </h2>
            <p className="text-sm mb-2" style={{ color: colors.textSecondary }}>
              @{student.username}
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              {student.classRoom && (
                <span
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
                  style={{ backgroundColor: "#8B5CF620", color: "#8B5CF6" }}
                >
                  <FaSchool className="text-xs" />
                  {student.classRoom}
                </span>
              )}
              {student.email && (
                <span
                  className="flex items-center gap-1.5"
                  style={{ color: colors.textSecondary }}
                >
                  <FaEnvelope className="text-xs" />
                  {student.email}
                </span>
              )}
              {student.phone && (
                <span
                  className="flex items-center gap-1.5"
                  style={{ color: colors.textSecondary }}
                >
                  <FaPhone className="text-xs" />
                  {student.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Video */}
          <div
            className="p-3 rounded-xl text-center"
            style={{
              backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <FaPlay style={{ color: "#3B82F6" }} className="text-sm" />
              <span className="text-xl font-bold" style={{ color: "#3B82F6" }}>
                {videoWatched}/{allChapters.length}
              </span>
            </div>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              วิดีโอ
            </p>
          </div>

          {/* Pretest */}
          <div
            className="p-3 rounded-xl text-center"
            style={{
              backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <FaClipboardList
                style={{ color: "#F59E0B" }}
                className="text-sm"
              />
              <span
                className="text-xl font-bold"
                style={{ color: getScoreColor(pretestAvg) }}
              >
                {pretestAvg}%
              </span>
            </div>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              Pretest ({pretestCompleted}/{allChapters.length})
            </p>
          </div>

          {/* Posttest */}
          <div
            className="p-3 rounded-xl text-center"
            style={{
              backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <FaClipboardCheck
                style={{ color: "#22C55E" }}
                className="text-sm"
              />
              <span
                className="text-xl font-bold"
                style={{ color: getScoreColor(posttestAvg) }}
              >
                {posttestAvg}%
              </span>
            </div>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              Posttest ({posttestCompleted}/{allChapters.length})
            </p>
          </div>

          {/* Final */}
          <div
            className="p-3 rounded-xl text-center"
            style={{
              backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <FaTrophy style={{ color: "#8B5CF6" }} className="text-sm" />
              <span
                className="text-xl font-bold"
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

          {/* Worksheets */}
          <div
            className="p-3 rounded-xl text-center"
            style={{
              backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <FaFileAlt style={{ color: "#EC4899" }} className="text-sm" />
              <span className="text-xl font-bold" style={{ color: "#EC4899" }}>
                {approvedWorksheets}/{worksheets.length}
              </span>
            </div>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              ใบงานผ่าน
            </p>
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}30`,
        }}
      >
        <div
          className="p-4 flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
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
            {allChapters.length === 0 ? (
              <p
                className="text-center py-8"
                style={{ color: colors.textSecondary }}
              >
                ยังไม่มีบทเรียน
              </p>
            ) : (
              allChapters.map((chapter, idx) => {
                const pretestResult = chapter.lastPretestResult;
                const posttestResult = chapter.lastPosttestResult;

                return (
                  <div
                    key={chapter._id}
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: isDarkMode
                        ? colors.background
                        : "#F8F9FA",
                      border: `1px solid ${colors.border}20`,
                    }}
                  >
                    {/* Chapter Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
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
                          className="font-medium truncate"
                          style={{ color: colors.text }}
                        >
                          {chapter.chapter_name}
                        </span>
                      </div>

                      {/* Video Badge */}
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
                    </div>

                    {/* Test Results */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Pretest */}
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: isDarkMode ? colors.cardBg : "#FFF",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <FaClipboardList
                            style={{ color: "#F59E0B" }}
                            className="text-sm"
                          />
                          <span
                            className="text-sm font-medium"
                            style={{ color: colors.text }}
                          >
                            Pretest
                          </span>
                        </div>
                        {pretestResult ? (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="text-lg font-bold"
                                style={{
                                  color: getScoreColor(
                                    pretestResult.percentage
                                  ),
                                }}
                              >
                                {pretestResult.percentage}%
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  pretestResult.passed
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {pretestResult.passed ? "ผ่าน" : "ไม่ผ่าน"}
                              </span>
                            </div>
                            <p
                              className="text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              {pretestResult.score}/{pretestResult.totalPoints}{" "}
                              คะแนน
                            </p>
                          </div>
                        ) : (
                          <p
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            ยังไม่ได้ทำ
                          </p>
                        )}
                      </div>

                      {/* Posttest */}
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: isDarkMode ? colors.cardBg : "#FFF",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <FaClipboardCheck
                            style={{ color: "#22C55E" }}
                            className="text-sm"
                          />
                          <span
                            className="text-sm font-medium"
                            style={{ color: colors.text }}
                          >
                            Posttest
                          </span>
                        </div>
                        {posttestResult ? (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="text-lg font-bold"
                                style={{
                                  color: getScoreColor(
                                    posttestResult.percentage
                                  ),
                                }}
                              >
                                {posttestResult.percentage}%
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  posttestResult.passed
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {posttestResult.passed ? "ผ่าน" : "ไม่ผ่าน"}
                              </span>
                            </div>
                            <p
                              className="text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              {posttestResult.score}/
                              {posttestResult.totalPoints} คะแนน
                            </p>
                          </div>
                        ) : (
                          <p
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            ยังไม่ได้ทำ
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Final Exam Section */}
      {finalExam && (
        <div
          className="rounded-2xl p-4 md:p-6 mb-6"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}30`,
          }}
        >
          <h2
            className="font-bold flex items-center gap-2 mb-4"
            style={{ color: colors.text }}
          >
            <FaTrophy style={{ color: "#8B5CF6" }} />
            Final Exam
          </h2>

          {finalExam.result ? (
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
              }}
            >
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <span
                    className="text-3xl font-bold"
                    style={{
                      color: getScoreColor(finalExam.result.percentage),
                    }}
                  >
                    {finalExam.result.percentage}%
                  </span>
                  <p
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {finalExam.result.score}/{finalExam.result.totalPoints}{" "}
                    คะแนน
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    finalExam.result.passed
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {finalExam.result.passed ? "✓ ผ่าน" : "✗ ไม่ผ่าน"}
                </span>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  ทำเมื่อ:{" "}
                  {new Date(finalExam.result.submittedAt).toLocaleDateString(
                    "th-TH"
                  )}
                </p>
              </div>
            </div>
          ) : (
            <p style={{ color: colors.textSecondary }}>
              ยังไม่ได้ทำ Final Exam
            </p>
          )}
        </div>
      )}

      {/* Worksheets Section */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}30`,
        }}
      >
        <div
          className="p-4 flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setExpandedWorksheets(!expandedWorksheets)}
          style={{
            borderBottom: expandedWorksheets
              ? `1px solid ${colors.border}30`
              : "none",
          }}
        >
          <h2
            className="font-bold flex items-center gap-2"
            style={{ color: colors.text }}
          >
            <FaFileAlt style={{ color: "#EC4899" }} />
            ใบงาน ({submittedWorksheets}/{worksheets.length} ส่งแล้ว)
          </h2>
          {expandedWorksheets ? (
            <FaChevronUp style={{ color: colors.textSecondary }} />
          ) : (
            <FaChevronDown style={{ color: colors.textSecondary }} />
          )}
        </div>

        {expandedWorksheets && (
          <div className="p-4 space-y-3">
            {worksheets.length === 0 ? (
              <p
                className="text-center py-8"
                style={{ color: colors.textSecondary }}
              >
                ยังไม่มีใบงานในระบบ
              </p>
            ) : (
              worksheets.map((ws) => {
                const status = getStatusBadge(ws.submission?.status);
                const StatusIcon = status.icon;

                return (
                  <div
                    key={ws._id}
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: isDarkMode
                        ? colors.background
                        : "#F8F9FA",
                      border: `1px solid ${colors.border}20`,
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      {/* Worksheet Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="font-medium truncate"
                            style={{ color: colors.text }}
                          >
                            {ws.title}
                          </span>
                          <span
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: status.bg,
                              color: status.color,
                            }}
                          >
                            <StatusIcon className="text-[10px]" />
                            {status.text}
                          </span>
                        </div>

                        {ws.chapter && (
                          <p
                            className="text-xs mb-2"
                            style={{ color: colors.textSecondary }}
                          >
                            บท: {ws.chapter.chapter_name}
                          </p>
                        )}

                        {/* Team Members */}
                        {ws.submission &&
                          ws.submission.teamMembers?.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <FaUsers
                                className="text-xs"
                                style={{ color: colors.textSecondary }}
                              />
                              <div className="flex items-center gap-1 flex-wrap">
                                {/* Submitter */}
                                <span
                                  className="text-xs px-2 py-0.5 rounded"
                                  style={{
                                    backgroundColor: "#8B5CF620",
                                    color: "#8B5CF6",
                                  }}
                                >
                                  {ws.submission.submitter?.firstName}{" "}
                                  {ws.submission.submitter?.lastName}
                                </span>
                                {/* Team Members */}
                                {ws.submission.teamMembers.map((member) => (
                                  <span
                                    key={member._id}
                                    className="text-xs px-2 py-0.5 rounded"
                                    style={{
                                      backgroundColor: `${colors.border}40`,
                                      color: colors.text,
                                    }}
                                  >
                                    {member.firstName} {member.lastName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Score & Date */}
                      <div className="text-right">
                        {ws.submission?.score !== undefined &&
                          ws.submission?.score !== null && (
                            <p
                              className="text-lg font-bold"
                              style={{
                                color: getScoreColor(
                                  (ws.submission.score / 10) * 100
                                ),
                              }}
                            >
                              {ws.submission.score} คะแนน
                            </p>
                          )}
                        {ws.submission?.submittedAt && (
                          <p
                            className="text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            ส่งเมื่อ:{" "}
                            {new Date(
                              ws.submission.submittedAt
                            ).toLocaleDateString("th-TH")}
                          </p>
                        )}
                        {ws.deadline && !ws.submission && (
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

                    {/* Feedback */}
                    {ws.submission?.feedback && (
                      <div
                        className="mt-3 p-3 rounded-lg text-sm"
                        style={{
                          backgroundColor: isDarkMode ? colors.cardBg : "#FFF",
                          border: `1px solid ${colors.border}30`,
                        }}
                      >
                        <p
                          className="text-xs mb-1 font-medium"
                          style={{ color: colors.textSecondary }}
                        >
                          Feedback:
                        </p>
                        <p style={{ color: colors.text }}>
                          {ws.submission.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetail;
