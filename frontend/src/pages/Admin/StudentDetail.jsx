import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useFetchStudentProgressQuery,
  useFetchStudentByIdQuery,
  useFetchAllSubjectsQuery,
  useEnrollStudentMutation,
  useUnenrollStudentMutation,
} from "../../redux/features/admin/adminApi";
import {
  FaUserGraduate,
  FaSpinner,
  FaArrowLeft,
  FaBook,
  FaCheckCircle,
  FaTimesCircle,
  FaPlay,
  FaFileAlt,
  FaClipboardList,
  FaClipboardCheck,
  FaTrophy,
  FaChevronDown,
  FaChevronUp,
  FaPercent,
  FaClock,
  FaPlus,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const StudentDetail = () => {
  const { id: studentId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();

  const {
    data: progressData,
    isLoading,
    refetch,
  } = useFetchStudentProgressQuery(studentId);
  const { data: studentData } = useFetchStudentByIdQuery(studentId);
  const { data: allSubjectsData } = useFetchAllSubjectsQuery();
  const [enrollStudent, { isLoading: isEnrolling }] =
    useEnrollStudentMutation();
  const [unenrollStudent, { isLoading: isUnenrolling }] =
    useUnenrollStudentMutation();

  const [expandedSubject, setExpandedSubject] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedSubjectToEnroll, setSelectedSubjectToEnroll] = useState("");

  const student = progressData?.student || studentData?.student;
  const subjects = progressData?.subjects || [];
  const allSubjects = allSubjectsData?.subjects || [];

  // Filter out already enrolled subjects
  const enrolledSubjectIds = subjects.map((s) => s.subject._id);
  const availableSubjects = allSubjects.filter(
    (s) => !enrolledSubjectIds.includes(s._id)
  );

  const handleEnroll = async () => {
    if (!selectedSubjectToEnroll) return;
    try {
      await enrollStudent({
        studentId,
        subjectId: selectedSubjectToEnroll,
      }).unwrap();
      toast.success("ลงทะเบียนวิชาสำเร็จ!");
      setShowEnrollModal(false);
      setSelectedSubjectToEnroll("");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleUnenroll = async (subjectId, subjectName) => {
    if (!window.confirm(`ยืนยันยกเลิกการลงทะเบียนวิชา ${subjectName}?`)) return;
    try {
      await unenrollStudent({ studentId, subjectId }).unwrap();
      toast.success("ยกเลิกการลงทะเบียนสำเร็จ!");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

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

  const getProgressColor = (progress) => {
    if (progress >= 80) return "#22C55E";
    if (progress >= 50) return "#F59E0B";
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
        <div className="flex items-center gap-4 mb-4">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className="p-4 rounded-xl text-center"
            style={{
              backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
            }}
          >
            <p className="text-2xl font-bold" style={{ color: "#8B5CF6" }}>
              {subjects.length}
            </p>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              วิชาที่ลงทะเบียน
            </p>
          </div>
          <div
            className="p-4 rounded-xl text-center"
            style={{
              backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
            }}
          >
            <p className="text-2xl font-bold" style={{ color: "#22C55E" }}>
              {
                subjects.filter((s) => s.enrollment.status === "completed")
                  .length
              }
            </p>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              วิชาที่เรียนจบ
            </p>
          </div>
          <div
            className="p-4 rounded-xl text-center"
            style={{
              backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
            }}
          >
            <p className="text-2xl font-bold" style={{ color: "#F59E0B" }}>
              {subjects.length > 0
                ? Math.round(
                    subjects.reduce((sum, s) => sum + s.progress, 0) /
                      subjects.length
                  )
                : 0}
              %
            </p>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              ความก้าวหน้าเฉลี่ย
            </p>
          </div>
          <div
            className="p-4 rounded-xl text-center"
            style={{
              backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
            }}
          >
            <p className="text-2xl font-bold" style={{ color: "#3B82F6" }}>
              {subjects.reduce(
                (sum, s) => sum + (s.videoWatchedChapters || 0),
                0
              )}
            </p>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              บทที่ดูวิดีโอจบ
            </p>
          </div>
        </div>
      </div>

      {/* Subjects List */}
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-bold flex items-center gap-2"
          style={{ color: colors.text }}
        >
          <FaBook className="text-purple-500" />
          วิชาที่ลงทะเบียน
        </h2>
        {availableSubjects.length > 0 && (
          <button
            onClick={() => setShowEnrollModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition"
            style={{ backgroundColor: "#8B5CF6", color: "#FFF" }}
          >
            <FaPlus /> ลงทะเบียนวิชา
          </button>
        )}
      </div>

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div
            className="rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: colors.text }}>
                ลงทะเบียนวิชาใหม่
              </h3>
              <button
                onClick={() => setShowEnrollModal(false)}
                style={{ color: colors.textSecondary }}
              >
                <FaTimes />
              </button>
            </div>
            <p className="mb-4 text-sm" style={{ color: colors.textSecondary }}>
              เลือกวิชาที่ต้องการลงทะเบียนให้ {student?.firstName}{" "}
              {student?.lastName}
            </p>
            <select
              value={selectedSubjectToEnroll}
              onChange={(e) => setSelectedSubjectToEnroll(e.target.value)}
              className="w-full p-3 rounded-xl mb-4"
              style={{
                backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
                border: `1px solid ${colors.border}`,
                color: colors.text,
              }}
            >
              <option value="">-- เลือกวิชา --</option>
              {availableSubjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.subject_name} ({s.code})
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEnrollModal(false)}
                className="flex-1 py-2 px-4 rounded-xl"
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.textSecondary,
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleEnroll}
                disabled={isEnrolling || !selectedSubjectToEnroll}
                className="flex-1 py-2 px-4 font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: "#8B5CF6", color: "#FFF" }}
              >
                {isEnrolling ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPlus />
                )}
                ลงทะเบียน
              </button>
            </div>
          </div>
        </div>
      )}

      {subjects.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}30`,
          }}
        >
          <FaBook
            className="text-5xl mx-auto mb-4 opacity-20"
            style={{ color: colors.textSecondary }}
          />
          <p style={{ color: colors.textSecondary }}>
            นักเรียนยังไม่ได้ลงทะเบียนวิชาใดๆ
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {subjects.map((subjectData) => (
            <div
              key={subjectData.subject._id}
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}30`,
              }}
            >
              {/* Subject Header */}
              <div
                className="p-4 md:p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() =>
                  setExpandedSubject(
                    expandedSubject === subjectData.subject._id
                      ? null
                      : subjectData.subject._id
                  )
                }
              >
                {/* Mobile: Stack layout */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Left side: Icon + Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#8B5CF620" }}
                    >
                      <FaBook
                        className="text-base sm:text-lg"
                        style={{ color: "#8B5CF6" }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className="font-bold text-sm sm:text-lg truncate"
                          style={{ color: colors.text }}
                        >
                          {subjectData.subject.subject_name}
                        </h3>
                        {/* Enrollment status badge */}
                        {subjectData.isEnrolled === false && (
                          <span
                            className="px-2 py-0.5 text-[10px] sm:text-xs rounded-full whitespace-nowrap"
                            style={{
                              backgroundColor: "#F59E0B20",
                              color: "#F59E0B",
                            }}
                          >
                            ยังไม่ลงทะเบียน
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs sm:text-sm truncate"
                        style={{ color: colors.textSecondary }}
                      >
                        รหัส: {subjectData.subject.code}
                        {subjectData.subject.teacher && (
                          <span className="hidden sm:inline">
                            {" "}
                            • ครู: {subjectData.subject.teacher.firstName}{" "}
                            {subjectData.subject.teacher.lastName}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right side: Progress + Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                    {/* Progress */}
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="text-right">
                        <p
                          className="text-base sm:text-lg font-bold"
                          style={{
                            color: getProgressColor(subjectData.progress),
                          }}
                        >
                          {subjectData.progress}%
                        </p>
                        <p
                          className="text-[10px] sm:text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          {subjectData.videoWatchedChapters || 0}/
                          {subjectData.totalChapters} บท
                        </p>
                      </div>
                      {/* Progress Bar - hidden on small mobile */}
                      <div className="hidden sm:block w-20 md:w-32 h-2 rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${subjectData.progress}%`,
                            backgroundColor: getProgressColor(
                              subjectData.progress
                            ),
                          }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      {expandedSubject === subjectData.subject._id ? (
                        <FaChevronUp
                          className="text-sm"
                          style={{ color: colors.textSecondary }}
                        />
                      ) : (
                        <FaChevronDown
                          className="text-sm"
                          style={{ color: colors.textSecondary }}
                        />
                      )}
                      {/* Unenroll Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnenroll(
                            subjectData.subject._id,
                            subjectData.subject.subject_name
                          );
                        }}
                        disabled={isUnenrolling}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                        style={{ color: "#EF4444" }}
                        title="ยกเลิกการลงทะเบียน"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Chapters */}
              {expandedSubject === subjectData.subject._id && (
                <div
                  className="border-t p-3 sm:p-5"
                  style={{ borderColor: `${colors.border}30` }}
                >
                  {/* Chapters */}
                  <h4
                    className="font-medium mb-3 text-sm sm:text-base"
                    style={{ color: colors.textSecondary }}
                  >
                    รายละเอียดบทเรียน
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    {subjectData.chapters.map((chapter, idx) => (
                      <div
                        key={chapter._id}
                        className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-3 sm:p-4 rounded-xl"
                        style={{
                          backgroundColor: isDarkMode
                            ? colors.background
                            : "#F8F9FA",
                          border: `1px solid ${colors.border}20`,
                        }}
                      >
                        {/* Chapter name */}
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0"
                            style={{
                              backgroundColor: chapter.progress.isCompleted
                                ? "#22C55E"
                                : `${colors.border}40`,
                              color: chapter.progress.isCompleted
                                ? "#FFF"
                                : colors.textSecondary,
                            }}
                          >
                            {chapter.progress.isCompleted ? (
                              <FaCheckCircle className="text-xs sm:text-sm" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <span
                            className="text-xs sm:text-sm truncate"
                            style={{ color: colors.text }}
                          >
                            {chapter.chapter_name}
                          </span>
                        </div>
                        {/* Status icons */}
                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                          {/* Video Status */}
                          <div
                            className="flex items-center gap-1 text-xs"
                            style={{
                              color: chapter.progress.videoWatched
                                ? "#22C55E"
                                : colors.textSecondary,
                            }}
                          >
                            <FaPlay />
                            {chapter.progress.videoProgress}%
                          </div>
                          {/* Document Status */}
                          <div
                            className="flex items-center gap-1 text-xs"
                            style={{
                              color: chapter.progress.documentViewed
                                ? "#22C55E"
                                : colors.textSecondary,
                            }}
                          >
                            <FaFileAlt />
                            {chapter.progress.documentViewed ? "✓" : "-"}
                          </div>
                          {/* Pretest Status */}
                          <div
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: chapter.progress.pretestCompleted
                                ? chapter.progress.pretestPassed
                                  ? "#22C55E20"
                                  : "#EF444420"
                                : `${colors.border}30`,
                              color: chapter.progress.pretestCompleted
                                ? chapter.progress.pretestPassed
                                  ? "#22C55E"
                                  : "#EF4444"
                                : colors.textSecondary,
                            }}
                          >
                            <FaClipboardList />
                            {chapter.progress.pretestCompleted
                              ? `${chapter.progress.pretestPercentage}%`
                              : "-"}
                          </div>
                          {/* Posttest Status */}
                          <div
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: chapter.progress
                                .posttestCompleted
                                ? chapter.progress.posttestPassed
                                  ? "#22C55E20"
                                  : "#EF444420"
                                : `${colors.border}30`,
                              color: chapter.progress.posttestCompleted
                                ? chapter.progress.posttestPassed
                                  ? "#22C55E"
                                  : "#EF4444"
                                : colors.textSecondary,
                            }}
                          >
                            <FaClipboardCheck />
                            {chapter.progress.posttestCompleted
                              ? `${chapter.progress.posttestPercentage}%`
                              : "-"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Final Exam Status */}
                  {subjectData.finalExam && (
                    <div
                      className="mt-4 p-4 rounded-xl flex items-center justify-between"
                      style={{
                        backgroundColor: subjectData.finalExam.result
                          ? subjectData.finalExam.result.passed
                            ? "#22C55E20"
                            : "#EF444420"
                          : "#F59E0B20",
                        border: `1px solid ${
                          subjectData.finalExam.result
                            ? subjectData.finalExam.result.passed
                              ? "#22C55E"
                              : "#EF4444"
                            : "#F59E0B"
                        }40`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <FaTrophy
                          className="text-xl"
                          style={{
                            color: subjectData.finalExam.result
                              ? subjectData.finalExam.result.passed
                                ? "#22C55E"
                                : "#EF4444"
                              : "#F59E0B",
                          }}
                        />
                        <div>
                          <p
                            className="font-bold"
                            style={{ color: colors.text }}
                          >
                            Final Exam: {subjectData.finalExam.title}
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
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
                            className="text-lg font-bold"
                            style={{
                              color: subjectData.finalExam.result.passed
                                ? "#22C55E"
                                : "#EF4444",
                            }}
                          >
                            {subjectData.finalExam.result.percentage}%
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            {subjectData.finalExam.result.passed
                              ? "ผ่าน ✓"
                              : "ไม่ผ่าน ✗"}
                          </p>
                        </div>
                      ) : (
                        <span
                          className="px-3 py-1 rounded-lg text-sm font-medium"
                          style={{
                            backgroundColor: "#F59E0B",
                            color: "#FFF",
                          }}
                        >
                          ยังไม่ได้ทำ
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDetail;
