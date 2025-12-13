import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useCreatePretestMutation,
  useFetchAllSubjectsQuery,
  useFetchChaptersBySubjectQuery,
  useFetchAllPretestsQuery,
} from "../../redux/features/admin/adminApi";
import {
  FaClipboardList,
  FaSpinner,
  FaArrowLeft,
  FaClock,
  FaPercent,
  FaAlignLeft,
  FaBook,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const AddPretest = () => {
  const { chapterId: paramChapterId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const [createPretest, { isLoading }] = useCreatePretestMutation();

  // Get first subject and its chapters
  const { data: subjectsData } = useFetchAllSubjectsQuery();
  const firstSubject = subjectsData?.subjects?.[0];
  const { data: chaptersData } = useFetchChaptersBySubjectQuery(
    firstSubject?._id,
    { skip: !firstSubject?._id }
  );
  const chapters = chaptersData?.chapters || [];

  // Get all pretests to check which chapters already have one
  const { data: pretestsData } = useFetchAllPretestsQuery();
  const pretests = pretestsData?.pretests || [];

  // Get chapter IDs that already have pretests
  const chaptersWithPretest = pretests.map((p) => p.chapter?._id);

  // Filter chapters that don't have a pretest yet
  const availableChapters = chapters.filter(
    (c) => !chaptersWithPretest.includes(c._id)
  );

  // Check if maximum pretests reached (6)
  const maxPretestsReached = pretests.length >= 6;

  const [selectedChapterId, setSelectedChapterId] = useState(
    paramChapterId || ""
  );

  // Set default chapter when chapters load
  useEffect(() => {
    if (!selectedChapterId && availableChapters.length > 0) {
      setSelectedChapterId(availableChapters[0]._id);
    }
  }, [availableChapters, selectedChapterId]);

  // Check if selected chapter already has a pretest
  const existingPretest = pretests.find(
    (p) => p.chapter?._id === selectedChapterId
  );

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

    if (!selectedChapterId) {
      toast.error("กรุณาเลือกบทเรียน");
      return;
    }

    // Check if chapter already has a pretest
    if (existingPretest) {
      toast.error("บทนี้มี Pretest แล้ว กรุณาไปแก้ไขแทน");
      navigate(`/admin/edit-pretest/${existingPretest._id}`);
      return;
    }

    try {
      const result = await createPretest({
        ...formData,
        chapter: selectedChapterId,
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

  // If max pretests reached, show message
  if (maxPretestsReached) {
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
            onClick={() => navigate("/admin/quizzes")}
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
          </div>
        </div>

        <div
          className="max-w-2xl mx-auto rounded-2xl shadow-lg overflow-hidden p-8 text-center"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}30`,
          }}
        >
          <FaCheckCircle
            className="text-6xl mx-auto mb-4"
            style={{ color: "#22C55E" }}
          />
          <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
            สร้างแบบทดสอบครบทุกบทแล้ว!
          </h2>
          <p className="mb-6" style={{ color: colors.textSecondary }}>
            ทุกบทเรียนมี Pretest แล้ว (สูงสุด 6 บท)
            <br />
            คุณสามารถแก้ไขแบบทดสอบที่มีอยู่ได้
          </p>
          <button
            onClick={() => navigate("/admin/quizzes")}
            className="px-6 py-3 rounded-xl font-medium"
            style={{ backgroundColor: "#8B5CF6", color: "#FFF" }}
          >
            ไปหน้าจัดการแบบทดสอบ
          </button>
        </div>
      </div>
    );
  }

  // If no available chapters
  if (availableChapters.length === 0 && chapters.length > 0) {
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
            onClick={() => navigate("/admin/quizzes")}
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
          </div>
        </div>

        <div
          className="max-w-2xl mx-auto rounded-2xl shadow-lg overflow-hidden p-8 text-center"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}30`,
          }}
        >
          <FaCheckCircle
            className="text-6xl mx-auto mb-4"
            style={{ color: "#22C55E" }}
          />
          <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
            ทุกบทเรียนมี Pretest แล้ว!
          </h2>
          <p className="mb-6" style={{ color: colors.textSecondary }}>
            คุณสามารถแก้ไขแบบทดสอบที่มีอยู่ได้จากหน้าจัดการแบบทดสอบ
          </p>
          <button
            onClick={() => navigate("/admin/quizzes")}
            className="px-6 py-3 rounded-xl font-medium"
            style={{ backgroundColor: "#8B5CF6", color: "#FFF" }}
          >
            ไปหน้าจัดการแบบทดสอบ
          </button>
        </div>
      </div>
    );
  }

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
          onClick={() => navigate("/admin/quizzes")}
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
            เพิ่มแบบทดสอบ Pretest ใหม่ ({pretests.length}/6 บท)
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
          {/* Chapter Selection */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium flex items-center gap-2"
              style={{ color: colors.textSecondary }}
            >
              <FaBook /> เลือกบทเรียน <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl focus:outline-none appearance-none cursor-pointer"
              style={inputStyle}
            >
              <option value="">-- เลือกบทเรียน --</option>
              {availableChapters.map((chapter, index) => {
                const originalIndex = chapters.findIndex(
                  (c) => c._id === chapter._id
                );
                return (
                  <option key={chapter._id} value={chapter._id}>
                    บทที่ {originalIndex + 1}: {chapter.chapter_name}
                  </option>
                );
              })}
            </select>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              * แสดงเฉพาะบทที่ยังไม่มี Pretest (เหลือ {availableChapters.length}{" "}
              บท)
            </p>
          </div>

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
              onClick={() => navigate("/admin/quizzes")}
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
              disabled={isLoading || !selectedChapterId}
              className="flex-1 py-3 px-6 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
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
