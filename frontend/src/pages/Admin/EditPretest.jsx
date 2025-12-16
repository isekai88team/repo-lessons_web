import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useFetchPretestByIdQuery,
  useUpdatePretestMutation,
  useAddQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} from "../../redux/features/admin/adminApi";
import {
  FaClipboardList,
  FaSpinner,
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaCheck,
  FaQuestionCircle,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import MatchingPairsEditor from "../../components/MatchingPairsEditor";

const EditPretest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();

  const { data, isLoading, refetch } = useFetchPretestByIdQuery(id);
  const [updatePretest, { isLoading: isUpdating }] = useUpdatePretestMutation();
  const [addQuestion, { isLoading: isAddingQuestion }] =
    useAddQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 30,
    passingScore: 60,
    allowRetake: false,
    maxAttempts: 1,
    shuffleQuestions: false,
    showCorrectAnswers: true,
    isActive: true,
  });

  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    questionType: "multiple-choice",
    options: ["", "", "", ""],
    correctAnswer: "",
    matchingPairs: [
      { left: "", right: "" },
      { left: "", right: "" },
      { left: "", right: "" },
    ],
    points: 1,
    explanation: "",
    imageFile: null,
    questionImage: "",
  });

  useEffect(() => {
    if (data?.pretest) {
      const p = data.pretest;
      setFormData({
        title: p.title || "",
        description: p.description || "",
        duration: p.duration || 30,
        passingScore: p.passingScore || 60,
        allowRetake: p.allowRetake || false,
        maxAttempts: p.maxAttempts || 1,
        shuffleQuestions: p.shuffleQuestions || false,
        showCorrectAnswers: p.showCorrectAnswers !== false,
        isActive: p.isActive !== false,
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdatePretest = async () => {
    try {
      await updatePretest({
        id,
        ...formData,
        duration: parseInt(formData.duration),
        passingScore: parseInt(formData.passingScore),
        maxAttempts: parseInt(formData.maxAttempts),
      }).unwrap();
      toast.success("บันทึกสำเร็จ!");
    } catch (error) {
      toast.error(error?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const openAddQuestion = () => {
    setEditingQuestionIndex(null);
    setQuestionForm({
      questionText: "",
      questionType: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      matchingPairs: [
        { left: "", right: "" },
        { left: "", right: "" },
        { left: "", right: "" },
      ],
      points: 1,
      explanation: "",
      imageFile: null,
      questionImage: "",
    });
    setShowQuestionModal(true);
  };

  const openEditQuestion = (index) => {
    const q = data.pretest.questions[index];
    setEditingQuestionIndex(index);
    setQuestionForm({
      questionText: q.questionText || "",
      questionType: q.questionType || "multiple-choice",
      options: q.options?.length > 0 ? [...q.options] : ["", "", "", ""],
      correctAnswer: q.correctAnswer || "",
      matchingPairs:
        q.matchingPairs?.length > 0
          ? [...q.matchingPairs]
          : [
              { left: "", right: "" },
              { left: "", right: "" },
              { left: "", right: "" },
            ],
      points: q.points || 1,
      explanation: q.explanation || "",
      imageFile: null,
      questionImage: q.questionImage || "",
    });
    setShowQuestionModal(true);
  };

  const handleQuestionSubmit = async () => {
    if (!questionForm.questionText) {
      toast.error("กรุณากรอกคำถาม");
      return;
    }
    // Validate based on type
    if (questionForm.questionType === "matching") {
      const validPairs = questionForm.matchingPairs.filter(
        (p) =>
          (p.left || p.leftImage || p.leftImageFile) &&
          (p.right || p.rightImage || p.rightImageFile)
      );
      if (validPairs.length < 2) {
        toast.error("กรุณากรอกคู่จับคู่อย่างน้อย 2 คู่ (ใส่ข้อความหรือรูปภาพ)");
        return;
      }
    } else if (!questionForm.correctAnswer) {
      toast.error("กรุณาระบุคำตอบที่ถูกต้อง");
      return;
    }

    try {
      const formDataBody = new FormData();
      formDataBody.append("questionText", questionForm.questionText);
      formDataBody.append("questionType", questionForm.questionType);

      // Append options
      const filteredOptions = questionForm.options.filter(
        (o) => o?.trim() !== ""
      );
      filteredOptions.forEach((opt, index) => {
        formDataBody.append(`options[${index}]`, opt);
      });

      formDataBody.append("correctAnswer", questionForm.correctAnswer);

      // Append matching pairs with images
      const validPairs = questionForm.matchingPairs.filter(
        (p) =>
          p.left ||
          p.right ||
          p.leftImageFile ||
          p.rightImageFile ||
          p.leftImage ||
          p.rightImage
      );
      validPairs.forEach((p, index) => {
        formDataBody.append(`matchingPairs[${index}][left]`, p.left || "");
        formDataBody.append(`matchingPairs[${index}][right]`, p.right || "");

        // Append matching pair images with naming convention: left_0, right_0, etc.
        if (p.leftImageFile) {
          // Rename file to identify which pair it belongs to
          const leftFile = new File(
            [p.leftImageFile],
            `left_${index}_${p.leftImageFile.name}`,
            { type: p.leftImageFile.type }
          );
          formDataBody.append("matchingImages", leftFile);
        }
        if (p.rightImageFile) {
          const rightFile = new File(
            [p.rightImageFile],
            `right_${index}_${p.rightImageFile.name}`,
            { type: p.rightImageFile.type }
          );
          formDataBody.append("matchingImages", rightFile);
        }
      });

      formDataBody.append("points", questionForm.points);
      formDataBody.append("explanation", questionForm.explanation);

      if (questionForm.imageFile) {
        formDataBody.append("questionImage", questionForm.imageFile);
      }

      if (editingQuestionIndex !== null) {
        await updateQuestion({
          pretestId: id,
          questionIndex: editingQuestionIndex,
          body: formDataBody,
        }).unwrap();
        toast.success("อัปเดตคำถามสำเร็จ!");
      } else {
        await addQuestion({
          pretestId: id,
          question: formDataBody,
        }).unwrap();
        toast.success("เพิ่มคำถามสำเร็จ!");
      }
      setShowQuestionModal(false);
      refetch();
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleDeleteQuestion = async (index) => {
    if (!window.confirm("ลบคำถามนี้?")) return;
    try {
      await deleteQuestion({ pretestId: id, questionIndex: index }).unwrap();
      toast.success("ลบคำถามสำเร็จ!");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "เกิดข้อผิดพลาด");
    }
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
          style={{ color: "#8B5CF6" }}
        />
      </div>
    );
  }

  const pretest = data?.pretest;
  const questions = pretest?.questions || [];

  return (
    <div
      className="min-h-screen p-6 lg:p-10 font-sans transition-colors"
      style={{
        backgroundColor: isDarkMode
          ? colors.background
          : `${colors.background}50`,
      }}
    >
      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: colors.cardBg }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: colors.text }}>
                {editingQuestionIndex !== null
                  ? "แก้ไขคำถาม"
                  : "เพิ่มคำถามใหม่"}
              </h3>
              <button
                onClick={() => setShowQuestionModal(false)}
                style={{ color: colors.textSecondary }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              {/* Question Text */}
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  คำถาม <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={questionForm.questionText}
                  onChange={(e) =>
                    setQuestionForm((p) => ({
                      ...p,
                      questionText: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none mt-1"
                  style={inputStyle}
                  placeholder="พิมพ์คำถาม..."
                />
              </div>

              {/* Question Image */}
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  รูปภาพประกอบ (ถ้ามี)
                </label>
                <div className="mt-2">
                  {(questionForm.questionImage || questionForm.imageFile) && (
                    <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden mb-3">
                      <img
                        src={
                          questionForm.imageFile
                            ? URL.createObjectURL(questionForm.imageFile)
                            : questionForm.questionImage
                        }
                        alt="Question Preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() =>
                          setQuestionForm((p) => ({
                            ...p,
                            imageFile: null,
                            questionImage: "",
                          }))
                        }
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow hover:bg-red-600"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setQuestionForm((p) => ({
                          ...p,
                          imageFile: e.target.files[0],
                        }));
                      }
                    }}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-violet-50 file:text-violet-700
                      hover:file:bg-violet-100"
                  />
                </div>
              </div>

              {/* Question Type */}
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  ประเภทคำถาม
                </label>
                <select
                  value={questionForm.questionType}
                  onChange={(e) =>
                    setQuestionForm((p) => ({
                      ...p,
                      questionType: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl focus:outline-none mt-1"
                  style={inputStyle}
                >
                  <option value="multiple-choice">
                    ปรนัย (Multiple Choice)
                  </option>
                  <option value="true-false">ถูก/ผิด (True/False)</option>
                  <option value="short-answer">ตอบสั้น (Short Answer)</option>
                  <option value="matching">จับคู่ (Matching)</option>
                </select>
              </div>

              {/* Options for multiple choice */}
              {questionForm.questionType === "multiple-choice" && (
                <div>
                  <label
                    className="text-sm font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    ตัวเลือก
                  </label>
                  <div className="space-y-2 mt-1">
                    {questionForm.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{
                            backgroundColor: `${colors.primary}20`,
                            color: colors.primary,
                          }}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <input
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...questionForm.options];
                            newOpts[i] = e.target.value;
                            setQuestionForm((p) => ({
                              ...p,
                              options: newOpts,
                            }));
                          }}
                          className="flex-1 px-4 py-2 rounded-xl focus:outline-none"
                          style={inputStyle}
                          placeholder={`ตัวเลือก ${String.fromCharCode(
                            65 + i
                          )}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Pairs - with Drag & Drop */}
              {questionForm.questionType === "matching" && (
                <MatchingPairsEditor
                  pairs={questionForm.matchingPairs}
                  onChange={(newPairs) =>
                    setQuestionForm((p) => ({
                      ...p,
                      matchingPairs: newPairs,
                    }))
                  }
                  isDarkMode={isDarkMode}
                  colors={colors}
                  inputStyle={inputStyle}
                  minPairs={2}
                />
              )}

              {/* Correct Answer (hide for matching) */}
              {questionForm.questionType !== "matching" && (
                <div>
                  <label
                    className="text-sm font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    คำตอบที่ถูกต้อง <span className="text-red-500">*</span>
                  </label>
                  {questionForm.questionType === "multiple-choice" ? (
                    <select
                      value={questionForm.correctAnswer}
                      onChange={(e) =>
                        setQuestionForm((p) => ({
                          ...p,
                          correctAnswer: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl focus:outline-none mt-1"
                      style={inputStyle}
                    >
                      <option value="">-- เลือกคำตอบที่ถูก --</option>
                      {questionForm.options.map(
                        (opt, i) =>
                          opt && (
                            <option key={i} value={opt}>
                              {String.fromCharCode(65 + i)}. {opt}
                            </option>
                          )
                      )}
                    </select>
                  ) : questionForm.questionType === "true-false" ? (
                    <select
                      value={questionForm.correctAnswer}
                      onChange={(e) =>
                        setQuestionForm((p) => ({
                          ...p,
                          correctAnswer: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl focus:outline-none mt-1"
                      style={inputStyle}
                    >
                      <option value="">-- เลือก --</option>
                      <option value="true">ถูก (True)</option>
                      <option value="false">ผิด (False)</option>
                    </select>
                  ) : (
                    <input
                      value={questionForm.correctAnswer}
                      onChange={(e) =>
                        setQuestionForm((p) => ({
                          ...p,
                          correctAnswer: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl focus:outline-none mt-1"
                      style={inputStyle}
                      placeholder="พิมพ์คำตอบที่ถูกต้อง"
                    />
                  )}
                </div>
              )}

              {/* Points */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-sm font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    คะแนน
                  </label>
                  <input
                    type="number"
                    value={questionForm.points}
                    onChange={(e) =>
                      setQuestionForm((p) => ({
                        ...p,
                        points: parseInt(e.target.value) || 1,
                      }))
                    }
                    min={1}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none mt-1"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  คำอธิบาย (เฉลย)
                </label>
                <textarea
                  value={questionForm.explanation}
                  onChange={(e) =>
                    setQuestionForm((p) => ({
                      ...p,
                      explanation: e.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none mt-1"
                  style={inputStyle}
                  placeholder="อธิบายว่าทำไมคำตอบนี้ถูก..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowQuestionModal(false)}
                  className="flex-1 py-2 px-4 rounded-xl"
                  style={{
                    border: `1px solid ${colors.border}`,
                    color: colors.textSecondary,
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleQuestionSubmit}
                  disabled={isAddingQuestion}
                  className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  {isAddingQuestion ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaCheck />
                  )}
                  {editingQuestionIndex !== null ? "บันทึก" : "เพิ่มคำถาม"}
                </button>
              </div>
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
            <FaClipboardList style={{ color: "#8B5CF6" }} />
            แก้ไขแบบทดสอบ
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            {pretest?.title}
          </p>
        </div>
        <button
          onClick={handleUpdatePretest}
          disabled={isUpdating}
          className="flex items-center gap-2 px-5 py-3 font-bold rounded-xl"
          style={{ backgroundColor: "#22c55e", color: "#FFF" }}
        >
          {isUpdating ? <FaSpinner className="animate-spin" /> : <FaSave />}
          บันทึก
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div
          className="lg:col-span-1 rounded-2xl p-6"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}30`,
          }}
        >
          <h2 className="font-bold mb-4" style={{ color: colors.text }}>
            ตั้งค่า
          </h2>
          <div className="space-y-4">
            <div>
              <label
                className="text-sm"
                style={{ color: colors.textSecondary }}
              >
                ชื่อ
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg focus:outline-none mt-1"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                className="text-sm"
                style={{ color: colors.textSecondary }}
              >
                คำอธิบาย
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 rounded-lg focus:outline-none mt-1 resize-none"
                style={inputStyle}
                placeholder="อธิบายรายละเอียดแบบทดสอบ..."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  เวลา (นาที)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none mt-1"
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  ผ่าน (%)
                </label>
                <input
                  type="number"
                  name="passingScore"
                  value={formData.passingScore}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none mt-1"
                  style={inputStyle}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <span style={{ color: colors.text }}>เปิดใช้งาน</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="shuffleQuestions"
                checked={formData.shuffleQuestions}
                onChange={handleChange}
              />
              <span style={{ color: colors.text }}>สุ่มคำถาม</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="showCorrectAnswers"
                checked={formData.showCorrectAnswers}
                onChange={handleChange}
              />
              <span style={{ color: colors.text }}>แสดงเฉลย</span>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div
          className="lg:col-span-2 rounded-2xl"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}30`,
          }}
        >
          <div
            className="p-6 flex items-center justify-between border-b"
            style={{ borderColor: colors.border }}
          >
            <div>
              <h2 className="font-bold" style={{ color: colors.text }}>
                คำถาม ({questions.length})
              </h2>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                คะแนนรวม: {pretest?.totalPoints || 0}
              </p>
            </div>
            <button
              onClick={openAddQuestion}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium"
              style={{ backgroundColor: "#8B5CF6", color: "#FFF" }}
            >
              <FaPlus /> เพิ่มคำถาม
            </button>
          </div>

          {questions.length === 0 ? (
            <div
              className="p-12 text-center"
              style={{ color: colors.textSecondary }}
            >
              <FaQuestionCircle className="text-5xl mx-auto mb-3 opacity-20" />
              <p>ยังไม่มีคำถาม</p>
              <button
                onClick={openAddQuestion}
                className="mt-4 px-4 py-2 rounded-xl"
                style={{
                  backgroundColor: `${colors.primary}20`,
                  color: colors.primary,
                }}
              >
                <FaPlus className="inline mr-2" /> เพิ่มคำถามแรก
              </button>
            </div>
          ) : (
            <div
              className="divide-y"
              style={{ borderColor: `${colors.border}30` }}
            >
              {questions.map((q, index) => (
                <div
                  key={index}
                  className="p-4 flex items-start gap-4 hover:bg-gray-500/5"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{
                      backgroundColor: `${colors.primary}20`,
                      color: colors.primary,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: colors.text }}>
                      {q.questionText}
                    </p>
                    <div
                      className="flex items-center gap-3 mt-2 text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      <span
                        className="px-2 py-1 rounded"
                        style={{ backgroundColor: `${colors.border}30` }}
                      >
                        {q.questionType === "multiple-choice"
                          ? "ปรนัย"
                          : q.questionType === "true-false"
                          ? "ถูก/ผิด"
                          : q.questionType === "matching"
                          ? "จับคู่"
                          : "ตอบสั้น"}
                      </span>
                      <span>{q.points} คะแนน</span>
                      <span className="text-green-500">
                        {q.questionType === "matching"
                          ? `✓ ${q.matchingPairs?.length || 0} คู่`
                          : `✓ ${q.correctAnswer}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditQuestion(index)}
                      className="p-2 rounded-lg hover:bg-blue-500/20"
                      style={{ color: "#60A5FA" }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(index)}
                      className="p-2 rounded-lg hover:bg-red-500/20"
                      style={{ color: "#F87171" }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPretest;
