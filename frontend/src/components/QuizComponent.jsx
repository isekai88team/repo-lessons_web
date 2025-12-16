import React, { useState, useEffect } from "react";
import {
  FaCheck,
  FaTimes,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaRedo,
  FaSearchPlus,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import MatchingQuestionDnd from "./MatchingQuestion";
// Colors for matching question component
const getColors = (isDarkMode) => ({
  background: isDarkMode ? "#1e293b" : "#ffffff",
  text: isDarkMode ? "#ffffff" : "#1e293b",
  textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
  border: isDarkMode ? "#334155" : "#e2e8f0",
});

const QuizComponent = ({
  quiz, // { _id, title, description, duration, passingScore, questions, totalPoints }
  type = "pretest", // "pretest" or "posttest"
  onSubmit, // async function that submits answers
  onComplete, // callback when user closes result
  isLoading = false,
}) => {
  const { isDarkMode } = useTheme();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(
    quiz?.duration ? quiz.duration * 60 : 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResult]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleMatchingAnswer = (questionId, left, right) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [left]: right,
      },
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await onSubmit(answers);
      setResult(response);
      setShowResult(true);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pretest: Only show multiple-choice questions
  // Posttest & Final: Show all question types (multiple-choice, true-false, matching, etc.)
  const questions =
    type === "pretest"
      ? (quiz?.questions || []).filter(
          (q) => q.questionType === "multiple-choice" || !q.questionType
        )
      : quiz?.questions || [];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  // Result View
  if (showResult && result) {
    return (
      <div className="space-y-6">
        {/* Result Header */}
        <div
          className={`rounded-2xl p-8 text-center ${
            result.passed
              ? "bg-gradient-to-br from-green-500 to-emerald-600"
              : "bg-gradient-to-br from-red-500 to-rose-600"
          }`}
        >
          <div className="text-6xl mb-4">{result.passed ? "🎉" : "😔"}</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {result.passed ? "ยินดีด้วย! ผ่านแล้ว" : "ยังไม่ผ่าน"}
          </h2>
          <p className="text-white/80">
            {type === "pretest" ? "แบบทดสอบก่อนเรียน" : "แบบทดสอบหลังเรียน"}
          </p>
        </div>

        {/* Score */}
        <div
          className={`rounded-2xl p-6 ${
            isDarkMode ? "bg-slate-800" : "bg-white"
          }`}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p
                className={`text-3xl font-bold ${
                  result.passed ? "text-green-500" : "text-red-500"
                }`}
              >
                {result.percentage}%
              </p>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                คะแนนที่ได้
              </p>
            </div>
            <div>
              <p
                className={`text-3xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {result.score}/{result.maxScore}
              </p>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                คะแนนเต็ม
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-500">
                {result.passingScore}%
              </p>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                เกณฑ์ผ่าน
              </p>
            </div>
          </div>
        </div>

        {/* Graded Answers - Hidden as per request */}
        {/* 
        {result.gradedAnswers && (
          <div>...</div>
        )}
        */}

        {/* Continue Button */}
        <button
          onClick={() => onComplete?.(result)}
          className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition ${
            result.passed
              ? "bg-green-500 hover:bg-green-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {result.passed ? (
            <>
              <FaArrowRight /> ดำเนินการต่อ
            </>
          ) : (
            <>
              <FaRedo /> ลองใหม่
            </>
          )}
        </button>
      </div>
    );
  }

  // Quiz View
  if (!quiz || questions.length === 0) {
    return (
      <div
        className={`rounded-2xl p-8 text-center ${
          isDarkMode ? "bg-slate-800" : "bg-white"
        }`}
      >
        <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
          ยังไม่มีแบบทดสอบ
        </p>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <>
      {/* Fullscreen Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            {/* Close button */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all"
            >
              <FaTimes size={20} />
            </button>

            {/* Image */}
            <img
              src={previewImage}
              alt="Full Preview"
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Hint text */}
            <p className="text-center text-white/70 text-sm mt-4">
              คลิกที่ใดก็ได้เพื่อปิด
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div
          className={`rounded-2xl p-3 sm:p-4 ${
            isDarkMode ? "bg-slate-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              className={`font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {quiz.title}
            </h3>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                timeLeft < 60
                  ? "bg-red-500/20 text-red-500"
                  : isDarkMode
                  ? "bg-slate-700 text-slate-300"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <FaClock className="text-sm" />
              <span className="font-mono font-bold">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div
              className={`flex-1 h-2 rounded-full ${
                isDarkMode ? "bg-slate-700" : "bg-gray-200"
              }`}
            >
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span
              className={`text-sm ${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}
            >
              {currentQuestion + 1}/{questions.length}
            </span>
          </div>
        </div>

        {/* Question */}
        <div
          className={`rounded-2xl p-6 ${
            isDarkMode ? "bg-slate-800" : "bg-white"
          }`}
        >
          <p
            className={`text-lg font-medium mb-4 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {currentQuestion + 1}. {currentQ.questionText}
          </p>

          {/* Question Image */}
          {currentQ.questionImage && (
            <div className="mb-6 flex justify-center">
              <div
                className="relative group cursor-pointer"
                onClick={() => setPreviewImage(currentQ.questionImage)}
              >
                <img
                  src={currentQ.questionImage}
                  alt="Question"
                  className="max-w-full w-auto h-auto rounded-xl border shadow-sm hover:opacity-90 transition-opacity"
                  style={{ maxHeight: "350px", minHeight: "150px" }}
                />
                {/* Preview icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                  <div className="bg-white/90 p-3 rounded-full shadow-lg">
                    <FaSearchPlus className="text-gray-700 text-xl sm:text-2xl" />
                  </div>
                </div>
                {/* Mobile tap hint */}
                <p
                  className={`text-xs mt-2 text-center sm:hidden ${
                    isDarkMode ? "text-slate-400" : "text-gray-400"
                  }`}
                >
                  แตะเพื่อดูรูปเต็ม
                </p>
              </div>
            </div>
          )}

          {/* Options based on question type */}
          {currentQ.questionType === "multiple-choice" && (
            <div className="space-y-3">
              {currentQ.options?.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(currentQ._id, option)}
                  className={`w-full p-4 rounded-xl text-left transition border ${
                    answers[currentQ._id] === option
                      ? "border-blue-500 bg-blue-500/20"
                      : isDarkMode
                      ? "border-slate-700 bg-slate-700/50 hover:bg-slate-700"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <span
                    className={
                      answers[currentQ._id] === option
                        ? "text-blue-500 font-bold"
                        : isDarkMode
                        ? "text-white"
                        : "text-gray-800"
                    }
                  >
                    {String.fromCharCode(65 + idx)}. {option}
                  </span>
                </button>
              ))}
            </div>
          )}

          {currentQ.questionType === "true-false" && (
            <div className="grid grid-cols-2 gap-4">
              {["ถูก", "ผิด"].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(currentQ._id, option)}
                  className={`p-4 rounded-xl text-center font-bold transition border ${
                    answers[currentQ._id] === option
                      ? "border-blue-500 bg-blue-500/20 text-blue-500"
                      : isDarkMode
                      ? "border-slate-700 bg-slate-700/50 text-white hover:bg-slate-700"
                      : "border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {option === "ถูก" ? (
                    <FaCheckCircle className="inline mr-2" />
                  ) : (
                    <FaTimesCircle className="inline mr-2" />
                  )}
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQ.questionType === "matching" && (
            <MatchingQuestionDnd
              pairs={currentQ.matchingPairs}
              shuffledAnswers={currentQ.answerOptions || []}
              matchingAnswers={answers[currentQ._id] || {}}
              onMatchingAnswer={(leftIndex, rightValue) => {
                // Use index-based answer like admin
                setAnswers((prev) => ({
                  ...prev,
                  [currentQ._id]: {
                    ...(prev[currentQ._id] || {}),
                    [leftIndex]: rightValue,
                  },
                }));
              }}
              isDarkMode={isDarkMode}
              colors={getColors(isDarkMode)}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className={`flex-1 py-3 rounded-xl font-medium transition disabled:opacity-50 ${
              isDarkMode
                ? "bg-slate-700 text-white hover:bg-slate-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ก่อนหน้า
          </button>

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={() =>
                setCurrentQuestion((prev) =>
                  Math.min(questions.length - 1, prev + 1)
                )
              }
              className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
            >
              ถัดไป
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || answeredCount === 0}
              className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <>
                  <FaCheck /> ส่งคำตอบ ({answeredCount}/{questions.length})
                </>
              )}
            </button>
          )}
        </div>

        {/* Question Navigation Dots */}
        <div className="flex flex-wrap justify-center gap-2">
          {questions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestion(idx)}
              className={`w-8 h-8 rounded-full text-xs font-bold transition ${
                idx === currentQuestion
                  ? "bg-blue-500 text-white"
                  : answers[q._id]
                  ? "bg-green-500 text-white"
                  : isDarkMode
                  ? "bg-slate-700 text-slate-400"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default QuizComponent;
