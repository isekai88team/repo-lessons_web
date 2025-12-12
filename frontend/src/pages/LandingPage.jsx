import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaChevronDown,
  FaChevronUp,
  FaBook,
  FaPlay,
  FaLaptop,
  FaSpinner,
} from "react-icons/fa";
import getBaseUrl from "../untils/baseURL";
import ChapterCard from "../components/ChapterCard";
import { useTheme } from "../context/ThemeContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const [isObjectiveOpen, setIsObjectiveOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseData, setCourseData] = useState(null);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${getBaseUrl()}/api/public/landing`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setCourseData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  const handleNavigate = (chapterId) => {
    navigate(`/chapter/${chapterId}`);
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
      className={`min-h-screen relative overflow-x-hidden flex flex-col font-sans transition-colors duration-300 ${
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

      <main className="flex-1 container mx-auto px-4 py-6 md:py-12 flex items-center justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl items-start lg:items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 flex flex-col gap-6 order-2 lg:order-1">
            <div className="text-white mb-2">
              <h4 className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">
                Course Outline
              </h4>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                {subject.subject_name}
                <br />
                <span
                  className={isDarkMode ? "text-blue-400" : "text-blue-200"}
                >
                  {subject.code}
                </span>
              </h1>
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
                    className={isDarkMode ? "text-slate-400" : "text-gray-400"}
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
                  {chapters.map((chapter, index) => (
                    <div
                      key={chapter._id}
                      onClick={() => handleNavigate(chapter._id)}
                      className={`px-6 py-3 border-l-4 border-transparent cursor-pointer transition-all flex items-start gap-3 group ${
                        isDarkMode
                          ? "hover:border-blue-400 hover:bg-blue-500/10"
                          : "hover:border-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold mt-1 ${
                          isDarkMode
                            ? "text-slate-500 group-hover:text-blue-400"
                            : "text-gray-400 group-hover:text-blue-600"
                        }`}
                      >
                        {(index + 1).toString().padStart(2, "0")}
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
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-white/80 text-sm leading-relaxed">
              {subject.description || "No description available."}
            </div>
          </div>

          {/* Right Column - Course Card */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end order-1 lg:order-2 relative">
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-10 rounded-full blur-3xl -z-10 ${
                isDarkMode ? "bg-blue-400" : "bg-white"
              }`}
            ></div>

            <div
              className={`rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-w-md w-full relative group hover:-translate-y-2 transition-transform duration-500 ease-out ${
                isDarkMode ? "bg-slate-800" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
                  {subject.code}
                </span>
                <span
                  className={`flex items-center gap-1 text-sm ${
                    isDarkMode ? "text-slate-400" : "text-gray-400"
                  }`}
                >
                  <FaBook /> {chapters.length} Chapters
                </span>
              </div>

              <div className="mb-6">
                <h2
                  className={`text-4xl font-extrabold mb-2 leading-tight ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {subject.subject_name}
                </h2>
                <p className="text-blue-500 font-medium text-lg">
                  {subject.code}
                </p>
              </div>

              <div
                className={`w-full h-48 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden ${
                  isDarkMode
                    ? "bg-gradient-to-br from-blue-600/20 to-blue-800/20"
                    : "bg-gradient-to-br from-blue-100 to-blue-200"
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaLaptop
                    size={80}
                    className={
                      isDarkMode ? "text-blue-400/30" : "text-blue-600/30"
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold">
                    {teacher.firstName?.charAt(0).toUpperCase() || "T"}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {teacher.firstName} {teacher.lastName}
                    </p>
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-slate-400" : "text-gray-500"
                      }`}
                    >
                      Instructor
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (chapters.length > 0) handleNavigate(chapters[0]._id);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  <span>Start Learning</span>
                  <div className="bg-white/20 p-1.5 rounded-full">
                    <FaPlay size={12} className="ml-0.5" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Chapters Grid */}
      <section
        className={`relative z-10 py-12 ${
          isDarkMode ? "bg-slate-800/50" : "bg-white/10"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              All Chapters
            </h2>
            <p className="text-white/60">Select a chapter to start learning</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {chapters.map((chapter, index) => (
              <ChapterCard key={chapter._id} chapter={chapter} index={index} />
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-6 text-center text-white/40 text-sm">
        © 2024 ISEKAI TEAM Education Platform. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
