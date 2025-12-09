import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useFetchPosttestsByChapterQuery,
  useFetchPretestsByChapterQuery,
  useFetchChapterByIdQuery,
  useDeletePosttestMutation,
  useCreatePosttestMutation,
} from "../../redux/features/admin/adminApi";
import {
  FaClipboardCheck,
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
  FaPlay,
  FaEllipsisV,
  FaRandom,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const AllPosttests = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();

  const { data, isLoading, isError, refetch } =
    useFetchPosttestsByChapterQuery(chapterId);
  const { data: pretestsData } = useFetchPretestsByChapterQuery(chapterId);
  const { data: chapterData } = useFetchChapterByIdQuery(chapterId);
  const [deletePosttest, { isLoading: isDeleting }] =
    useDeletePosttestMutation();
  const [createPosttest, { isLoading: isCreating }] =
    useCreatePosttestMutation();

  const [deleteModal, setDeleteModal] = useState({
    show: false,
    posttest: null,
  });
  const [createModal, setCreateModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    sourcePretest: "",
    title: "",
    description: "",
    duration: 30,
    passingScore: 60,
    questionCount: 0,
    isActive: true,
    shuffleQuestions: true,
    showCorrectAnswers: true,
  });

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
    if (!deleteModal.posttest) return;
    try {
      await deletePosttest(deleteModal.posttest._id).unwrap();
      toast.success("ลบแบบทดสอบสำเร็จ!", { icon: "🗑️" });
      setDeleteModal({ show: false, posttest: null });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "ลบไม่สำเร็จ");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.sourcePretest) {
      toast.error("กรุณาเลือกแบบทดสอบก่อนเรียนต้นทาง");
      return;
    }
    try {
      const selectedPretest = pretests.find(
        (p) => p._id === formData.sourcePretest
      );
      await createPosttest({
        chapter: chapterId,
        subject: selectedPretest?.subject,
        ...formData,
      }).unwrap();
      toast.success("สร้างแบบทดสอบหลังเรียนสำเร็จ!", { icon: "✅" });
      setCreateModal(false);
      setFormData({
        sourcePretest: "",
        title: "",
        description: "",
        duration: 30,
        passingScore: 60,
        questionCount: 0,
        isActive: true,
        shuffleQuestions: true,
        showCorrectAnswers: true,
      });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "สร้างไม่สำเร็จ");
    }
  };

  // Update questionCount when selecting a pretest
  const handlePretestSelect = (pretestId) => {
    const selectedPretest = pretests.find((p) => p._id === pretestId);
    const maxQuestions = selectedPretest?.questions?.length || 0;
    setFormData((prev) => ({
      ...prev,
      sourcePretest: pretestId,
      questionCount: maxQuestions,
      title: `แบบทดสอบหลังเรียน - ${selectedPretest?.title || ""}`,
    }));
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: colors.background }}
      >
        <FaSpinner
          className="animate-spin text-5xl"
          style={{ color: "#22C55E" }}
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[400px]"
        style={{ color: colors.textSecondary }}
      >
        <FaClipboardCheck className="text-5xl mb-4 opacity-20" />
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

  const posttests = data?.posttests || [];
  const pretests = pretestsData?.pretests || [];

  const inputStyle = {
    backgroundColor: isDarkMode ? colors.background : "#F5F6F7",
    border: `1px solid ${colors.border}`,
    color: colors.text,
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
                onClick={() => setDeleteModal({ show: false, posttest: null })}
                style={{ color: colors.textSecondary }}
              >
                <FaTimes />
              </button>
            </div>
            <p style={{ color: colors.textSecondary }} className="mb-2">
              ลบแบบทดสอบหลังเรียน{" "}
              <span className="font-semibold" style={{ color: colors.text }}>
                {deleteModal.posttest?.title}
              </span>
              ?
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteModal({ show: false, posttest: null })}
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

      {/* Create Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: colors.text }}>
                📋 สร้างแบบทดสอบหลังเรียน
              </h3>
              <button
                onClick={() => setCreateModal(false)}
                style={{ color: colors.textSecondary }}
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Select Source Pretest */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  เลือก Pretest ต้นทาง <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.sourcePretest}
                  onChange={(e) => handlePretestSelect(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl"
                  style={inputStyle}
                  required
                >
                  <option value="">-- เลือกแบบทดสอบก่อนเรียน --</option>
                  {pretests.map((pretest) => (
                    <option key={pretest._id} value={pretest._id}>
                      {pretest.title} ({pretest.questions?.length || 0} ข้อ)
                    </option>
                  ))}
                </select>
                {pretests.length === 0 && (
                  <p className="text-sm text-yellow-500 mt-2">
                    ⚠️ ยังไม่มี Pretest ในบทเรียนนี้ กรุณาสร้าง Pretest ก่อน
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  ชื่อแบบทดสอบ
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl"
                  style={inputStyle}
                  placeholder="เช่น แบบทดสอบหลังเรียน บทที่ 1"
                  required
                />
              </div>

              {/* Question Count */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  จำนวนคำถามที่จะสุ่ม
                </label>
                <input
                  type="number"
                  value={formData.questionCount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      questionCount: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl"
                  style={inputStyle}
                  min="1"
                  max={
                    pretests.find((p) => p._id === formData.sourcePretest)
                      ?.questions?.length || 100
                  }
                  required
                />
                <p
                  className="text-xs mt-1"
                  style={{ color: colors.textSecondary }}
                >
                  <FaRandom className="inline mr-1" />
                  คำถามจะถูกสุ่มจาก Pretest ทุกครั้งที่ทำข้อสอบ
                </p>
              </div>

              {/* Duration & Passing Score */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.text }}
                  >
                    เวลา (นาที)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value) || 30,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl"
                    style={inputStyle}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.text }}
                  >
                    คะแนนผ่าน (%)
                  </label>
                  <input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        passingScore: parseInt(e.target.value) || 60,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl"
                    style={inputStyle}
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  คำอธิบาย
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl resize-none"
                  style={inputStyle}
                  rows={3}
                  placeholder="คำอธิบายเพิ่มเติม (ไม่บังคับ)"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-medium"
                  style={{
                    border: `1px solid ${colors.border}`,
                    color: colors.textSecondary,
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isCreating || pretests.length === 0}
                  className="flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#22C55E", color: "#FFF" }}
                >
                  {isCreating ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaPlus />
                  )}
                  สร้าง
                </button>
              </div>
            </form>
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
            <FaClipboardCheck style={{ color: "#22C55E" }} />
            📋 แบบทดสอบหลังเรียน (Posttest)
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            บทเรียน: {chapterData?.chapter?.chapter_name}
          </p>
        </div>
        <button
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 px-5 py-3 font-bold rounded-xl"
          style={{ backgroundColor: "#22C55E", color: "#FFF" }}
        >
          <FaPlus /> สร้างแบบทดสอบ
        </button>
      </div>

      {/* Posttests Grid */}
      {posttests.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}30`,
          }}
        >
          <FaClipboardCheck
            className="text-6xl mx-auto mb-4 opacity-20"
            style={{ color: colors.textSecondary }}
          />
          <p style={{ color: colors.textSecondary }} className="mb-4">
            ยังไม่มีแบบทดสอบหลังเรียนในบทเรียนนี้
          </p>
          <button
            onClick={() => setCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
            style={{ backgroundColor: "#22C55E", color: "#FFF" }}
            disabled={pretests.length === 0}
          >
            <FaPlus /> สร้างแบบทดสอบแรก
          </button>
          {pretests.length === 0 && (
            <p className="text-sm text-yellow-500 mt-4">
              ⚠️ กรุณาสร้าง Pretest ก่อน เพื่อใช้เป็นคลังคำถามสำหรับ Posttest
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posttests.map((posttest) => (
            <div
              key={posttest._id}
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
                  style={{ backgroundColor: "#22C55E20" }}
                >
                  <FaClipboardCheck
                    className="text-xl"
                    style={{ color: "#22C55E" }}
                  />
                </div>
                {/* 3-Dot Dropdown Menu */}
                <div
                  className="relative"
                  ref={openDropdown === posttest._id ? dropdownRef : null}
                >
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === posttest._id ? null : posttest._id
                      )
                    }
                    className="p-2 rounded-lg transition-colors hover:bg-gray-500/20"
                    style={{ color: colors.textSecondary }}
                    title="ตัวเลือก"
                  >
                    <FaEllipsisV />
                  </button>
                  {openDropdown === posttest._id && (
                    <div
                      className="absolute right-0 top-10 w-44 rounded-xl shadow-lg z-20 overflow-hidden"
                      style={{
                        backgroundColor: colors.cardBg,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <button
                        onClick={() => {
                          navigate(`/admin/preview-posttest/${posttest._id}`);
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
                          navigate(`/admin/edit-posttest/${posttest._id}`);
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
                          setDeleteModal({ show: true, posttest });
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
                {posttest.title}
              </h3>

              {posttest.description && (
                <p
                  className="text-sm mb-4 line-clamp-2"
                  style={{ color: colors.textSecondary }}
                >
                  {posttest.description}
                </p>
              )}

              {/* Source Pretest Info */}
              <div
                className="text-xs px-3 py-2 rounded-lg mb-4 flex items-center gap-2"
                style={{
                  backgroundColor: isDarkMode ? colors.background : "#F3F4F6",
                  color: colors.textSecondary,
                }}
              >
                <FaRandom className="text-purple-500" />
                สุ่มจาก: {posttest.sourcePretest?.title || "N/A"}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  <FaQuestionCircle className="text-green-500" />
                  <span>{posttest.questionCount} คำถาม</span>
                </div>
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  <FaClock className="text-blue-500" />
                  <span>{posttest.duration} นาที</span>
                </div>
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  <FaPercent className="text-green-500" />
                  <span>ผ่าน {posttest.passingScore}%</span>
                </div>
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {posttest.isActive ? (
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
                    navigate(`/admin/preview-posttest/${posttest._id}`)
                  }
                  className="flex-1 py-2.5 rounded-xl font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#22c55e", color: "#FFF" }}
                >
                  <FaPlay /> ทดลองทำ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllPosttests;
