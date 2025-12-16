import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaTrophy, FaLock, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import getBaseUrl from "../../untils/baseURL";
import { useTheme } from "../../context/ThemeContext";
import QuizComponent from "../../components/QuizComponent";

const StudentFinalExam = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchExamData();
  }, [subjectId]);

  const fetchExamData = async () => {
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(
        `${getBaseUrl()}/api/students/final-exam/${subjectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Failed to fetch exam data");
      const data = await res.json();
      setExamData(data);

      if (data.previousResult) {
        setResult(data.previousResult);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (answers) => {
    const token = localStorage.getItem("studentToken");
    const res = await fetch(
      `${getBaseUrl()}/api/students/final-exam/${
        examData.finalExam._id
      }/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      }
    );

    if (!res.ok) throw new Error("Failed to submit");
    return await res.json();
  };

  const handleComplete = async (resultData) => {
    setResult(resultData);
    setShowQuiz(false);
    // Refresh exam data to get updated attempt count
    await fetchExamData();
    if (resultData.passed) {
      toast.success("🎉 ยินดีด้วย! ผ่านแล้ว!");
    } else {
      toast.success("ส่งคำตอบสำเร็จ");
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-slate-900" : "bg-blue-50"
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-slate-900" : "bg-blue-50"}`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-40 ${
          isDarkMode ? "bg-slate-800/90" : "bg-white/90"
        } backdrop-blur-md shadow-md`}
      >
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className={`p-2 rounded-lg hover:bg-opacity-80 transition ${
              isDarkMode
                ? "bg-slate-700 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <FaArrowLeft />
          </button>
          <h1
            className={`text-xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            ข้อสอบสุดท้าย (Final Exam)
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Not eligible */}
        {!examData?.canTakeFinalExam && (
          <div
            className={`rounded-2xl shadow-xl p-8 text-center ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            <FaLock className="text-6xl text-orange-500 mx-auto mb-4" />
            <h2
              className={`text-2xl font-bold mb-2 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              ยังไม่สามารถสอบได้
            </h2>
            <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
              ต้องเรียนจบทุกบทก่อน ({examData?.completedChapters}/
              {examData?.totalChapters} บท)
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition"
            >
              กลับไปเรียน
            </button>
          </div>
        )}

        {/* No exam available */}
        {examData?.canTakeFinalExam && !examData?.finalExam && (
          <div
            className={`rounded-2xl shadow-xl p-8 text-center ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            <FaTrophy className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2
              className={`text-2xl font-bold mb-2 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              ยังไม่มีข้อสอบสุดท้าย
            </h2>
            <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
              ครูยังไม่ได้สร้างข้อสอบสุดท้ายสำหรับวิชานี้
            </p>
          </div>
        )}

        {/* Show quiz */}
        {showQuiz && examData?.finalExam && (
          <div
            className={`rounded-2xl shadow-xl overflow-hidden ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            <div
              className={`p-6 border-b ${
                isDarkMode ? "border-slate-700" : "border-gray-100"
              }`}
            >
              <h2
                className={`text-xl font-bold flex items-center gap-2 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                <FaTrophy className="text-yellow-500" />
                {examData.finalExam.title}
              </h2>
            </div>
            <div className="p-6">
              <QuizComponent
                quiz={examData.finalExam}
                type="final"
                onSubmit={handleSubmit}
                onComplete={handleComplete}
              />
            </div>
          </div>
        )}

        {/* Ready to take or show result */}
        {examData?.canTakeFinalExam && examData?.finalExam && !showQuiz && (
          <div
            className={`rounded-2xl shadow-xl p-8 ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            {result ? (
              <div className="text-center">
                <div
                  className={`text-6xl mb-4 ${
                    result.passed ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {result.passed ? "🎉" : "😢"}
                </div>
                <h2
                  className={`text-2xl font-bold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {result.passed ? "ยินดีด้วย! คุณผ่านแล้ว!" : "ยังไม่ผ่าน"}
                </h2>
                <p
                  className={`text-4xl font-bold mb-2 ${
                    result.passed ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {result.percentage}%
                </p>

                {/* Show attempt count */}
                {!result.passed && (
                  <p
                    className={`text-sm mb-4 ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    ครั้งที่ {examData.attemptCount}/{examData.maxAttempts}
                    {!examData.canRetake && " - หมดสิทธิ์ในการสอบใหม่"}
                  </p>
                )}

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => navigate("/")}
                    className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition"
                  >
                    กลับหน้าหลัก
                  </button>
                  {!result.passed && examData.canRetake && (
                    <button
                      onClick={() => {
                        setShowQuiz(true);
                        setResult(null);
                      }}
                      className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition"
                    >
                      ลองใหม่ ({examData.maxAttempts - examData.attemptCount}{" "}
                      ครั้ง)
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <FaTrophy className="text-6xl text-yellow-500 mx-auto mb-4" />
                <h2
                  className={`text-2xl font-bold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {examData.finalExam.title}
                </h2>
                <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                  {examData.finalExam.description}
                </p>

                <div
                  className={`grid grid-cols-3 gap-4 mt-6 mb-8 ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  <div>
                    <p className="text-3xl font-bold text-blue-500">
                      {examData.finalExam.questions?.length || 0}
                    </p>
                    <p className="text-sm">ข้อ</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-purple-500">
                      {examData.finalExam.duration}
                    </p>
                    <p className="text-sm">นาที</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-500">
                      {examData.finalExam.passingScore}%
                    </p>
                    <p className="text-sm">เกณฑ์ผ่าน</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mb-6">
                  <FaCheckCircle className="text-green-500" />
                  <span
                    className={isDarkMode ? "text-slate-400" : "text-gray-500"}
                  >
                    คุณเรียนจบครบ {examData.completedChapters}/
                    {examData.totalChapters} บทแล้ว
                  </span>
                </div>

                <button
                  onClick={() => setShowQuiz(true)}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition shadow-lg"
                >
                  เริ่มทำข้อสอบ
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentFinalExam;
