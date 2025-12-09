import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useCreatePretestMutation,
  useFetchChapterByIdQuery,
} from "../../redux/features/admin/adminApi";
import {
  FaClipboardList,
  FaSpinner,
  FaArrowLeft,
  FaClock,
  FaPercent,
  FaAlignLeft,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const AddPretest = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const [createPretest, { isLoading }] = useCreatePretestMutation();
  const { data: chapterData } = useFetchChapterByIdQuery(chapterId);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 30,
    passingScore: 60,
    allowRetake: false,
    maxAttempts: 1,
    shuffleQuestions: false,
    showCorrectAnswers: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await createPretest({
        ...formData,
        chapter: chapterId,
        duration: parseInt(formData.duration),
        passingScore: parseInt(formData.passingScore),
        maxAttempts: parseInt(formData.maxAttempts),
        totalPoints: 0,
        questions: [],
      }).unwrap();

      toast.success("สร้างแบบทดสอบสำเร็จ! 🎉");
      setTimeout(
        () => navigate(`/admin/edit-pretest/${result.pretest._id}`),
        1000
      );
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
          onClick={() =>
            navigate(
              `/admin/subject/${chapterData?.chapter?.subject?._id || ""}`
            )
          }
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
            <FaClipboardList style={{ color: "#8B5CF6" }} />
            สร้างแบบทดสอบก่อนเรียน
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            บทเรียน: {chapterData?.chapter?.chapter_name}
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
          {/* Title */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              ชื่อแบบทดสอบ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl focus:outline-none"
              style={inputStyle}
              placeholder="เช่น Pretest บทที่ 1"
            />
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
                placeholder="อธิบายเกี่ยวกับแบบทดสอบนี้..."
              />
            </div>
          </div>

          {/* Duration & Passing Score */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium flex items-center gap-2"
                style={{ color: colors.textSecondary }}
              >
                <FaClock /> เวลาทำ (นาที)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min={1}
                className="w-full px-4 py-3 rounded-xl focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium flex items-center gap-2"
                style={{ color: colors.textSecondary }}
              >
                <FaPercent /> คะแนนผ่าน (%)
              </label>
              <input
                type="number"
                name="passingScore"
                value={formData.passingScore}
                onChange={handleChange}
                min={0}
                max={100}
                className="w-full px-4 py-3 rounded-xl focus:outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Options */}
          <div
            className="space-y-3 pt-4 border-t"
            style={{ borderColor: colors.border }}
          >
            <label
              className="text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              ตัวเลือก
            </label>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="allowRetake"
                checked={formData.allowRetake}
                onChange={handleChange}
                className="w-5 h-5 rounded"
              />
              <span style={{ color: colors.text }}>อนุญาตให้ทำซ้ำได้</span>
            </div>

            {formData.allowRetake && (
              <div className="ml-8">
                <label
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  จำนวนครั้งสูงสุด
                </label>
                <input
                  type="number"
                  name="maxAttempts"
                  value={formData.maxAttempts}
                  onChange={handleChange}
                  min={1}
                  className="w-20 ml-2 px-3 py-1 rounded-lg focus:outline-none"
                  style={inputStyle}
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="shuffleQuestions"
                checked={formData.shuffleQuestions}
                onChange={handleChange}
                className="w-5 h-5 rounded"
              />
              <span style={{ color: colors.text }}>สุ่มลำดับคำถาม</span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="showCorrectAnswers"
                checked={formData.showCorrectAnswers}
                onChange={handleChange}
                className="w-5 h-5 rounded"
              />
              <span style={{ color: colors.text }}>แสดงเฉลยหลังส่งคำตอบ</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
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
                  <span>กำลังสร้าง...</span>
                </>
              ) : (
                <span>สร้างแบบทดสอบ</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPretest;
