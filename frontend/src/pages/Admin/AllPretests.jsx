import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useFetchPretestsByChapterQuery,
  useFetchChapterByIdQuery,
  useDeletePretestMutation,
} from "../../redux/features/admin/adminApi";
import {
  FaClipboardList,
  FaSpinner,
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaClock,
  FaPercent,
  FaQuestionCircle,
  FaToggleOn,
  FaToggleOff,
  FaEye,
  FaCheck,
  FaPlay,
  FaEllipsisV,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import {
  PageSkeleton,
  CardGridSkeleton,
} from "../../components/Admin/SkeletonLoader";

const AllPretests = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();

  const { data, isLoading, isError, refetch } =
    useFetchPretestsByChapterQuery(chapterId);
  const { data: chapterData } = useFetchChapterByIdQuery(chapterId);
  const [deletePretest, { isLoading: isDeleting }] = useDeletePretestMutation();

  const [deleteModal, setDeleteModal] = useState({
    show: false,
    pretest: null,
  });
  const [previewModal, setPreviewModal] = useState({
    show: false,
    pretest: null,
  });
  const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (!deleteModal.pretest) return;
    try {
      await deletePretest(deleteModal.pretest._id).unwrap();
      toast.success("ลบแบบทดสอบสำเร็จ!", { icon: "🗑️" });
      setDeleteModal({ show: false, pretest: null });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "ลบไม่สำเร็จ");
    }
  };

  if (isLoading) {
    return (
      <PageSkeleton>
        <CardGridSkeleton count={6} />
      </PageSkeleton>
    );
  }

  if (isError) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[400px]"
        style={{ color: colors.textSecondary }}
      >
        <FaClipboardList className="text-5xl mb-4 opacity-20" />
        <p>ไม่สามารถโหลดข้อมูลได้</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 rounded-xl"
          style={{ backgroundColor: colors.primary, color: "#FFF" }}
        >
          กลับ
        </button>
      </div>
    );
  }

  const pretests = data?.pretests || [];

  return (
    <div
      className="min-h-screen p-6 lg:p-10 font-sans transition-colors"
      style={{
        backgroundColor: isDarkMode
          ? colors.background
          : `${colors.background}50`,
      }}
    >
      {/* Delete Modal */}
      {deleteModal.show && (
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
                ยืนยันการลบ
              </h3>
              <button
                onClick={() => setDeleteModal({ show: false, pretest: null })}
                style={{ color: colors.textSecondary }}
              >
                <FaTimes />
              </button>
            </div>
            <p style={{ color: colors.textSecondary }} className="mb-2">
              ลบแบบทดสอบ{" "}
              <span className="font-semibold" style={{ color: colors.text }}>
                {deleteModal.pretest?.title}
              </span>
              ?
            </p>
            <p className="text-sm text-red-400 mb-6">
              ⚠️ คำถามทั้งหมดจะถูกลบด้วย
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, pretest: null })}
                className="flex-1 py-2 px-4 rounded-xl"
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.textSecondary,
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaTrash />
                )}{" "}
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal.show && previewModal.pretest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl max-w-3xl w-full shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.border}`,
            }}
          >
            {/* Header */}
            <div
              className="p-6 border-b flex items-center justify-between"
              style={{ borderColor: colors.border }}
            >
              <div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  👁️ ตัวอย่างข้อสอบ
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.textSecondary }}
                >
                  {previewModal.pretest.title} •{" "}
                  {previewModal.pretest.questions?.length || 0} ข้อ •{" "}
                  {previewModal.pretest.duration} นาที
                </p>
              </div>
              <button
                onClick={() => setPreviewModal({ show: false, pretest: null })}
                className="p-2 rounded-lg hover:bg-gray-500/20"
                style={{ color: colors.textSecondary }}
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Questions */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {previewModal.pretest.questions?.length === 0 ? (
                <div
                  className="text-center py-12"
                  style={{ color: colors.textSecondary }}
                >
                  <FaQuestionCircle className="text-5xl mx-auto mb-3 opacity-30" />
                  <p>ยังไม่มีคำถามในแบบทดสอบนี้</p>
                </div>
              ) : (
                previewModal.pretest.questions?.map((q, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-xl"
                    style={{
                      backgroundColor: isDarkMode
                        ? colors.background
                        : "#F8F9FA",
                      border: `1px solid ${colors.border}30`,
                    }}
                  >
                    {/* Question */}
                    <div className="flex gap-3 mb-4">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{
                          backgroundColor: "#8B5CF620",
                          color: "#8B5CF6",
                        }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p
                          className="font-medium"
                          style={{ color: colors.text }}
                        >
                          {q.questionText}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 rounded mt-1 inline-block"
                          style={{
                            backgroundColor: `${colors.border}40`,
                            color: colors.textSecondary,
                          }}
                        >
                          {q.questionType === "multiple-choice"
                            ? "ปรนัย"
                            : q.questionType === "true-false"
                            ? "ถูก/ผิด"
                            : q.questionType === "matching"
                            ? "จับคู่"
                            : "ตอบสั้น"}{" "}
                          • {q.points} คะแนน
                        </span>
                      </div>
                    </div>

                    {/* Options */}
                    {q.questionType === "multiple-choice" &&
                      q.options?.length > 0 && (
                        <div className="ml-11 space-y-2">
                          {q.options.map((opt, optIndex) => (
                            <div
                              key={optIndex}
                              className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
                              style={{
                                backgroundColor:
                                  opt === q.correctAnswer
                                    ? isDarkMode
                                      ? "#22c55e20"
                                      : "#dcfce7"
                                    : "transparent",
                                border: `1px solid ${
                                  opt === q.correctAnswer
                                    ? "#22c55e"
                                    : colors.border
                                }40`,
                              }}
                            >
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                                style={{
                                  backgroundColor: `${colors.border}40`,
                                  color: colors.text,
                                }}
                              >
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span style={{ color: colors.text }}>{opt}</span>
                              {opt === q.correctAnswer && (
                                <FaCheck className="ml-auto text-green-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                    {/* True/False */}
                    {q.questionType === "true-false" && (
                      <div className="ml-11 space-y-2">
                        {["true", "false"].map((val) => (
                          <div
                            key={val}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
                            style={{
                              backgroundColor:
                                val === q.correctAnswer
                                  ? isDarkMode
                                    ? "#22c55e20"
                                    : "#dcfce7"
                                  : "transparent",
                              border: `1px solid ${
                                val === q.correctAnswer
                                  ? "#22c55e"
                                  : colors.border
                              }40`,
                            }}
                          >
                            <span style={{ color: colors.text }}>
                              {val === "true" ? "ถูก" : "ผิด"}
                            </span>
                            {val === q.correctAnswer && (
                              <FaCheck className="ml-auto text-green-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Short Answer */}
                    {q.questionType === "short-answer" && (
                      <div
                        className="ml-11 px-4 py-3 rounded-lg"
                        style={{
                          backgroundColor: isDarkMode ? "#22c55e20" : "#dcfce7",
                          border: "1px solid #22c55e40",
                        }}
                      >
                        <span
                          className="text-sm"
                          style={{ color: colors.textSecondary }}
                        >
                          คำตอบ:{" "}
                        </span>
                        <span className="font-medium text-green-600">
                          {q.correctAnswer}
                        </span>
                      </div>
                    )}

                    {/* Matching */}
                    {q.questionType === "matching" &&
                      q.matchingPairs?.length > 0 && (
                        <div className="ml-11 space-y-2">
                          {q.matchingPairs.map((pair, pairIndex) => (
                            <div
                              key={pairIndex}
                              className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
                              style={{
                                backgroundColor: isDarkMode
                                  ? "#22c55e20"
                                  : "#dcfce7",
                                border: "1px solid #22c55e40",
                              }}
                            >
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                                style={{
                                  backgroundColor: "#F59E0B",
                                  color: "#FFF",
                                }}
                              >
                                {pairIndex + 1}
                              </span>
                              <span style={{ color: colors.text }}>
                                {pair.left}
                              </span>
                              <span style={{ color: colors.textSecondary }}>
                                →
                              </span>
                              <span className="font-medium text-green-600">
                                {pair.right}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div
                        className="ml-11 mt-3 px-4 py-3 rounded-lg"
                        style={{
                          backgroundColor: isDarkMode ? "#3b82f620" : "#dbeafe",
                        }}
                      >
                        <span className="text-sm" style={{ color: "#3b82f6" }}>
                          💡 คำอธิบาย:{" "}
                        </span>
                        <span style={{ color: colors.text }}>
                          {q.explanation}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div
              className="p-4 border-t flex justify-end gap-3"
              style={{ borderColor: colors.border }}
            >
              <button
                onClick={() => setPreviewModal({ show: false, pretest: null })}
                className="px-5 py-2 rounded-xl font-medium"
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.textSecondary,
                }}
              >
                ปิด
              </button>
              <button
                onClick={() => {
                  setPreviewModal({ show: false, pretest: null });
                  navigate(`/admin/edit-pretest/${previewModal.pretest._id}`);
                }}
                className="px-5 py-2 rounded-xl font-semibold"
                style={{ backgroundColor: "#8B5CF6", color: "#FFF" }}
              >
                แก้ไขข้อสอบ
              </button>
            </div>
          </div>
        </div>
      )}

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
            <FaClipboardList style={{ color: "#F59E0B" }} />
            📝 แบบทดสอบก่อนเรียน (Pretest)
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            บทเรียน: {chapterData?.chapter?.chapter_name}
          </p>
        </div>
        <Link
          to={`/admin/add-pretest/${chapterId}`}
          className="flex items-center gap-2 px-5 py-3 font-bold rounded-xl"
          style={{ backgroundColor: "#8B5CF6", color: "#FFF" }}
        >
          <FaPlus /> สร้างแบบทดสอบ
        </Link>
      </div>

      {/* Pretests Grid */}
      {pretests.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}30`,
          }}
        >
          <FaClipboardList
            className="text-6xl mx-auto mb-4 opacity-20"
            style={{ color: colors.textSecondary }}
          />
          <p style={{ color: colors.textSecondary }} className="mb-4">
            ยังไม่มีแบบทดสอบในบทเรียนนี้
          </p>
          <Link
            to={`/admin/add-pretest/${chapterId}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
            style={{ backgroundColor: "#8B5CF6", color: "#FFF" }}
          >
            <FaPlus /> สร้างแบบทดสอบแรก
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pretests.map((pretest) => (
            <div
              key={pretest._id}
              className="rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}30`,
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#F59E0B20" }}
                >
                  <FaClipboardList
                    className="text-xl"
                    style={{ color: "#F59E0B" }}
                  />
                </div>
                {/* 3-Dot Dropdown Menu */}
                <div
                  className="relative"
                  ref={openDropdown === pretest._id ? dropdownRef : null}
                >
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === pretest._id ? null : pretest._id
                      )
                    }
                    className="p-2 rounded-lg transition-colors hover:bg-gray-500/20"
                    style={{ color: colors.textSecondary }}
                    title="ตัวเลือก"
                  >
                    <FaEllipsisV />
                  </button>
                  {openDropdown === pretest._id && (
                    <div
                      className="absolute right-0 top-10 w-44 rounded-xl shadow-lg z-20 overflow-hidden"
                      style={{
                        backgroundColor: colors.cardBg,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <button
                        onClick={() => {
                          setPreviewModal({ show: true, pretest });
                          setOpenDropdown(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-purple-500/10 transition-colors"
                        style={{ color: colors.text }}
                      >
                        <FaEye className="text-purple-500" />
                        ดูตัวอย่าง
                      </button>
                      <button
                        onClick={() => {
                          navigate(`/admin/edit-pretest/${pretest._id}`);
                          setOpenDropdown(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-500/10 transition-colors"
                        style={{ color: colors.text }}
                      >
                        <FaEdit className="text-blue-500" />
                        แก้ไข
                      </button>
                      <button
                        onClick={() => {
                          setDeleteModal({ show: true, pretest });
                          setOpenDropdown(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-500/10 transition-colors"
                        style={{ color: "#EF4444" }}
                      >
                        <FaTrash />
                        ลบ
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: colors.text }}
              >
                {pretest.title}
              </h3>

              {pretest.description && (
                <p
                  className="text-sm mb-4 line-clamp-2"
                  style={{ color: colors.textSecondary }}
                >
                  {pretest.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  <FaQuestionCircle className="text-purple-500" />
                  <span>{pretest.questions?.length || 0} คำถาม</span>
                </div>
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  <FaClock className="text-blue-500" />
                  <span>{pretest.duration} นาที</span>
                </div>
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  <FaPercent className="text-green-500" />
                  <span>ผ่าน {pretest.passingScore}%</span>
                </div>
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {pretest.isActive ? (
                    <>
                      <FaToggleOn className="text-green-500" />
                      <span className="text-green-500">เปิด</span>
                    </>
                  ) : (
                    <>
                      <FaToggleOff className="text-gray-400" />
                      <span>ปิด</span>
                    </>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    navigate(`/admin/preview-pretest/${pretest._id}`)
                  }
                  className="flex-1 py-2.5 rounded-xl font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#22c55e", color: "#FFF" }}
                >
                  <FaPlay /> ทดลองทำ
                </button>
                <button
                  onClick={() => navigate(`/admin/edit-pretest/${pretest._id}`)}
                  className="flex-1 py-2.5 rounded-xl font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: "#F59E0B", color: "#FFF" }}
                >
                  จัดการคำถาม →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllPretests;
