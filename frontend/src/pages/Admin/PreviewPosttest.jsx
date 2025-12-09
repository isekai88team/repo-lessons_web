import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFetchPosttestByIdQuery } from "../../redux/features/admin/adminApi";
import {
  FaSpinner,
  FaArrowLeft,
  FaClock,
  FaCheck,
  FaTimes,
  FaQuestionCircle,
  FaExclamationTriangle,
  FaTrophy,
  FaRedoAlt,
  FaRandom,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const PreviewPosttest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();

  const { data, isLoading, refetch } = useFetchPosttestByIdQuery(id);
  const posttest = data?.posttest;

  // Test state
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [matchingAnswers, setMatchingAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState(null);
  const [shuffledMatchingOptions, setShuffledMatchingOptions] = useState({});

  // Initialize test (refetch to get new random questions)
  const startTest = useCallback(async () => {
    if (!posttest) return;

    // Refetch to get new shuffled questions
    await refetch();

    const questions = posttest.questions || [];

    // Pre-shuffle matching options for each matching question
    const matchingOpts = {};
    questions.forEach((q, idx) => {
      if (q.questionType === "matching" && q.matchingPairs?.length) {
        matchingOpts[idx] = [...q.matchingPairs.map((p) => p.right)].sort(
          () => Math.random() - 0.5
        );
      }
    });
    setShuffledMatchingOptions(matchingOpts);
    setTimeLeft(posttest.duration * 60);
    setAnswers({});
    setMatchingAnswers({});
    setCurrentQuestion(0);
    setTestFinished(false);
    setResults(null);
    setTestStarted(true);
  }, [posttest, refetch]);

  // Timer
  useEffect(() => {
    if (!testStarted || testFinished || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testFinished, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswer = (questionIndex, answer) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleMatchingAnswer = (questionIndex, leftIndex, rightValue) => {
    setMatchingAnswers((prev) => ({
      ...prev,
      [questionIndex]: {
        ...(prev[questionIndex] || {}),
        [leftIndex]: rightValue,
      },
    }));
  };

  const submitTest = () => {
    if (!posttest) return;

    let score = 0;
    let totalPoints = 0;
    const questionResults = [];
    const questions = posttest.questions || [];

    questions.forEach((q, index) => {
      const points = q.points || 1;
      totalPoints += points;

      if (q.questionType === "matching") {
        const userMatching = matchingAnswers[index] || {};
        let correctPairs = 0;
        q.matchingPairs?.forEach((pair, pairIdx) => {
          if (userMatching[pairIdx] === pair.right) {
            correctPairs++;
          }
        });
        const allCorrect = correctPairs === (q.matchingPairs?.length || 0);
        if (allCorrect) {
          score += points;
        }
        questionResults.push({
          question: q.questionText,
          type: q.questionType,
          userAnswer: userMatching,
          correctAnswer: q.matchingPairs,
          isCorrect: allCorrect,
          points: allCorrect ? points : 0,
          maxPoints: points,
        });
      } else {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === q.correctAnswer;
        if (isCorrect) {
          score += points;
        }
        questionResults.push({
          question: q.questionText,
          type: q.questionType,
          userAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect,
          points: isCorrect ? points : 0,
          maxPoints: points,
        });
      }
    });

    const percentage =
      totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const passed = percentage >= (posttest.passingScore || 60);

    setResults({
      score,
      totalPoints,
      percentage,
      passed,
      questionResults,
    });
    setTestFinished(true);
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
        <FaQuestionCircle className="text-5xl mb-4 opacity-20" />
        <p>ไม่พบข้อสอบ</p>
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

  // Start screen
  if (!testStarted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: isDarkMode ? colors.background : "#F3F4F6" }}
      >
        <div
          className="max-w-lg w-full rounded-2xl p-8 text-center shadow-xl"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}30`,
          }}
        >
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: "#22C55E20" }}
          >
            <FaQuestionCircle
              className="text-4xl"
              style={{ color: "#22C55E" }}
            />
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: colors.text }}
          >
            {posttest.title}
          </h1>
          {posttest.description && (
            <p className="mb-6" style={{ color: colors.textSecondary }}>
              {posttest.description}
            </p>
          )}

          <div
            className="px-4 py-3 rounded-xl mb-4 flex items-center justify-center gap-2"
            style={{ backgroundColor: "#8B5CF620", color: "#8B5CF6" }}
          >
            <FaRandom />
            <span className="text-sm font-medium">
              คำถามจะถูกสุ่มใหม่ทุกครั้งที่ทำข้อสอบ
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
              }}
            >
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: colors.textSecondary }}
              >
                <FaQuestionCircle className="text-green-500" />
                จำนวนข้อ
              </div>
              <p
                className="text-xl font-bold mt-1"
                style={{ color: colors.text }}
              >
                {posttest.questionCount || posttest.questions?.length || 0} ข้อ
              </p>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
              }}
            >
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: colors.textSecondary }}
              >
                <FaClock className="text-blue-500" />
                เวลา
              </div>
              <p
                className="text-xl font-bold mt-1"
                style={{ color: colors.text }}
              >
                {posttest.duration} นาที
              </p>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
              }}
            >
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: colors.textSecondary }}
              >
                <FaTrophy className="text-yellow-500" />
                คะแนนผ่าน
              </div>
              <p
                className="text-xl font-bold mt-1"
                style={{ color: colors.text }}
              >
                {posttest.passingScore}%
              </p>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
              }}
            >
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: colors.textSecondary }}
              >
                <FaQuestionCircle className="text-green-500" />
                คะแนนเต็ม
              </div>
              <p
                className="text-xl font-bold mt-1"
                style={{ color: colors.text }}
              >
                {posttest.totalPoints || 0} คะแนน
              </p>
            </div>
          </div>

          <div
            className="p-4 rounded-xl mb-6"
            style={{
              backgroundColor: "#FEF3C7",
              border: "1px solid #F59E0B40",
            }}
          >
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800 text-left">
                <strong>โหมดทดสอบ Admin:</strong> ผลลัพธ์จะไม่ถูกบันทึก
                คุณสามารถทดสอบข้อสอบได้หลายครั้ง
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 px-6 rounded-xl font-medium"
              style={{
                border: `1px solid ${colors.border}`,
                color: colors.textSecondary,
              }}
            >
              <FaArrowLeft className="inline mr-2" /> กลับ
            </button>
            <button
              onClick={startTest}
              className="flex-1 py-3 px-6 rounded-xl font-bold"
              style={{ backgroundColor: "#22C55E", color: "#FFF" }}
            >
              เริ่มทำข้อสอบ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (testFinished && results) {
    return (
      <div
        className="min-h-screen p-6"
        style={{ backgroundColor: isDarkMode ? colors.background : "#F3F4F6" }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl p-8 mb-6 text-center shadow-xl"
            style={{
              backgroundColor: results.passed
                ? isDarkMode
                  ? "#22c55e20"
                  : "#dcfce7"
                : isDarkMode
                ? "#ef444420"
                : "#fee2e2",
              border: `1px solid ${results.passed ? "#22c55e" : "#ef4444"}40`,
            }}
          >
            <div
              className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{
                backgroundColor: results.passed ? "#22c55e" : "#ef4444",
              }}
            >
              {results.passed ? (
                <FaTrophy className="text-4xl text-white" />
              ) : (
                <FaTimes className="text-4xl text-white" />
              )}
            </div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: results.passed ? "#22c55e" : "#ef4444" }}
            >
              {results.passed ? "ผ่านแล้ว! 🎉" : "ไม่ผ่าน 😢"}
            </h1>
            <p
              className="text-5xl font-bold my-4"
              style={{ color: colors.text }}
            >
              {results.percentage}%
            </p>
            <p style={{ color: colors.textSecondary }}>
              {results.score} / {results.totalPoints} คะแนน
            </p>
          </div>

          {posttest.showCorrectAnswers && (
            <div
              className="rounded-2xl p-6 mb-6"
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}30`,
              }}
            >
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: colors.text }}
              >
                เฉลยคำตอบ
              </h2>
              <div className="space-y-4">
                {results.questionResults.map((qr, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: isDarkMode
                        ? colors.background
                        : "#F8F9FA",
                      border: `1px solid ${
                        qr.isCorrect ? "#22c55e" : "#ef4444"
                      }40`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          qr.isCorrect ? "bg-green-500" : "bg-red-500"
                        } text-white`}
                      >
                        {qr.isCorrect ? <FaCheck /> : <FaTimes />}
                      </div>
                      <div className="flex-1">
                        <p
                          className="font-medium mb-2"
                          style={{ color: colors.text }}
                        >
                          ข้อ {index + 1}: {qr.question}
                        </p>
                        {qr.type === "matching" ? (
                          <div className="text-sm space-y-1">
                            <p style={{ color: colors.textSecondary }}>
                              คำตอบของคุณ:
                            </p>
                            {qr.correctAnswer?.map((pair, pairIdx) => (
                              <p
                                key={pairIdx}
                                style={{
                                  color:
                                    qr.userAnswer?.[pairIdx] === pair.right
                                      ? "#22c55e"
                                      : "#ef4444",
                                }}
                              >
                                {pair.left} →{" "}
                                {qr.userAnswer?.[pairIdx] || "(ไม่ได้เลือก)"}
                                {qr.userAnswer?.[pairIdx] !== pair.right && (
                                  <span className="text-green-600 ml-2">
                                    (เฉลย: {pair.right})
                                  </span>
                                )}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <>
                            <p
                              className="text-sm"
                              style={{
                                color: qr.isCorrect ? "#22c55e" : "#ef4444",
                              }}
                            >
                              คำตอบของคุณ: {qr.userAnswer || "(ไม่ได้ตอบ)"}
                            </p>
                            {!qr.isCorrect && (
                              <p className="text-sm text-green-600">
                                เฉลย: {qr.correctAnswer}
                              </p>
                            )}
                          </>
                        )}
                        <p
                          className="text-xs mt-1"
                          style={{ color: colors.textSecondary }}
                        >
                          {qr.points} / {qr.maxPoints} คะแนน
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 px-6 rounded-xl font-medium"
              style={{
                border: `1px solid ${colors.border}`,
                color: colors.textSecondary,
              }}
            >
              <FaArrowLeft className="inline mr-2" /> กลับ
            </button>
            <button
              onClick={startTest}
              className="flex-1 py-3 px-6 rounded-xl font-bold"
              style={{ backgroundColor: "#22C55E", color: "#FFF" }}
            >
              <FaRedoAlt className="inline mr-2" /> ทำใหม่ (สุ่มคำถามใหม่)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Test in progress
  const questions = posttest.questions || [];
  const question = questions[currentQuestion];
  const totalQuestions = questions.length;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: isDarkMode ? colors.background : "#F3F4F6" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 p-4 shadow-md"
        style={{
          backgroundColor: colors.cardBg,
          borderBottom: `1px solid ${colors.border}30`,
        }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg"
            style={{ color: colors.textSecondary }}
          >
            <FaArrowLeft />
          </button>
          <div className="text-center">
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              ข้อ {currentQuestion + 1} / {totalQuestions}
            </p>
            <div
              className="w-48 h-2 rounded-full mt-1"
              style={{ backgroundColor: colors.border }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
                  backgroundColor: "#22C55E",
                }}
              />
            </div>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold ${
              timeLeft < 60 ? "animate-pulse" : ""
            }`}
            style={{
              backgroundColor: timeLeft < 60 ? "#ef444420" : "#22C55E20",
              color: timeLeft < 60 ? "#ef4444" : "#22C55E",
            }}
          >
            <FaClock />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-3xl mx-auto p-6">
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}30`,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
              style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}
            >
              {currentQuestion + 1}
            </div>
            <span
              className="text-xs px-2 py-1 rounded"
              style={{
                backgroundColor: `${colors.border}40`,
                color: colors.textSecondary,
              }}
            >
              {question?.questionType === "multiple-choice"
                ? "ปรนัย"
                : question?.questionType === "true-false"
                ? "ถูก/ผิด"
                : question?.questionType === "matching"
                ? "จับคู่"
                : "ตอบสั้น"}{" "}
              • {question?.points} คะแนน
            </span>
          </div>
          <p
            className="text-lg font-medium mb-6"
            style={{ color: colors.text }}
          >
            {question?.questionText}
          </p>

          {/* Multiple Choice */}
          {question?.questionType === "multiple-choice" && (
            <div className="space-y-3">
              {question.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(currentQuestion, opt)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor:
                      answers[currentQuestion] === opt
                        ? "#22C55E20"
                        : isDarkMode
                        ? colors.background
                        : "#F8F9FA",
                    border: `2px solid ${
                      answers[currentQuestion] === opt
                        ? "#22C55E"
                        : "transparent"
                    }`,
                    color: colors.text,
                  }}
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{
                      backgroundColor:
                        answers[currentQuestion] === opt
                          ? "#22C55E"
                          : `${colors.border}60`,
                      color:
                        answers[currentQuestion] === opt ? "#FFF" : colors.text,
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* True/False */}
          {question?.questionType === "true-false" && (
            <div className="grid grid-cols-2 gap-4">
              {["true", "false"].map((val) => (
                <button
                  key={val}
                  onClick={() => handleAnswer(currentQuestion, val)}
                  className="p-6 rounded-xl text-center font-bold text-lg transition-all"
                  style={{
                    backgroundColor:
                      answers[currentQuestion] === val
                        ? val === "true"
                          ? "#22c55e20"
                          : "#ef444420"
                        : isDarkMode
                        ? colors.background
                        : "#F8F9FA",
                    border: `2px solid ${
                      answers[currentQuestion] === val
                        ? val === "true"
                          ? "#22c55e"
                          : "#ef4444"
                        : "transparent"
                    }`,
                    color:
                      answers[currentQuestion] === val
                        ? val === "true"
                          ? "#22c55e"
                          : "#ef4444"
                        : colors.text,
                  }}
                >
                  {val === "true" ? "✓ ถูก" : "✗ ผิด"}
                </button>
              ))}
            </div>
          )}

          {/* Short Answer */}
          {question?.questionType === "short-answer" && (
            <input
              type="text"
              value={answers[currentQuestion] || ""}
              onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
              className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              style={inputStyle}
              placeholder="พิมพ์คำตอบของคุณ..."
            />
          )}

          {/* Matching */}
          {question?.questionType === "matching" && (
            <div className="space-y-3">
              {question.matchingPairs?.map((pair, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{
                    backgroundColor: isDarkMode ? colors.background : "#F8F9FA",
                    border: `1px solid ${colors.border}40`,
                  }}
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ backgroundColor: "#F59E0B", color: "#FFF" }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1" style={{ color: colors.text }}>
                    {pair.left}
                  </span>
                  <span style={{ color: colors.textSecondary }}>→</span>
                  <select
                    value={matchingAnswers[currentQuestion]?.[i] || ""}
                    onChange={(e) =>
                      handleMatchingAnswer(currentQuestion, i, e.target.value)
                    }
                    className="px-3 py-2 rounded-lg"
                    style={inputStyle}
                  >
                    <option value="">เลือก...</option>
                    {shuffledMatchingOptions[currentQuestion]?.map((opt, j) => (
                      <option key={j} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentQuestion > 0 && (
            <button
              onClick={() => setCurrentQuestion((prev) => prev - 1)}
              className="flex-1 py-3 rounded-xl font-medium"
              style={{
                border: `1px solid ${colors.border}`,
                color: colors.textSecondary,
              }}
            >
              ← ก่อนหน้า
            </button>
          )}
          {currentQuestion < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentQuestion((prev) => prev + 1)}
              className="flex-1 py-3 rounded-xl font-bold"
              style={{ backgroundColor: "#22C55E", color: "#FFF" }}
            >
              ถัดไป →
            </button>
          ) : (
            <button
              onClick={submitTest}
              className="flex-1 py-3 rounded-xl font-bold"
              style={{ backgroundColor: "#8B5CF6", color: "#FFF" }}
            >
              ส่งคำตอบ ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPosttest;
