import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useFetchAllPretestQuestionsQuery,
  useFetchSubjectByIdQuery,
  useCreateFinalExamMutation,
  useFetchFinalExamBySubjectQuery,
  useUpdateFinalExamMutation,
  useDeleteFinalExamMutation,
} from "../../redux/features/admin/adminApi";
import {
  FaArrowLeft,
  FaSpinner,
  FaDice,
  FaListOl,
  FaCheckSquare,
  FaSave,
  FaEye,
  FaTimes,
  FaQuestionCircle,
  FaClock,
  FaPercent,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const CreateFinalExam = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();

  // Fetch data
  const { data: questionsData, isLoading: questionsLoading } =
    useFetchAllPretestQuestionsQuery(subjectId);
  const { data: subjectData, isLoading: subjectLoading } =
    useFetchSubjectByIdQuery(subjectId);
  const { data: existingExamData, isLoading: examLoading } =
    useFetchFinalExamBySubjectQuery(subjectId);
  const [createFinalExam, { isLoading: creating }] =
    useCreateFinalExamMutation();
  const [updateFinalExam, { isLoading: updating }] =
    useUpdateFinalExamMutation();
  const [deleteFinalExam, { isLoading: deleting }] =
    useDeleteFinalExamMutation();

  // Edit mode state
  const existingExam = existingExamData?.finalExam;
  const isEditMode = !!existingExam;

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [passingScore, setPassingScore] = useState(60);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);

  // Selection mode state
  const [selectionMode, setSelectionMode] = useState("random"); // random, perChapter, specific
  const [randomCount, setRandomCount] = useState(10);
  const [chapterCounts, setChapterCounts] = useState({});
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState([]);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Set default title or load existing data
  useEffect(() => {
    if (existingExam) {
      // Load existing final exam data for editing
      setTitle(existingExam.title || "");
      setDescription(existingExam.description || "");
      setDuration(existingExam.duration || 60);
      setPassingScore(existingExam.passingScore || 60);
      setShuffleQuestions(existingExam.shuffleQuestions ?? true);
      setShowCorrectAnswers(existingExam.showCorrectAnswers ?? true);

      // Load existing questions into selectedQuestions for specific mode
      if (existingExam.questions?.length > 0) {
        setSelectionMode("specific");
        setSelectedQuestions(
          existingExam.questions.map((q, i) => ({
            ...q,
            _id: `existing-${i}`,
          }))
        );
      }
    } else if (subjectData?.subject) {
      setTitle(`Final Exam - ${subjectData.subject.subject_name}`);
    }
  }, [existingExam, subjectData]);

  // Initialize chapter counts
  useEffect(() => {
    if (questionsData?.chapters) {
      const counts = {};
      questionsData.chapters.forEach((ch) => {
        counts[ch.chapterId] = 0;
      });
      setChapterCounts(counts);
    }
  }, [questionsData]);

  // Get all questions flat array
  const getAllQuestions = () => {
    if (!questionsData?.chapters) return [];
    return questionsData.chapters.flatMap((ch) =>
      ch.questions.map((q) => ({
        ...q,
        chapterId: ch.chapterId,
        chapterName: ch.chapterName,
      }))
    );
  };

  // Shuffle array helper
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate preview questions based on selection mode
  const generatePreviewQuestions = () => {
    const allQuestions = getAllQuestions();
    let selected = [];

    if (selectionMode === "random") {
      const shuffled = shuffleArray(allQuestions);
      selected = shuffled.slice(0, Math.min(randomCount, allQuestions.length));
    } else if (selectionMode === "perChapter") {
      questionsData?.chapters?.forEach((ch) => {
        const count = chapterCounts[ch.chapterId] || 0;
        if (count > 0) {
          const shuffled = shuffleArray(ch.questions);
          selected.push(
            ...shuffled.slice(0, count).map((q) => ({
              ...q,
              chapterId: ch.chapterId,
              chapterName: ch.chapterName,
            }))
          );
        }
      });
    } else if (selectionMode === "specific") {
      selected = selectedQuestions;
    }

    setPreviewQuestions(selected);
    setShowPreview(true);
  };

  // Toggle question selection
  const toggleQuestionSelection = (question) => {
    const index = selectedQuestions.findIndex((q) => q._id === question._id);
    if (index === -1) {
      setSelectedQuestions([...selectedQuestions, question]);
    } else {
      setSelectedQuestions(
        selectedQuestions.filter((q) => q._id !== question._id)
      );
    }
  };

  // Handle submit (create or update)
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("กรุณากรอกชื่อข้อสอบ");
      return;
    }

    let questionsToSend = [];

    if (selectionMode === "random") {
      if (randomCount < 1) {
        toast.error("กรุณาระบุจำนวนข้อสอบ");
        return;
      }
      // Backend will handle random selection
    } else if (selectionMode === "perChapter") {
      const totalCount = Object.values(chapterCounts).reduce(
        (sum, c) => sum + c,
        0
      );
      if (totalCount < 1) {
        toast.error("กรุณาระบุจำนวนข้อสอบอย่างน้อย 1 ข้อ");
        return;
      }
    } else if (selectionMode === "specific") {
      if (selectedQuestions.length < 1) {
        toast.error("กรุณาเลือกคำถามอย่างน้อย 1 ข้อ");
        return;
      }
      questionsToSend = selectedQuestions;
    }

    try {
      if (isEditMode) {
        // Update existing exam
        const updatePayload = {
          id: existingExam._id,
          title,
          description,
          duration,
          passingScore,
          questions: questionsToSend.map((q) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            correctAnswer: q.correctAnswer,
            matchingPairs: q.matchingPairs,
            points: q.points || 1,
            explanation: q.explanation,
          })),
          shuffleQuestions,
          showCorrectAnswers,
        };

        await updateFinalExam(updatePayload).unwrap();
        toast.success("อัปเดต Final Exam สำเร็จ!");
      } else {
        // Create new exam
        const payload = {
          subjectId,
          title,
          description,
          duration,
          passingScore,
          selectionMode,
          questionCount: selectionMode === "random" ? randomCount : undefined,
          chapterCounts:
            selectionMode === "perChapter" ? chapterCounts : undefined,
          selectedQuestions:
            selectionMode === "specific" ? questionsToSend : undefined,
          shuffleQuestions,
          showCorrectAnswers,
        };

        await createFinalExam(payload).unwrap();
        toast.success("สร้าง Final Exam สำเร็จ!");
      }
    } catch (error) {
      toast.error(error?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!existingExam?._id) return;

    try {
      await deleteFinalExam(existingExam._id).unwrap();
      toast.success("ลบ Final Exam สำเร็จ!");
      navigate("/admin/quizzes");
    } catch (error) {
      toast.error(error?.data?.message || "เกิดข้อผิดพลาดในการลบ");
    }
  };

  // Loading state
  if (questionsLoading || subjectLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  const chapters = questionsData?.chapters || [];
  const totalAvailable = questionsData?.totalQuestions || 0;

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              {isEditMode ? (
                <>
                  <FaEdit className="inline mr-2" />
                  แก้ไข Final Exam
                </>
              ) : (
                "สร้าง Final Exam"
              )}
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div
            className={`p-6 rounded-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <h2 className="text-lg font-bold mb-4">ข้อมูลพื้นฐาน</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  ชื่อข้อสอบ *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 outline-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  คำอธิบาย
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 outline-none`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">
                    <FaClock className="inline mr-1" /> เวลาทำ (นาที)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={1}
                    className={`w-full px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-white border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 outline-none`}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">
                    <FaPercent className="inline mr-1" /> คะแนนผ่าน (%)
                  </label>
                  <input
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    min={0}
                    max={100}
                    className={`w-full px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-white border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 outline-none`}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm">สุ่มลำดับข้อสอบ</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCorrectAnswers}
                    onChange={(e) => setShowCorrectAnswers(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm">แสดงเฉลยหลังส่ง</span>
                </label>
              </div>
            </div>
          </div>

          {/* Selection Mode */}
          <div
            className={`p-6 rounded-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <h2 className="text-lg font-bold mb-4">วิธีเลือกข้อสอบ</h2>
            <div className="space-y-4">
              {/* Radio: Random */}
              <label
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                  selectionMode === "random"
                    ? isDarkMode
                      ? "border-blue-500 bg-blue-900/30"
                      : "border-blue-500 bg-blue-50"
                    : isDarkMode
                    ? "border-gray-600 hover:border-gray-500 bg-gray-700/50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
                onClick={() => setSelectionMode("random")}
              >
                <input
                  type="radio"
                  name="selectionMode"
                  checked={selectionMode === "random"}
                  onChange={() => setSelectionMode("random")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    <FaDice className="text-blue-500" />
                    สุ่มอัตโนมัติ
                  </div>
                  <p
                    className={`text-sm mt-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    ระบบจะสุ่มคำถามจากทุกบทเรียน
                  </p>
                  {selectionMode === "random" && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm">จำนวน:</span>
                      <input
                        type="number"
                        value={randomCount}
                        onChange={(e) => setRandomCount(Number(e.target.value))}
                        min={1}
                        max={totalAvailable}
                        className={`w-20 px-3 py-1 rounded border ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600"
                            : "bg-white border-gray-300"
                        }`}
                      />
                      <span className="text-sm text-gray-500">
                        / {totalAvailable} ข้อ
                      </span>
                    </div>
                  )}
                </div>
              </label>

              {/* Radio: Per Chapter */}
              <label
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                  selectionMode === "perChapter"
                    ? isDarkMode
                      ? "border-green-500 bg-green-900/30"
                      : "border-green-500 bg-green-50"
                    : isDarkMode
                    ? "border-gray-600 hover:border-gray-500 bg-gray-700/50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
                onClick={() => setSelectionMode("perChapter")}
              >
                <input
                  type="radio"
                  name="selectionMode"
                  checked={selectionMode === "perChapter"}
                  onChange={() => setSelectionMode("perChapter")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    <FaListOl className="text-green-500" />
                    เลือกจำนวนต่อบท
                  </div>
                  <p
                    className={`text-sm mt-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    กำหนดจำนวนคำถามจากแต่ละบทเรียน
                  </p>
                  {selectionMode === "perChapter" && (
                    <div className="mt-3 space-y-2">
                      {chapters.map((ch) => (
                        <div
                          key={ch.chapterId}
                          className="flex items-center gap-3"
                        >
                          <span className="text-sm flex-1">
                            {ch.chapterName}
                          </span>
                          <input
                            type="number"
                            value={chapterCounts[ch.chapterId] || 0}
                            onChange={(e) =>
                              setChapterCounts({
                                ...chapterCounts,
                                [ch.chapterId]: Number(e.target.value),
                              })
                            }
                            min={0}
                            max={ch.questions.length}
                            className={`w-16 px-2 py-1 rounded border text-center ${
                              isDarkMode
                                ? "bg-gray-700 border-gray-600"
                                : "bg-white border-gray-300"
                            }`}
                          />
                          <span className="text-sm text-gray-500">
                            / {ch.questions.length}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </label>

              {/* Radio: Specific */}
              <label
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                  selectionMode === "specific"
                    ? isDarkMode
                      ? "border-purple-500 bg-purple-900/30"
                      : "border-purple-500 bg-purple-50"
                    : isDarkMode
                    ? "border-gray-600 hover:border-gray-500 bg-gray-700/50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
                onClick={() => setSelectionMode("specific")}
              >
                <input
                  type="radio"
                  name="selectionMode"
                  checked={selectionMode === "specific"}
                  onChange={() => setSelectionMode("specific")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    <FaCheckSquare className="text-purple-500" />
                    เลือกข้อเฉพาะ
                  </div>
                  <p
                    className={`text-sm mt-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    เลือกคำถามทีละข้อตามต้องการ
                  </p>
                  {selectionMode === "specific" && (
                    <div className="mt-3 space-y-3 max-h-80 overflow-y-auto">
                      {chapters.map((ch) => (
                        <div key={ch.chapterId}>
                          <div
                            className={`text-sm font-medium mb-2 ${
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            📚 {ch.chapterName}
                          </div>
                          <div className="space-y-1 pl-4">
                            {ch.questions.map((q) => (
                              <label
                                key={q._id}
                                className={`flex items-start gap-2 p-2 rounded cursor-pointer text-sm ${
                                  selectedQuestions.some(
                                    (sq) => sq._id === q._id
                                  )
                                    ? isDarkMode
                                      ? "bg-purple-900/50"
                                      : "bg-purple-100"
                                    : isDarkMode
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedQuestions.some(
                                    (sq) => sq._id === q._id
                                  )}
                                  onChange={() =>
                                    toggleQuestionSelection({
                                      ...q,
                                      chapterId: ch.chapterId,
                                      chapterName: ch.chapterName,
                                    })
                                  }
                                  className="mt-0.5"
                                />
                                <span className="line-clamp-2">
                                  {q.questionText}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Summary & Actions */}
        <div className="space-y-6">
          <div
            className={`p-6 rounded-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg sticky top-6`}
          >
            <h2 className="text-lg font-bold mb-4">สรุป</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span
                  className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                >
                  คำถามทั้งหมด:
                </span>
                <span className="font-medium">{totalAvailable} ข้อ</span>
              </div>
              <div className="flex justify-between">
                <span
                  className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                >
                  จำนวนบท:
                </span>
                <span className="font-medium">{chapters.length} บท</span>
              </div>
              <div className="flex justify-between">
                <span
                  className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                >
                  วิธีเลือก:
                </span>
                <span className="font-medium">
                  {selectionMode === "random" && "สุ่มอัตโนมัติ"}
                  {selectionMode === "perChapter" && "เลือกจำนวนต่อบท"}
                  {selectionMode === "specific" && "เลือกข้อเฉพาะ"}
                </span>
              </div>
              <div className="flex justify-between">
                <span
                  className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                >
                  จำนวนที่เลือก:
                </span>
                <span className="font-medium text-blue-500">
                  {selectionMode === "random" && `${randomCount} ข้อ`}
                  {selectionMode === "perChapter" &&
                    `${Object.values(chapterCounts).reduce(
                      (sum, c) => sum + c,
                      0
                    )} ข้อ`}
                  {selectionMode === "specific" &&
                    `${selectedQuestions.length} ข้อ`}
                </span>
              </div>
              <hr
                className={isDarkMode ? "border-gray-700" : "border-gray-200"}
              />
              <div className="flex justify-between">
                <span
                  className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                >
                  เวลาทำ:
                </span>
                <span className="font-medium">{duration} นาที</span>
              </div>
              <div className="flex justify-between">
                <span
                  className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                >
                  คะแนนผ่าน:
                </span>
                <span className="font-medium">{passingScore}%</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={generatePreviewQuestions}
                className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition"
              >
                <FaEye /> Preview
              </button>
              <button
                onClick={handleSubmit}
                disabled={creating || updating}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {creating || updating ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSave />
                )}
                {isEditMode ? "บันทึกการแก้ไข" : "สร้าง Final Exam"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } shadow-2xl`}
          >
            <div className="sticky top-0 p-4 border-b flex justify-between items-center bg-inherit">
              <h2 className="text-xl font-bold">
                <FaEye className="inline mr-2" />
                Preview ({previewQuestions.length} ข้อ)
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {previewQuestions.map((q, index) => (
                <div
                  key={q._id || index}
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{q.questionText}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        📚 {q.chapterName} | {q.questionType} | {q.points || 1}{" "}
                        คะแนน
                      </p>
                      {q.options && q.options.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {q.options.map((opt, i) => (
                            <div
                              key={i}
                              className={`text-sm px-3 py-1 rounded ${
                                opt === q.correctAnswer
                                  ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                                  : ""
                              }`}
                            >
                              {String.fromCharCode(65 + i)}. {opt}
                              {opt === q.correctAnswer && " ✓"}
                            </div>
                          ))}
                        </div>
                      )}
                      {q.matchingPairs && q.matchingPairs.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div className="font-medium">ซ้าย</div>
                          <div className="font-medium">ขวา (คำตอบ)</div>
                          {q.matchingPairs.map((pair, i) => (
                            <React.Fragment key={i}>
                              <div className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                {pair.left}
                              </div>
                              <div className="bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">
                                {pair.right}
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {previewQuestions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FaQuestionCircle className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>ไม่มีคำถามที่เลือก</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-md rounded-2xl p-6 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } shadow-2xl`}
          >
            <h2 className="text-xl font-bold mb-4 text-red-500">
              <FaTrash className="inline mr-2" />
              ยืนยันการลบ
            </h2>
            <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
              คุณต้องการลบ Final Exam "{title}" หรือไม่?
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } transition`}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {deleting ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaTrash />
                )}
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateFinalExam;
