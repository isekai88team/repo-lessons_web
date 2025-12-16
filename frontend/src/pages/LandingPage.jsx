import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaChevronDown,
  FaChevronUp,
  FaBook,
  FaPlay,
  FaLaptop,
  FaSpinner,
  FaBullhorn,
  FaEdit,
  FaCalendarAlt,
  FaLock,
} from "react-icons/fa";
import toast from "react-hot-toast";
import getBaseUrl from "../untils/baseURL";
import ChapterCard from "../components/ChapterCard";
import RevealOnScroll from "../components/RevealOnScroll";
import WorksheetCarousel from "../components/WorksheetCarousel";
import { useTheme } from "../context/ThemeContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const [isObjectiveOpen, setIsObjectiveOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [worksheets, setWorksheets] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chaptersProgress, setChaptersProgress] = useState([]);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    setIsLoggedIn(!!token);
  }, []);

  // Hardcoded teacher info
  const teacherInfo = {
    name: "นายภานุพงศ์ ประจวบแท่น",
    role: "ครูผู้สอนประจำรายวิชา",
    image: null, // หากมีรูปให้ใส่ URL ที่นี่
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch landing data
        const landingRes = await fetch(`${getBaseUrl()}/api/public/landing`);
        if (!landingRes.ok) throw new Error("Failed to fetch landing data");
        const landingData = await landingRes.json();
        setCourseData(landingData);

        // Fetch notifications (info type only)
        const notifRes = await fetch(
          `${getBaseUrl()}/api/notifications/active`
        );
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          // Filter only info type notifications
          const infoNotifications = notifData.filter(
            (n) => n.type === "info" || !n.type
          );
          setNotifications(infoNotifications.slice(0, 5)); // Show max 5
        }

        // Worksheets now come from landing API
        if (landingData.worksheets) {
          setWorksheets(landingData.worksheets.slice(0, 3));
        }

        // Fetch chapters progress if logged in
        const studentToken = localStorage.getItem("studentToken");
        if (studentToken) {
          const progressRes = await fetch(
            `${getBaseUrl()}/api/students/chapters/progress`,
            { headers: { Authorization: `Bearer ${studentToken}` } }
          );
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            setChaptersProgress(progressData.chapters || []);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get chapter progress by ID
  const getChapterProgress = (chapterId) => {
    return chaptersProgress.find((c) => c._id === chapterId);
  };

  const handleNavigate = (chapterId) => {
    if (!isLoggedIn) {
      toast.error("กรุณาเข้าสู่ระบบเพื่อดูบทเรียน");
      navigate("/login");
      return;
    }
    // Check if chapter is locked
    const chapterProgress = getChapterProgress(chapterId);
    if (chapterProgress && !chapterProgress.isUnlocked) {
      toast.error(chapterProgress.lockReason || "บทเรียนนี้ยังล็อคอยู่");
      return;
    }
    navigate(`/chapter/${chapterId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-slate-900" : "bg-blue-600"
        }`}
      >
        <FaSpinner className="animate-spin text-white text-4xl" />
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-slate-900" : "bg-blue-600"
        }`}
      >
        <div className="text-white text-center">
          <p className="text-xl mb-2">Unable to load data</p>
          <p className="text-white/60">{error}</p>
        </div>
      </div>
    );
  }

  const { teacher, subject, chapters } = courseData;

  return (
    <div
      className={`min-h-screen relative flex flex-col font-sans transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-800/95 via-slate-900 to-slate-800/95"
          : "bg-gradient-to-br from-blue-400/90 via-blue-500/85 to-blue-400/90"
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
        <div
          className={`absolute top-0 right-0 w-[500px] h-[500px] opacity-10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 ${
            isDarkMode ? "bg-blue-400" : "bg-white"
          }`}
        ></div>
        <div
          className={`absolute bottom-0 left-0 w-[400px] h-[400px] opacity-10 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3 ${
            isDarkMode ? "bg-cyan-400" : "bg-blue-300"
          }`}
        ></div>
      </div>

      {/* Hero Section with Course Outline */}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-12 flex items-center justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl items-start lg:items-center">
          {/* Left Column - Course Outline */}
          <div className="lg:col-span-5 flex flex-col gap-6 order-2 lg:order-1">
            <RevealOnScroll animation="fadeInUp" duration={1000}>
              <div className="text-white mb-2">
                <h4 className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">
                  บทเรียนบนเว็บ
                </h4>
                <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                  กระบวนการออกแบบเชิงวิศวกรรม
                </h1>
                <p
                  className={`text-sm mt-2 ${
                    isDarkMode ? "text-blue-400" : "text-blue-200"
                  }`}
                >
                  ของนักเรียนชั้นมัธยมศึกษาปีที่ 4 โรงเรียนภูเวียงวิทยาคม
                </p>
              </div>

              {/* Lessons Accordion */}
              <div
                className={`rounded-2xl shadow-xl overflow-hidden border backdrop-blur-sm ${
                  isDarkMode
                    ? "bg-slate-800/90 border-slate-700"
                    : "bg-white/95 border-white/20"
                }`}
              >
                <button
                  onClick={() => setIsObjectiveOpen(!isObjectiveOpen)}
                  className={`w-full flex items-center justify-between px-6 py-5 border-b transition-colors group ${
                    isDarkMode
                      ? "bg-slate-800 border-slate-700 hover:bg-slate-700"
                      : "bg-white border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isDarkMode
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-blue-600/10 text-blue-600"
                      }`}
                    >
                      <FaBook className="text-sm" />
                    </div>
                    <span
                      className={`font-bold text-lg ${
                        isDarkMode ? "text-white" : "text-blue-700"
                      }`}
                    >
                      All Lessons
                    </span>
                  </div>
                  {isObjectiveOpen ? (
                    <FaChevronUp
                      className={
                        isDarkMode ? "text-slate-400" : "text-gray-400"
                      }
                    />
                  ) : (
                    <FaChevronDown
                      className={`${
                        isDarkMode ? "text-slate-400" : "text-gray-400"
                      } group-hover:text-blue-500`}
                    />
                  )}
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isObjectiveOpen
                      ? "max-h-[600px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="py-2">
                    {chapters.map((chapter, index) => {
                      const chapterProgress = getChapterProgress(chapter._id);
                      const isLocked = isLoggedIn
                        ? chapterProgress
                          ? !chapterProgress.isUnlocked
                          : index > 0
                        : true;
                      const progress = chapterProgress?.progress;

                      return (
                        <div
                          key={chapter._id}
                          onClick={() => handleNavigate(chapter._id)}
                          className={`px-6 py-3 border-l-4 border-transparent cursor-pointer transition-all flex items-center justify-between group ${
                            isDarkMode
                              ? "hover:border-blue-400 hover:bg-blue-500/10"
                              : "hover:border-blue-600 hover:bg-blue-50"
                          } ${isLocked ? "opacity-60" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-xs font-bold ${
                                progress?.posttestPassed
                                  ? "text-green-500"
                                  : isDarkMode
                                  ? "text-slate-500 group-hover:text-blue-400"
                                  : "text-gray-400 group-hover:text-blue-600"
                              }`}
                            >
                              {progress?.posttestPassed
                                ? "✓"
                                : (index + 1).toString().padStart(2, "0")}
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                isDarkMode
                                  ? "text-slate-300 group-hover:text-white"
                                  : "text-gray-700 group-hover:text-blue-700"
                              }`}
                            >
                              {chapter.chapter_name}
                            </span>
                            {/* Progress dots for logged in users */}
                            {isLoggedIn && progress && !isLocked && (
                              <div className="flex items-center gap-1 ml-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    progress.pretestCompleted
                                      ? "bg-green-500"
                                      : "bg-slate-500"
                                  }`}
                                  title="Pretest"
                                />
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    progress.videoWatched
                                      ? "bg-green-500"
                                      : "bg-slate-500"
                                  }`}
                                  title="Video"
                                />
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    progress.posttestPassed
                                      ? "bg-green-500"
                                      : progress.posttestCompleted
                                      ? "bg-red-500"
                                      : "bg-slate-500"
                                  }`}
                                  title="Posttest"
                                />
                              </div>
                            )}
                          </div>
                          {isLocked && (
                            <FaLock
                              className={`text-xs ${
                                isDarkMode ? "text-slate-500" : "text-gray-400"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="text-white/80 text-sm leading-relaxed">
                {subject.description || "No description available."}
              </div>
            </RevealOnScroll>
          </div>

          {/* Right Column - Empty Placeholder */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end order-1 lg:order-2 relative">
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-10 rounded-full blur-3xl -z-10 ${
                isDarkMode ? "bg-blue-400" : "bg-white"
              }`}
            ></div>

            {/* Empty Container - Placeholder */}
            <RevealOnScroll
              animation="fadeInLeft"
              duration={1000}
              delay={200}
              className="w-full max-w-md"
            >
              <div
                className={`rounded-[2.5rem] p-8 md:p-10 shadow-2xl w-full min-h-[400px] flex items-center justify-center ${
                  isDarkMode ? "bg-slate-800/50" : "bg-white/30"
                } border-2 border-dashed ${
                  isDarkMode ? "border-slate-600" : "border-white/50"
                }`}
              >
                <p
                  className={`text-center ${
                    isDarkMode ? "text-slate-500" : "text-white/60"
                  }`}
                >
                  กล่องเปล่า (สำหรับเพิ่มเนื้อหาภายหลัง)
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </main>

      {/* News & Announcements Section */}
      <RevealOnScroll animation="fadeInRight" duration={1000}>
        <section
          className={`relative z-10 py-12 ${
            isDarkMode ? "bg-slate-800/50" : "bg-white/10"
          }`}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isDarkMode ? "bg-amber-500/20" : "bg-amber-400/30"
                }`}
              >
                <FaBullhorn className="text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                ข่าวสารและประชาสัมพันธ์
              </h2>
            </div>

            {notifications.length === 0 ? (
              <div
                className={`text-center py-12 rounded-2xl ${
                  isDarkMode ? "bg-slate-700/50" : "bg-white/20"
                }`}
              >
                <FaBullhorn className="text-4xl text-white/30 mx-auto mb-4" />
                <p className="text-white/60">ยังไม่มีข่าวสารในขณะนี้</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notifications.map((notif, index) => (
                  <RevealOnScroll
                    key={notif._id}
                    animation="fadeInUp"
                    duration={800}
                    delay={index * 100}
                  >
                    <Link
                      to={`/notifications/${notif._id}`}
                      className={`block p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl ${
                        isDarkMode
                          ? "bg-slate-700/80 hover:bg-slate-700"
                          : "bg-white/90 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isDarkMode ? "bg-blue-500/20" : "bg-blue-100"
                          }`}
                        >
                          <FaBullhorn
                            className={
                              isDarkMode ? "text-blue-400" : "text-blue-600"
                            }
                            size={14}
                          />
                        </div>
                        <h3
                          className={`font-bold line-clamp-2 ${
                            isDarkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {notif.title}
                        </h3>
                      </div>
                      <p
                        className={`text-sm line-clamp-2 mb-3 ${
                          isDarkMode ? "text-slate-400" : "text-gray-600"
                        }`}
                      >
                        {notif.message}
                      </p>
                      <div
                        className={`flex items-center gap-2 text-xs ${
                          isDarkMode ? "text-slate-500" : "text-gray-400"
                        }`}
                      >
                        <FaCalendarAlt />
                        <span>{formatDate(notif.createdAt)}</span>
                      </div>
                    </Link>
                  </RevealOnScroll>
                ))}
              </div>
            )}
          </div>
        </section>
      </RevealOnScroll>

      {/* Worksheets Section */}
      <RevealOnScroll animation="fadeInLeft" duration={1000}>
        <section className="relative z-10 py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isDarkMode ? "bg-green-500/20" : "bg-green-400/30"
                }`}
              >
                <FaEdit className="text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">ใบงาน</h2>
            </div>

            <WorksheetCarousel
              worksheets={worksheets}
              isLoggedIn={isLoggedIn}
              teacherInfo={teacherInfo}
              formatDate={formatDate}
            />
          </div>
        </section>
      </RevealOnScroll>

      {/* Chapters Section */}
      <RevealOnScroll animation="fadeInUp" duration={1000}>
        <section
          className={`relative z-10 py-12 ${
            isDarkMode ? "bg-slate-800/50" : "bg-white/10"
          }`}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                บทเรียนทั้งหมด
              </h2>
              <p className="text-white/60">เลือกบทเรียนเพื่อเริ่มเรียน</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {chapters.map((chapter, index) => {
                const chapterProgress = getChapterProgress(chapter._id);
                // If logged in, use API lock status; else lock all
                const isLocked = isLoggedIn
                  ? chapterProgress
                    ? !chapterProgress.isUnlocked
                    : index > 0 // If no progress data, lock all except first
                  : true; // Not logged in = all locked
                const lockReason = isLoggedIn
                  ? chapterProgress?.lockReason
                  : "กรุณาเข้าสู่ระบบเพื่อดูบทเรียน";

                return (
                  <RevealOnScroll
                    key={chapter._id}
                    animation="fadeInUp"
                    duration={800}
                    delay={index * 100}
                  >
                    <ChapterCard
                      chapter={chapter}
                      index={index}
                      isLocked={isLocked}
                      lockReason={lockReason}
                      progress={chapterProgress?.progress}
                    />
                  </RevealOnScroll>
                );
              })}
            </div>

            {/* Final Exam Button - Show when all chapters completed */}
            {isLoggedIn &&
              chaptersProgress.length > 0 &&
              chaptersProgress.every((c) => c.progress?.posttestPassed) && (
                <div className="mt-12 text-center">
                  <div
                    className={`inline-block p-8 rounded-2xl ${
                      isDarkMode
                        ? "bg-gradient-to-r from-yellow-600/20 to-orange-600/20"
                        : "bg-gradient-to-r from-yellow-100 to-orange-100"
                    }`}
                  >
                    <div className="text-5xl mb-4">🏆</div>
                    <h3
                      className={`text-2xl font-bold mb-2 ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      ยินดีด้วย! คุณเรียนจบครบทุกบทแล้ว
                    </h3>
                    <p
                      className={`mb-6 ${
                        isDarkMode ? "text-slate-300" : "text-gray-600"
                      }`}
                    >
                      พร้อมสอบ Final Exam แล้วหรือยัง?
                    </p>
                    <button
                      onClick={() =>
                        navigate(`/final-exam/${courseData?.subject?._id}`)
                      }
                      className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition shadow-lg text-lg"
                    >
                      🎯 เริ่มทำ Final Exam
                    </button>
                  </div>
                </div>
              )}
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll animation="fadeInUp" duration={1000}>
        <footer className="relative z-10 py-6 text-center text-white/40 text-sm">
          © 2024 บทเรียนบนเว็บ เรื่อง กระบวนการออกแบบเชิงวิศวกรรม
        </footer>
      </RevealOnScroll>
    </div>
  );
};

export default LandingPage;
