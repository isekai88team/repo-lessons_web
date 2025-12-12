import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { IoIosCloseCircle } from "react-icons/io";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaSpinner,
  FaPlay,
  FaBook,
  FaFileAlt,
  FaCheckCircle,
  FaLock,
  FaUndo,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaClipboardList,
  FaClipboardCheck,
  FaTrophy,
} from "react-icons/fa";
import getBaseUrl from "../../untils/baseURL";
import { useTheme } from "../../context/ThemeContext";
import QuizComponent from "../../components/QuizComponent";

const ChapterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chapterData, setChapterData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [progress, setProgress] = useState(null);

  // Test data
  const [testData, setTestData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1=pretest, 2=learn, 3=posttest, 4=complete

  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    const studentToken = localStorage.getItem("studentToken");
    const loggedIn = !!studentToken;
    setIsLoggedIn(loggedIn);

    const fetchData = async () => {
      try {
        setLoading(true);

        if (loggedIn) {
          // Fetch chapter data
          const response = await fetch(
            `${getBaseUrl()}/api/students/chapter/${id}/full`,
            { headers: { Authorization: `Bearer ${studentToken}` } }
          );
          if (!response.ok) throw new Error("ไม่พบบทเรียน");
          const data = await response.json();
          setChapterData(data);

          // Fetch progress
          const progressRes = await fetch(
            `${getBaseUrl()}/api/students/chapter/${id}/progress`,
            { headers: { Authorization: `Bearer ${studentToken}` } }
          );
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            setProgress(progressData.progress);
            if (progressData.progress?.videoWatched) {
              setVideoCompleted(true);
            }
          }

          // Fetch test data
          const testRes = await fetch(
            `${getBaseUrl()}/api/students/chapter/${id}/tests`,
            { headers: { Authorization: `Bearer ${studentToken}` } }
          );
          if (testRes.ok) {
            const testDataRes = await testRes.json();
            setTestData(testDataRes);

            // Debug logging
            console.log("=== Test Data Debug ===");
            console.log("progress:", testDataRes.progress);
            console.log("pretest:", testDataRes.pretest ? "exists" : "null");
            console.log("posttest:", testDataRes.posttest ? "exists" : "null");
            console.log("videoWatched:", testDataRes.progress?.videoWatched);
            console.log(
              "pretestCompleted:",
              testDataRes.progress?.pretestCompleted
            );

            // Determine current step based on progress
            if (testDataRes.progress.isCompleted) {
              console.log("Setting step 4 (completed)");
              setCurrentStep(4);
            } else if (
              testDataRes.progress.videoWatched &&
              testDataRes.posttest
            ) {
              console.log("Setting step 3 (posttest)");
              setCurrentStep(3);
            } else if (
              testDataRes.progress.pretestCompleted ||
              !testDataRes.pretest
            ) {
              console.log("Setting step 2 (learning)");
              setCurrentStep(2);
            } else {
              console.log("Setting step 1 (pretest)");
              setCurrentStep(1);
            }
          }
        } else {
          const response = await fetch(
            `${getBaseUrl()}/api/public/chapter/${id}`
          );
          if (!response.ok) throw new Error("ไม่พบบทเรียน");
          const data = await response.json();
          setChapterData(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleEnded = async () => {
    if (!isLoggedIn) return;
    setIsPlaying(false);
    setVideoCompleted(true);

    try {
      const token = localStorage.getItem("studentToken");
      await fetch(`${getBaseUrl()}/api/students/chapter/${id}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("🎉 ดูวิดีโอจบแล้ว!", { duration: 3000 });

      // Check if there's a posttest, then move to step 3
      if (testData?.posttest) {
        setCurrentStep(3);
      } else {
        setCurrentStep(4);
      }
    } catch (error) {
      console.error("Error marking complete:", error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  const rewind10 = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        videoRef.current.currentTime - 10
      );
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) document.exitFullscreen();
      else videoRef.current.requestFullscreen();
    }
  };

  // Submit pretest
  const handleSubmitPretest = async (answers) => {
    const token = localStorage.getItem("studentToken");
    const response = await fetch(
      `${getBaseUrl()}/api/students/pretest/${testData.pretest._id}/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      }
    );
    if (!response.ok) throw new Error("ส่งคำตอบไม่สำเร็จ");
    return await response.json();
  };

  // Submit posttest
  const handleSubmitPosttest = async (answers) => {
    const token = localStorage.getItem("studentToken");
    const questionIds = testData.posttest.questions.map((q) => q._id);
    const response = await fetch(
      `${getBaseUrl()}/api/students/posttest/${testData.posttest._id}/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers, questionIds }),
      }
    );
    if (!response.ok) throw new Error("ส่งคำตอบไม่สำเร็จ");
    return await response.json();
  };

  const handlePretestComplete = (result) => {
    // Move to step 2 (learning) after pretest
    setCurrentStep(2);
    toast.success("เริ่มเรียนได้เลย! 📚");
  };

  const handlePosttestComplete = (result) => {
    if (result.passed) {
      setCurrentStep(4);
      toast.success("🎉 จบบทเรียนแล้ว!");
    } else {
      // Can retry posttest
      toast.error("ลองทำใหม่อีกครั้ง");
    }
  };

  // Loading
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-slate-900" : "bg-blue-50"
        }`}
      >
        <FaSpinner
          className={`animate-spin text-4xl ${
            isDarkMode ? "text-blue-400" : "text-blue-600"
          }`}
        />
      </div>
    );
  }

  // Error
  if (error || !chapterData) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-slate-900" : "bg-blue-50"
        }`}
      >
        <div className="text-center">
          <p
            className={`text-xl mb-4 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            ไม่สามารถโหลดข้อมูลได้
          </p>
          <Link
            to="/"
            className={`px-6 py-3 rounded-xl transition ${
              isDarkMode
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  const { chapter, subject } = chapterData;
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Step indicator
  const steps = [
    { id: 1, label: "ทำ Pretest", icon: FaClipboardList, color: "blue" },
    { id: 2, label: "เรียนรู้", icon: FaPlay, color: "purple" },
    { id: 3, label: "ทำ Posttest", icon: FaClipboardCheck, color: "green" },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900" : "bg-gradient-to-br from-blue-50 to-white"
      }`}
    >
      {/* Header */}
      <header
        className={`py-4 px-6 shadow-lg ${
          isDarkMode
            ? "bg-slate-800"
            : "bg-gradient-to-r from-blue-600 to-blue-700"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className={`p-2 rounded-lg transition ${
                isDarkMode
                  ? "hover:bg-slate-700 text-white"
                  : "hover:bg-white/10 text-white"
              }`}
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="font-bold text-lg text-white">
                {chapter.chapter_name}
              </h1>
              <p className="text-white/70 text-sm">
                {subject?.subject_name} ({subject?.code})
              </p>
            </div>
          </div>
          {currentStep === 4 && (
            <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full">
              <FaTrophy />
              <span className="font-bold">จบบทเรียนแล้ว</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Step Indicator (for logged in users with tests) */}
        {isLoggedIn && testData?.pretest && (
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                        currentStep > step.id
                          ? "bg-green-500 text-white"
                          : currentStep === step.id
                          ? `bg-${step.color}-500 text-white`
                          : isDarkMode
                          ? "bg-slate-700 text-slate-400"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <FaCheckCircle />
                      ) : (
                        <step.icon />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 ${
                        currentStep >= step.id
                          ? isDarkMode
                            ? "text-white"
                            : "text-gray-800"
                          : isDarkMode
                          ? "text-slate-500"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded ${
                        currentStep > step.id
                          ? "bg-green-500"
                          : isDarkMode
                          ? "bg-slate-700"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Content based on current step */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Pretest */}
          {currentStep === 1 && testData?.pretest && isLoggedIn && (
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
                  <FaClipboardList className="text-blue-500" />
                  แบบทดสอบก่อนเรียน (Pretest)
                </h2>
                <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                  ทำแบบทดสอบก่อนเริ่มเรียน เพื่อประเมินความรู้เบื้องต้น
                </p>
              </div>
              <div className="p-6">
                <QuizComponent
                  quiz={testData.pretest}
                  type="pretest"
                  onSubmit={handleSubmitPretest}
                  onComplete={handlePretestComplete}
                />
              </div>
            </div>
          )}

          {/* Step 2: Learning (Video) */}
          {(currentStep === 2 || !testData?.pretest || !isLoggedIn) &&
            currentStep !== 1 &&
            currentStep !== 3 &&
            currentStep !== 4 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Video Section */}
                <div className="lg:col-span-2">
                  <div
                    className={`rounded-2xl shadow-xl overflow-hidden ${
                      isDarkMode ? "bg-slate-800" : "bg-white"
                    }`}
                  >
                    {chapter.video_url ? (
                      <div className="bg-black relative">
                        {isLoggedIn ? (
                          <>
                            {videoCompleted || progress?.videoWatched ? (
                              <video
                                ref={videoRef}
                                className="w-full aspect-video"
                                controls
                                controlsList="nodownload"
                              >
                                <source
                                  src={chapter.video_url}
                                  type="video/mp4"
                                />
                              </video>
                            ) : (
                              <>
                                <div className="relative">
                                  <video
                                    ref={videoRef}
                                    className="w-full aspect-video"
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={(e) =>
                                      setDuration(e.target.duration)
                                    }
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onEnded={handleEnded}
                                  >
                                    <source
                                      src={chapter.video_url}
                                      type="video/mp4"
                                    />
                                  </video>

                                  {!isPlaying && (
                                    <div
                                      className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30"
                                      onClick={togglePlay}
                                    >
                                      <div className="w-20 h-20 bg-blue-600/90 rounded-full flex items-center justify-center hover:bg-blue-500 transition shadow-xl">
                                        <FaPlay className="text-white text-2xl ml-1" />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Custom Controls */}
                                <div
                                  className={`p-4 ${
                                    isDarkMode ? "bg-slate-900" : "bg-gray-900"
                                  }`}
                                >
                                  <div className="h-1 bg-gray-700 rounded-full mb-4">
                                    <div
                                      className="h-full bg-blue-500 rounded-full transition-all"
                                      style={{
                                        width: `${progressPercentage}%`,
                                      }}
                                    />
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={togglePlay}
                                        className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition"
                                      >
                                        {isPlaying ? (
                                          <FaPause />
                                        ) : (
                                          <FaPlay className="ml-0.5" />
                                        )}
                                      </button>
                                      <button
                                        onClick={rewind10}
                                        className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition"
                                      >
                                        <FaUndo className="text-sm" />
                                      </button>
                                      <span className="text-white text-sm font-mono">
                                        {formatTime(currentTime)} /{" "}
                                        {formatTime(duration)}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-orange-400 text-xs bg-orange-500/20 px-2 py-1 rounded">
                                        ⚠️ ไม่สามารถข้ามได้
                                      </span>
                                      <button
                                        onClick={toggleMute}
                                        className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition"
                                      >
                                        {isMuted ? (
                                          <FaVolumeMute />
                                        ) : (
                                          <FaVolumeUp />
                                        )}
                                      </button>
                                      <button
                                        onClick={toggleFullscreen}
                                        className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition"
                                      >
                                        <FaExpand />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <div
                            className={`w-full aspect-video flex flex-col items-center justify-center ${
                              isDarkMode
                                ? "bg-slate-800"
                                : "bg-gradient-to-br from-gray-800 to-gray-900"
                            }`}
                          >
                            <FaLock className="text-6xl text-white/50 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">
                              วิดีโอนี้ต้องเข้าสู่ระบบ
                            </h3>
                            <button
                              onClick={() => {
                                localStorage.setItem(
                                  "returnUrl",
                                  `/chapter/${id}`
                                );
                                navigate("/login");
                              }}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all"
                            >
                              <FaLock /> เข้าสู่ระบบเพื่อดูวิดีโอ
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className={`aspect-video flex items-center justify-center ${
                          isDarkMode ? "bg-slate-700" : "bg-gray-200"
                        }`}
                      >
                        <p
                          className={
                            isDarkMode ? "text-slate-400" : "text-gray-500"
                          }
                        >
                          ยังไม่มีวิดีโอ
                        </p>
                      </div>
                    )}

                    {/* Chapter Info */}
                    <div className="p-6">
                      <h2
                        className={`text-2xl font-bold mb-4 ${
                          isDarkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {chapter.chapter_name}
                      </h2>
                      <p
                        className={`leading-relaxed ${
                          isDarkMode ? "text-slate-300" : "text-gray-600"
                        }`}
                      >
                        {chapter.description || "ไม่มีคำอธิบาย"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Progress Card */}
                  <div
                    className={`rounded-2xl shadow-xl p-6 ${
                      isDarkMode ? "bg-slate-800" : "bg-white"
                    }`}
                  >
                    <h3
                      className={`font-bold mb-4 flex items-center gap-2 ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      <FaCheckCircle className="text-blue-500" /> สถานะการเรียน
                    </h3>
                    <div className="space-y-4">
                      {/* Pretest Status */}
                      {testData?.pretest && (
                        <div
                          className={`flex items-center justify-between p-3 rounded-xl ${
                            isDarkMode ? "bg-slate-700" : "bg-gray-50"
                          }`}
                        >
                          <span
                            className={
                              isDarkMode ? "text-slate-300" : "text-gray-600"
                            }
                          >
                            Pretest
                          </span>
                          {testData.progress?.pretestCompleted ? (
                            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                              <FaCheckCircle /> ทำแล้ว
                            </span>
                          ) : (
                            <span className="text-orange-500 text-sm">
                              ⏳ รอทำ
                            </span>
                          )}
                        </div>
                      )}
                      {/* Video Status */}
                      <div
                        className={`flex items-center justify-between p-3 rounded-xl ${
                          isDarkMode ? "bg-slate-700" : "bg-gray-50"
                        }`}
                      >
                        <span
                          className={
                            isDarkMode ? "text-slate-300" : "text-gray-600"
                          }
                        >
                          วิดีโอ
                        </span>
                        {videoCompleted || progress?.videoWatched ? (
                          <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                            <FaCheckCircle /> ดูจบแล้ว
                          </span>
                        ) : (
                          <span className="text-orange-500 text-sm">
                            ⏳ กำลังดู
                          </span>
                        )}
                      </div>
                      {/* Posttest Status */}
                      {testData?.posttest && (
                        <div
                          className={`flex items-center justify-between p-3 rounded-xl ${
                            isDarkMode ? "bg-slate-700" : "bg-gray-50"
                          }`}
                        >
                          <span
                            className={
                              isDarkMode ? "text-slate-300" : "text-gray-600"
                            }
                          >
                            Posttest
                          </span>
                          {testData.progress?.posttestPassed ? (
                            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                              <FaCheckCircle /> ผ่านแล้ว
                            </span>
                          ) : testData.progress?.posttestCompleted ? (
                            <span className="text-red-500 text-sm">
                              ❌ ไม่ผ่าน
                            </span>
                          ) : (
                            <span className="text-orange-500 text-sm">
                              ⏳ รอทำ
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document */}
                  {chapter.document_url && (
                    <div
                      className={`rounded-2xl shadow-xl p-6 ${
                        isDarkMode ? "bg-slate-800" : "bg-white"
                      }`}
                    >
                      <h3
                        className={`font-bold mb-4 flex items-center gap-2 ${
                          isDarkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        <FaFileAlt className="text-blue-500" /> เอกสารประกอบ
                      </h3>
                      <a
                        href={chapter.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-blue-600 text-white text-center py-3 rounded-xl hover:bg-blue-500 transition"
                      >
                        ดาวน์โหลดเอกสาร
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Step 3: Posttest */}
          {currentStep === 3 && testData?.posttest && isLoggedIn && (
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
                  <FaClipboardCheck className="text-green-500" />
                  แบบทดสอบหลังเรียน (Posttest)
                </h2>
                <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                  ทำแบบทดสอบเพื่อประเมินความเข้าใจ ผ่าน{" "}
                  {testData.posttest.passingScore}% ถือว่าจบบทเรียน
                </p>
              </div>
              <div className="p-6">
                <QuizComponent
                  quiz={testData.posttest}
                  type="posttest"
                  onSubmit={handleSubmitPosttest}
                  onComplete={handlePosttestComplete}
                />
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <div
              className={`rounded-2xl shadow-xl overflow-hidden ${
                isDarkMode ? "bg-slate-800" : "bg-white"
              }`}
            >
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2
                  className={`text-2xl font-bold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  ยินดีด้วย! คุณเรียนจบบทนี้แล้ว
                </h2>
                <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                  {chapter.chapter_name}
                </p>

                {/* Results Summary */}
                {testData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                    {testData.pretestResult && (
                      <div
                        className={`p-4 rounded-xl ${
                          isDarkMode ? "bg-slate-700" : "bg-blue-50"
                        }`}
                      >
                        <FaClipboardList className="text-2xl text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-500">
                          {testData.pretestResult.percentage}%
                        </p>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-slate-400" : "text-gray-500"
                          }`}
                        >
                          Pretest
                        </p>
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-xl ${
                        isDarkMode ? "bg-slate-700" : "bg-purple-50"
                      }`}
                    >
                      <FaPlay className="text-2xl text-purple-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-500">✓</p>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-slate-400" : "text-gray-500"
                        }`}
                      >
                        ดูวิดีโอจบ
                      </p>
                    </div>
                    {testData.posttestResult && (
                      <div
                        className={`p-4 rounded-xl ${
                          isDarkMode ? "bg-slate-700" : "bg-green-50"
                        }`}
                      >
                        <FaClipboardCheck className="text-2xl text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-500">
                          {testData.posttestResult.percentage}%
                        </p>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-slate-400" : "text-gray-500"
                          }`}
                        >
                          Posttest
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => navigate("/")}
                  className="mt-8 px-8 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition"
                >
                  กลับหน้าหลัก
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChapterDetail;
