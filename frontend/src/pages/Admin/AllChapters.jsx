import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useFetchAllSubjectsQuery,
  useDeleteChapterMutation,
  useFetchChapterByIdQuery,
  useFetchChaptersBySubjectQuery,
} from "../../redux/features/admin/adminApi";
import {
  FaBook,
  FaSpinner,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaPlay,
  FaFile,
  FaVideo,
  FaDownload,
  FaExpand,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const AllChapters = () => {
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();

  // Fetch all subjects to get the first one
  const { data: subjectsData, isLoading: isLoadingSubjects } =
    useFetchAllSubjectsQuery();
  const subjects = subjectsData?.subjects || [];
  const firstSubject = subjects[0];

  // Fetch chapters for the first subject
  const {
    data: chaptersData,
    isLoading: isLoadingChapters,
    refetch,
  } = useFetchChaptersBySubjectQuery(firstSubject?._id, {
    skip: !firstSubject?._id,
  });
  const chapters = chaptersData?.chapters || [];

  const [deleteChapter, { isLoading: isDeleting }] = useDeleteChapterMutation();

  const [deleteModal, setDeleteModal] = useState({
    show: false,
    chapter: null,
  });
  const [previewModal, setPreviewModal] = useState({
    show: false,
    type: null,
    chapterId: null,
  });

  // Fetch chapter with signed URLs when preview modal opens
  const { data: previewData, isLoading: isPreviewLoading } =
    useFetchChapterByIdQuery(previewModal.chapterId, {
      skip: !previewModal.chapterId,
    });

  const handleDeleteChapter = async () => {
    if (!deleteModal.chapter) return;
    try {
      await deleteChapter(deleteModal.chapter._id).unwrap();
      toast.error(`ลบบทเรียน ${deleteModal.chapter.chapter_name} สำเร็จ!`, {
        icon: "🗑️",
      });
      setDeleteModal({ show: false, chapter: null });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "ลบไม่สำเร็จ");
    }
  };

  const openPreview = (chapterId, type) => {
    setPreviewModal({ show: true, type, chapterId });
  };

  const closePreview = () => {
    setPreviewModal({ show: false, type: null, chapterId: null });
  };

  if (isLoadingSubjects || isLoadingChapters) {
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

  if (!firstSubject) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[400px]"
        style={{ color: colors.textSecondary }}
      >
        <FaBook className="text-5xl mb-4 opacity-20" />
        <p>ยังไม่มีรายวิชา กรุณาติดต่อผู้ดูแลระบบ</p>
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
                ยืนยันการลบบทเรียน
              </h3>
              <button
                onClick={() => setDeleteModal({ show: false, chapter: null })}
                style={{ color: colors.textSecondary }}
              >
                <FaTimes />
              </button>
            </div>
            <p style={{ color: colors.textSecondary }} className="mb-2">
              ลบบทเรียน{" "}
              <span className="font-semibold" style={{ color: colors.text }}>
                {deleteModal.chapter?.chapter_name}
              </span>
              ?
            </p>
            <p className="text-sm text-red-400 mb-6">
              ⚠️ วิดีโอและเอกสารจะถูกลบด้วย
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, chapter: null })}
                className="flex-1 py-2 px-4 rounded-xl"
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.textSecondary,
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteChapter}
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
      {previewModal.show && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
            style={{ backgroundColor: colors.cardBg }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: colors.border }}
            >
              <div className="flex items-center gap-3">
                {previewModal.type === "video" ? (
                  <FaVideo className="text-green-500" />
                ) : (
                  <FaFile className="text-blue-500" />
                )}
                <h3 className="font-bold" style={{ color: colors.text }}>
                  {previewModal.type === "video" ? "ดูวิดีโอ" : "ดูเอกสาร"}:{" "}
                  {previewData?.chapter?.chapter_name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {previewModal.type === "video" &&
                  previewData?.signedVideoUrl && (
                    <a
                      href={previewData.signedVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-gray-500/20"
                      style={{ color: colors.textSecondary }}
                      title="เปิดในแท็บใหม่"
                    >
                      <FaExpand />
                    </a>
                  )}
                {previewModal.type === "document" &&
                  previewData?.signedDocumentUrl && (
                    <a
                      href={previewData.signedDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-gray-500/20"
                      style={{ color: colors.textSecondary }}
                      title="ดาวน์โหลด"
                    >
                      <FaDownload />
                    </a>
                  )}
                <button
                  onClick={closePreview}
                  className="p-2 rounded-lg hover:bg-gray-500/20"
                  style={{ color: colors.textSecondary }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div
              className="p-4"
              style={{ maxHeight: "calc(90vh - 80px)", overflowY: "auto" }}
            >
              {isPreviewLoading ? (
                <div className="flex items-center justify-center py-20">
                  <FaSpinner
                    className="animate-spin text-4xl"
                    style={{ color: "#8B5CF6" }}
                  />
                </div>
              ) : previewModal.type === "video" &&
                previewData?.signedVideoUrl ? (
                <video
                  controls
                  preload="metadata"
                  className="w-full rounded-xl bg-black"
                  style={{ maxHeight: "70vh" }}
                >
                  <source src={previewData.signedVideoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : previewModal.type === "document" &&
                previewData?.signedDocumentUrl ? (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    previewData.signedDocumentUrl
                  )}&embedded=true`}
                  className="w-full rounded-xl border-0"
                  style={{ height: "70vh" }}
                  title="Document Preview"
                  allowFullScreen
                />
              ) : (
                <div
                  className="text-center py-20"
                  style={{ color: colors.textSecondary }}
                >
                  <p>ไม่พบไฟล์</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#8B5CF620" }}
          >
            <FaBook className="text-xl" style={{ color: "#8B5CF6" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              จัดการบทเรียน
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              เพิ่ม ลบ แก้ไข บทเรียนทั้งหมด
            </p>
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}30`,
        }}
      >
        <div
          className="p-6 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${colors.border}30` }}
        >
          <div className="flex items-center gap-3">
            <FaVideo style={{ color: "#8B5CF6" }} />
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>
              บทเรียน ({chapters.length})
            </h2>
          </div>
          <Link
            to={`/admin/add-chapter/${firstSubject._id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium"
            style={{ backgroundColor: "#8B5CF6", color: "#FFF" }}
          >
            <FaPlus /> เพิ่มบทเรียน
          </Link>
        </div>

        {chapters.length === 0 ? (
          <div
            className="p-12 text-center"
            style={{ color: colors.textSecondary }}
          >
            <FaVideo className="text-5xl mx-auto mb-3 opacity-20" />
            <p>ยังไม่มีบทเรียน</p>
            <Link
              to={`/admin/add-chapter/${firstSubject._id}`}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl"
              style={{
                backgroundColor: `${colors.primary}20`,
                color: colors.primary,
              }}
            >
              <FaPlus /> เพิ่มบทเรียนแรก
            </Link>
          </div>
        ) : (
          <div
            className="divide-y"
            style={{ borderColor: `${colors.border}30` }}
          >
            {chapters.map((chapter, index) => (
              <div
                key={chapter._id}
                className="p-4 hover:bg-gray-500/5 transition-colors"
              >
                {/* Mobile: Stack Layout */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  {/* Number + Title */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{
                        backgroundColor: `${colors.primary}20`,
                        color: colors.primary,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-semibold text-sm sm:text-base truncate"
                        style={{ color: colors.text }}
                      >
                        {chapter.chapter_name}
                      </h3>
                      {chapter.description && (
                        <p
                          className="text-xs sm:text-sm line-clamp-1"
                          style={{ color: colors.textSecondary }}
                        >
                          {chapter.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Two Rows Layout */}
                  <div className="flex flex-col gap-2 pl-11 sm:pl-0 w-full sm:w-auto">
                    {/* Row 1: Video & Document Buttons */}
                    <div className="flex items-center gap-2">
                      {chapter.video_url && (
                        <button
                          onClick={() => openPreview(chapter._id, "video")}
                          className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all hover:opacity-90 shadow-sm"
                          style={{
                            backgroundColor: "#22c55e",
                            color: "#FFFFFF",
                          }}
                        >
                          <FaPlay className="text-[8px] sm:text-xs" /> วิดีโอ
                        </button>
                      )}
                      {chapter.document_url && (
                        <button
                          onClick={() => openPreview(chapter._id, "document")}
                          className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all hover:opacity-90 shadow-sm"
                          style={{
                            backgroundColor: "#3b82f6",
                            color: "#FFFFFF",
                          }}
                        >
                          <FaFile className="text-[8px] sm:text-xs" /> เอกสาร
                        </button>
                      )}
                    </div>
                    {/* Row 2: Action Icons */}
                    <div className="flex items-center gap-x-4 sm:gap-x-6">
                      <button
                        onClick={() =>
                          navigate(`/admin/edit-chapter/${chapter._id}`)
                        }
                        className="p-1.5 sm:p-2 rounded-lg transition-colors hover:bg-blue-500/20"
                        style={{ color: isDarkMode ? "#60A5FA" : "#3B82F6" }}
                        title="แก้ไข"
                      >
                        <FaEdit className="text-sm sm:text-base" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ show: true, chapter })}
                        className="p-1.5 sm:p-2 rounded-lg transition-colors hover:bg-red-500/20"
                        style={{ color: isDarkMode ? "#F87171" : "#EF4444" }}
                        title="ลบ"
                      >
                        <FaTrash className="text-sm sm:text-base" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllChapters;
