import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useFetchPosttestByIdQuery,
  useFetchPretestsByChapterQuery,
  useUpdatePosttestMutation,
} from "../../redux/features/admin/adminApi";
import {
  FaClipboardCheck,
  FaSpinner,
  FaArrowLeft,
  FaSave,
  FaRandom,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const EditPosttest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();

  const { data, isLoading } = useFetchPosttestByIdQuery(id);
  const posttest = data?.posttest;

  const [updatePosttest, { isLoading: isUpdating }] =
    useUpdatePosttestMutation();

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

  // Fetch pretests for the chapter
  const { data: pretestsData } = useFetchPretestsByChapterQuery(
    posttest?.chapter?._id || posttest?.chapter,
    { skip: !posttest?.chapter }
  );
  const pretests = pretestsData?.pretests || [];

  // Load posttest data
  useEffect(() => {
    if (posttest) {
      setFormData({
        sourcePretest:
          posttest.sourcePretest?._id || posttest.sourcePretest || "",
        title: posttest.title || "",
        description: posttest.description || "",
        duration: posttest.duration || 30,
        passingScore: posttest.passingScore || 60,
        questionCount: posttest.questionCount || 0,
        isActive: posttest.isActive !== undefined ? posttest.isActive : true,
        shuffleQuestions:
          posttest.shuffleQuestions !== undefined
            ? posttest.shuffleQuestions
            : true,
        showCorrectAnswers:
          posttest.showCorrectAnswers !== undefined
            ? posttest.showCorrectAnswers
            : true,
      });
    }
  }, [posttest]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePosttest({ id, ...formData }).unwrap();
      toast.success("อัปเดตแบบทดสอบสำเร็จ!", { icon: "✅" });
      navigate(-1);
    } catch (err) {
      toast.error(err?.data?.message || "อัปเดตไม่สำเร็จ");
    }
  };

  const handlePretestSelect = (pretestId) => {
    const selectedPretest = pretests.find((p) => p._id === pretestId);
    const maxQuestions = selectedPretest?.questions?.length || 0;
    setFormData((prev) => ({
      ...prev,
      sourcePretest: pretestId,
      questionCount: Math.min(prev.questionCount, maxQuestions) || maxQuestions,
    }));
  };

  const inputStyle = {
    backgroundColor: isDarkMode ? colors.background : "#F5F6F7",
    border: `1px solid ${colors.border}`,
    color: colors.text,
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

  if (!posttest) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen"
        style={{
          backgroundColor: colors.background,
          color: colors.textSecondary,
        }}
      >
        <FaClipboardCheck className="text-5xl mb-4 opacity-20" />
        <p>ไม่พบแบบทดสอบ</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 rounded-xl"
          style={{ backgroundColor: "#22C55E", color: "#FFF" }}
        >
          กลับ
        </button>
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
            แก้ไขแบบทดสอบหลังเรียน
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            {posttest.title}
          </p>
        </div>
      </div>

      {/* Form */}
      <div
        className="rounded-2xl p-6 max-w-2xl mx-auto"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}30`,
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Select Source Pretest */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text }}
            >
              Pretest ต้นทาง <span className="text-red-500">*</span>
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
          </div>

          {/* Title */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text }}
            >
              ชื่อแบบทดสอบ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-xl"
              style={inputStyle}
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
            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
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

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded"
              />
              <span style={{ color: colors.text }}>เปิดใช้งาน</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.shuffleQuestions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    shuffleQuestions: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded"
              />
              <span style={{ color: colors.text }}>สุ่มลำดับคำถาม</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showCorrectAnswers}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    showCorrectAnswers: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded"
              />
              <span style={{ color: colors.text }}>แสดงเฉลยหลังส่ง</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
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
              disabled={isUpdating}
              className="flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2"
              style={{ backgroundColor: "#22C55E", color: "#FFF" }}
            >
              {isUpdating ? <FaSpinner className="animate-spin" /> : <FaSave />}
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPosttest;
