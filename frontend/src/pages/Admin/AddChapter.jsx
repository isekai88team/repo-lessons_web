import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useCreateChapterMutation,
  useFetchSubjectByIdQuery,
} from "../../redux/features/admin/adminApi";
import {
  FaVideo,
  FaSpinner,
  FaArrowLeft,
  FaAlignLeft,
  FaUpload,
  FaFile,
  FaTimes,
  FaPlay,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const AddChapter = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const [createChapter, { isLoading }] = useCreateChapterMutation();
  const { data: subjectData } = useFetchSubjectByIdQuery(subjectId);

  const videoInputRef = useRef(null);
  const docInputRef = useRef(null);

  const [formData, setFormData] = useState({
    chapter_name: "",
    description: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        toast.error("ไฟล์วิดีโอต้องไม่เกิน 500MB");
        return;
      }
      setVideoFile(file);
    }
  };

  const handleDocSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("ไฟล์เอกสารต้องไม่เกิน 50MB");
        return;
      }
      setDocFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("subject", subjectId);
    formDataToSend.append("chapter_name", formData.chapter_name);
    formDataToSend.append("description", formData.description);
    if (videoFile) formDataToSend.append("video", videoFile);
    if (docFile) formDataToSend.append("document", docFile);

    try {
      await createChapter(formDataToSend).unwrap();
      toast.success("สร้างบทเรียนสำเร็จ! 🎉");
      setTimeout(() => navigate(`/admin/subject/${subjectId}`), 1500);
    } catch (error) {
      toast.error(error?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const inputStyle = {
    backgroundColor: isDarkMode ? colors.background : "#F5F6F7",
    border: `1px solid ${colors.border}`,
    color: colors.text,
  };

  return (
    <div
      className="min-h-screen p-6 lg:p-10 font-sans transition-colors duration-300"
      style={{
        backgroundColor: isDarkMode
          ? colors.background
          : `${colors.background}50`,
      }}
    >
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(`/admin/subject/${subjectId}`)}
          className="p-3 rounded-xl shadow-sm"
          style={{
            backgroundColor: colors.cardBg,
            color: colors.textSecondary,
          }}
        >
          <FaArrowLeft />
        </button>
        <div>
          <h1
            className="text-2xl font-bold flex items-center gap-3"
            style={{ color: colors.text }}
          >
            <FaVideo style={{ color: "#8B5CF6" }} />
            เพิ่มบทเรียนใหม่
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            รายวิชา: {subjectData?.subject?.subject_name}
          </p>
        </div>
      </div>

      <div
        className="max-w-2xl mx-auto rounded-2xl shadow-lg overflow-hidden"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}30`,
        }}
      >
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Chapter Name */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              ชื่อบทเรียน <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: colors.textSecondary }}
              >
                <FaPlay />
              </div>
              <input
                type="text"
                name="chapter_name"
                value={formData.chapter_name}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
                style={inputStyle}
                placeholder="เช่น บทที่ 1 - บทนำ"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              คำอธิบาย
            </label>
            <div className="relative">
              <div
                className="absolute left-4 top-4"
                style={{ color: colors.textSecondary }}
              >
                <FaAlignLeft />
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none resize-none"
                style={inputStyle}
                placeholder="อธิบายเนื้อหาบทเรียน..."
              />
            </div>
          </div>

          {/* Video Upload */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              วิดีโอบทเรียน
            </label>
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoSelect}
              accept="video/*"
              className="hidden"
            />
            {videoFile ? (
              <div
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{
                  backgroundColor: isDarkMode ? colors.background : "#F5F6F7",
                  border: `1px solid ${colors.border}`,
                }}
              >
                <FaVideo style={{ color: "#22c55e" }} />
                <span
                  className="flex-1 truncate"
                  style={{ color: colors.text }}
                >
                  {videoFile.name}
                </span>
                <span
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <button
                  type="button"
                  onClick={() => setVideoFile(null)}
                  className="p-1 hover:text-red-500"
                  style={{ color: colors.textSecondary }}
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full p-6 rounded-xl border-2 border-dashed flex flex-col items-center gap-2"
                style={{
                  borderColor: colors.border,
                  color: colors.textSecondary,
                }}
              >
                <FaUpload className="text-2xl" />
                <span>คลิกเพื่อเลือกวิดีโอ</span>
                <span className="text-xs">MP4, WebM (สูงสุด 500MB)</span>
              </button>
            )}
          </div>

          {/* Document Upload */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              เอกสารประกอบ (ถ้ามี)
            </label>
            <input
              type="file"
              ref={docInputRef}
              onChange={handleDocSelect}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
            {docFile ? (
              <div
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{
                  backgroundColor: isDarkMode ? colors.background : "#F5F6F7",
                  border: `1px solid ${colors.border}`,
                }}
              >
                <FaFile style={{ color: "#3b82f6" }} />
                <span
                  className="flex-1 truncate"
                  style={{ color: colors.text }}
                >
                  {docFile.name}
                </span>
                <span
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  {(docFile.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <button
                  type="button"
                  onClick={() => setDocFile(null)}
                  className="p-1 hover:text-red-500"
                  style={{ color: colors.textSecondary }}
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className="w-full p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2"
                style={{
                  borderColor: colors.border,
                  color: colors.textSecondary,
                }}
              >
                <FaFile />
                <span>เลือกไฟล์เอกสาร (PDF, DOC)</span>
              </button>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/admin/subject/${subjectId}`)}
              className="flex-1 py-3 px-6 font-semibold rounded-xl"
              style={{
                border: `1px solid ${colors.border}`,
                color: colors.textSecondary,
              }}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-6 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
              style={{ backgroundColor: "#8B5CF6", color: "#FFF" }}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>กำลังอัปโหลด...</span>
                </>
              ) : (
                <span>บันทึกบทเรียน</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChapter;
