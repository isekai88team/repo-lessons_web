import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaSpinner,
  FaCog,
  FaDice,
  FaCheckSquare,
  FaSave,
  FaEye,
  FaTimes,
  FaQuestionCircle,
  FaClock,
  FaPercent,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import {
  useFetchPretestByIdQuery,
  useFetchPosttestsByChapterQuery,
  useCreatePosttestMutation,
  useUpdatePosttestMutation,
} from "../../redux/features/admin/adminApi";

const PosttestSettings = () => {
  const { pretestId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();

  // Fetch pretest data
  const { data: pretestData, isLoading: isLoadingPretest } =
    useFetchPretestByIdQuery(pretestId);
  const pretest = pretestData?.pretest;

  // Fetch existing posttest for this chapter
  const { data: posttestsData, isLoading: isLoadingPosttest } =
    useFetchPosttestsByChapterQuery(pretest?.chapter?._id, {
      skip: !pretest?.chapter?._id,
    });
  const existingPosttest = posttestsData?.posttests?.find(
    (p) => p.sourcePretest?._id === pretestId
  );

  const isEditMode = !!existingPosttest;

  const [createPosttest, { isLoading: isCreating }] =
    useCreatePosttestMutation();
  const [updatePosttest, { isLoading: isUpdating }] =
    useUpdatePosttestMutation();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [passingScore, setPassingScore] = useState(60);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Selection mode state
  const [selectionMode, setSelectionMode] = useState("random"); // random, specific
  const [randomCount, setRandomCount] = useState(10);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState([]);

  // Load existing settings or defaults
  useEffect(() => {
    if (existingPosttest) {
      setTitle(existingPosttest.title || "");
      setDescription(existingPosttest.description || "");
      setDuration(existingPosttest.duration || 30);
      setPassingScore(existingPosttest.passingScore || 60);
      setShuffleQuestions(existingPosttest.shuffleQuestions ?? true);
      setShowCorrectAnswers(existingPosttest.showCorrectAnswers ?? true);
      setIsActive(existingPosttest.isActive ?? true);

      // Check if specific questions were saved
      if (existingPosttest.selectedQuestionIds?.length > 0) {
        setSelectionMode("specific");
        // Load selected question IDs
        const ids = existingPosttest.selectedQuestionIds || [];
        const questions = pretest?.questions?.filter((q) =>
          ids.includes(q._id)
        );
        setSelectedQuestions(questions || []);
      } else {
        setSelectionMode("random");
        // Use questionCount directly from the database
        setRandomCount(existingPosttest.questionCount || 5);
      }
    } else if (pretest) {
      setTitle(`Posttest - ${pretest.title}`);
      setDescription(pretest.description || "");
      setDuration(pretest.duration || 30);
      setRandomCount(Math.min(10, pretest.questions?.length || 10));
    }
  }, [existingPosttest, pretest]);

  // Shuffle array helper
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate preview questions
  const generatePreviewQuestions = () => {
    const allQuestions = pretest?.questions || [];
    let selected = [];

    if (selectionMode === "random") {
      const shuffled = shuffleArray(allQuestions);
      selected = shuffled.slice(0, Math.min(randomCount, allQuestions.length));
    } else {
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

  // Handle submit
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("กรุณากรอกชื่อ Posttest");
      return;
    }

    let payload = {
      title,
      description,
      duration,
      passingScore,
      shuffleQuestions,
      showCorrectAnswers,
      isActive,
      selectionMode,
    };

    if (selectionMode === "random") {
      if (randomCount < 1) {
        toast.error("กรุณาระบุจำนวนข้อสอบ");
        return;
      }
      payload.questionCount = randomCount;
      // Distribute evenly across types (API will handle)
      payload.multipleChoiceCount = randomCount;
      payload.trueFalseCount = 0;
      payload.shortAnswerCount = 0;
      payload.matchingCount = 0;
    } else if (selectionMode === "specific") {
      if (selectedQuestions.length < 1) {
        toast.error("กรุณาเลือกคำถามอย่างน้อย 1 ข้อ");
        return;
      }
      payload.selectedQuestionIds = selectedQuestions.map((q) => q._id);
      payload.questionCount = selectedQuestions.length;
    }

    try {
      if (isEditMode) {
        await updatePosttest({ id: existingPosttest._id, ...payload }).unwrap();
        toast.success("อัปเดตการตั้งค่า Posttest สำเร็จ! ✅");
      } else {
        await createPosttest({
          sourcePretest: pretestId,
          chapter: pretest.chapter?._id,
          subject: pretest.subject?._id || pretest.subject,
          ...payload,
        }).unwrap();
        toast.success("สร้างการตั้งค่า Posttest สำเร็จ! 🎉");
      }
      setTimeout(() => navigate("/admin/quizzes"), 1500);
    } catch (error) {
      toast.error(error?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  // Loading state
  if (isLoadingPretest || isLoadingPosttest) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <FaSpinner className="animate-spin text-4xl text-amber-500" />
      </div>
    );
  }

  if (!pretest) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[400px]"
        style={{ color: colors.textSecondary }}
      >
        <FaQuestionCircle className="text-5xl mb-4 opacity-20" />
        <p>ไม่พบแบบทดสอบ</p>
      </div>
    );
  }

  const allQuestions = pretest.questions || [];
  const totalAvailable = allQuestions.length;

  // Get current selection count
  const currentCount =
    selectionMode === "random" ? randomCount : selectedQuestions.length;

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/admin/quizzes")}
          className={`p-3 rounded-xl ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } shadow`}
        >
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <FaCog className="text-amber-500" />
            ตั้งค่า Posttest
          </h1>
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {pretest.title} • {pretest.chapter?.chapter_name}
          </p>
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
                  ชื่อ Posttest *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-300"
                  } focus:ring-2 focus:ring-amber-500 outline-none`}
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
                  } focus:ring-2 focus:ring-amber-500 outline-none`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <FaClock className="inline mr-1" /> เวลาทำ (นาที)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={1}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-white border-gray-300"
                    } focus:ring-2 focus:ring-amber-500 outline-none`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <FaPercent className="inline mr-1" /> คะแนนผ่าน (%)
                  </label>
                  <input
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    min={0}
                    max={100}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-white border-gray-300"
                    } focus:ring-2 focus:ring-amber-500 outline-none`}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">สุ่มลำดับข้อสอบ</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCorrectAnswers}
                    onChange={(e) => setShowCorrectAnswers(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">แสดงเฉลยหลังส่ง</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">เปิดใช้งาน</span>
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
              {/* Random Mode */}
              <label
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                  selectionMode === "random"
                    ? isDarkMode
                      ? "border-amber-500 bg-amber-900/30"
                      : "border-amber-500 bg-amber-50"
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
                    <FaDice className="text-amber-500" />
                    สุ่มอัตโนมัติ
                  </div>
                  <p
                    className={`text-sm mt-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    ระบบจะสุ่มคำถามจาก Pretest ตามจำนวนที่กำหนด
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

              {/* Specific Mode */}
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
                    <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                      {allQuestions.map((q, index) => (
                        <label
                          key={q._id}
                          className={`flex items-start gap-2 p-3 rounded cursor-pointer text-sm ${
                            selectedQuestions.some((sq) => sq._id === q._id)
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
                            onChange={() => toggleQuestionSelection(q)}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <span className="font-medium text-purple-500 mr-2">
                              {index + 1}.
                            </span>
                            <span className="line-clamp-2">
                              {q.questionText}
                            </span>
                            <span
                              className={`text-xs ml-2 ${
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                            >
                              [{q.questionType}]
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
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
                  คำถามใน Pretest:
                </span>
                <span className="font-medium">{totalAvailable} ข้อ</span>
              </div>
              <div className="flex justify-between">
                <span
                  className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                >
                  วิธีเลือก:
                </span>
                <span className="font-medium">
                  {selectionMode === "random"
                    ? "สุ่มอัตโนมัติ"
                    : "เลือกข้อเฉพาะ"}
                </span>
              </div>
              <div className="flex justify-between">
                <span
                  className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                >
                  จำนวนที่เลือก:
                </span>
                <span className="font-medium text-amber-500">
                  {currentCount} ข้อ
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
                disabled={isCreating || isUpdating}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isCreating || isUpdating ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSave />
                )}
                {isEditMode ? "บันทึกการแก้ไข" : "บันทึก Posttest"}
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
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-500 text-white text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{q.questionText}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {q.questionType} | {q.points || 1} คะแนน
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosttestSettings;
