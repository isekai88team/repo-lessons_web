import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaChevronDown,
  FaChevronUp,
  FaBook,
  FaPlay,
  FaLaptop,
  FaSpinner,
} from "react-icons/fa";
import getBaseUrl from "../untils/baseURL";

const LandingPage = () => {
  const [isObjectiveOpen, setIsObjectiveOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseData, setCourseData] = useState(null);

  // Fetch data from API
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
        console.error("Error fetching landing data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#44624A] flex items-center justify-center">
        <FaSpinner className="animate-spin text-white text-4xl" />
      </div>
    );
  }

  // Error state
  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-[#44624A] flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-2">ไม่สามารถโหลดข้อมูลได้</p>
          <p className="text-white/60">{error}</p>
        </div>
      </div>
    );
  }

  const { teacher, subject, chapters } = courseData;

  return (
    <div className="min-h-screen bg-[#44624A] relative overflow-x-hidden flex flex-col font-sans">
      {/* --- Background Pattern --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
      </div>

      {/* --- Main Content --- */}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-12 flex items-center justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl items-start lg:items-center">
          {/* --- Column Left: Chapters List --- */}
          <div className="lg:col-span-5 flex flex-col gap-6 order-2 lg:order-1">
            <div className="text-white mb-2">
              <h4 className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">
                Course Outline
              </h4>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                {subject.subject_name}
                <br />
                <span className="text-[#A3C9A8]">{subject.code}</span>
              </h1>
            </div>

            {/* Chapters Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <button
                onClick={() => setIsObjectiveOpen(!isObjectiveOpen)}
                className="w-full flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100 transition-colors hover:bg-gray-50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#44624A]/10 text-[#44624A] flex items-center justify-center">
                    <FaBook className="text-sm" />
                  </div>
                  <span className="font-bold text-[#44624A] text-lg">
                    บทเรียนทั้งหมด
                  </span>
                </div>
                {isObjectiveOpen ? (
                  <FaChevronUp className="text-gray-400" />
                ) : (
                  <FaChevronDown className="text-gray-400 group-hover:text-[#44624A]" />
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
                      className="px-6 py-3 border-l-4 border-transparent hover:border-[#44624A] hover:bg-[#44624A]/5 cursor-pointer transition-all flex items-start gap-3 group"
                    >
                      <span className="text-xs font-bold text-gray-400 mt-1 group-hover:text-[#44624A]">
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                      <span className="text-gray-700 text-sm group-hover:text-black font-medium">
                        {chapter.chapter_name}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
                  * เนื้อหาอ้างอิงจากหลักสูตรแกนกลางฯ สสวท.
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="text-white/80 text-sm leading-relaxed">
              {subject.description ||
                "รายวิชานี้ครอบคลุมเนื้อหาพื้นฐานที่จำเป็นสำหรับการเรียนรู้"}
            </div>
          </div>

          {/* --- Column Right: Main Hero Card --- */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end order-1 lg:order-2 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#ffffff] opacity-5 rounded-full blur-3xl -z-10"></div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-w-md w-full relative group hover:-translate-y-2 transition-transform duration-500 ease-out">
              {/* Badge Top */}
              <div className="flex justify-between items-start mb-6">
                <span className="bg-[#44624A] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
                  รหัสวิชา: {subject.code}
                </span>
                <span className="flex items-center gap-1 text-gray-400 text-sm">
                  <FaBook /> {chapters.length} บท
                </span>
              </div>

              {/* Title Section */}
              <div className="mb-6">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
                  {subject.subject_name}
                </h2>
                <p className="text-[#44624A] font-medium text-lg">
                  {subject.code}
                </p>
              </div>

              {/* Image Placeholder */}
              <div className="w-full h-48 bg-gradient-to-br from-[#44624A]/10 to-[#44624A]/20 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaLaptop size={80} className="text-[#44624A]/30" />
                </div>
                <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-white/80 to-transparent"></div>
              </div>

              {/* Footer Info & Button */}
              <div className="flex flex-col gap-6">
                {/* Teacher Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#44624A] text-white flex items-center justify-center font-bold">
                    {teacher.firstName?.charAt(0).toUpperCase() || "T"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {teacher.firstName} {teacher.lastName}
                    </p>
                    <p className="text-xs text-gray-500">ครูผู้สอน</p>
                  </div>
                </div>

                {/* Main CTA Button */}
                <button className="w-full bg-[#44624A] hover:bg-[#354e3a] text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-[#44624A]/30 flex items-center justify-center gap-3 transition-all active:scale-95">
                  <span>เข้าสู่บทเรียน</span>
                  <div className="bg-white/20 p-1.5 rounded-full">
                    <FaPlay size={12} className="ml-0.5" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- Chapter Cards Section --- */}
      <section className="relative z-10 py-12 bg-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              บทเรียนทั้งหมด
            </h2>
            <p className="text-white/60">เลือกบทเรียนที่ต้องการศึกษา</p>
          </div>

          {/* Chapter Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {chapters.map((chapter, index) => (
              <Link
                key={chapter._id}
                to={`/chapter/${chapter._id}`}
                className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#44624A]/10 flex items-center justify-center text-[#44624A] text-xl font-bold">
                    {(index + 1).toString().padStart(2, "0")}
                  </div>
                  <span className="text-xs font-medium text-[#44624A] bg-[#44624A]/10 px-3 py-1 rounded-full">
                    {chapter.hasVideo
                      ? "วิดีโอ"
                      : chapter.hasDocument
                      ? "เอกสาร"
                      : "บทเรียน"}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-[#44624A] transition-colors">
                  {chapter.chapter_name}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {chapter.description || "เนื้อหาบทเรียนสำหรับศึกษา"}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    บทที่ {index + 1}
                  </span>
                  <FaPlay className="text-[#44624A] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="relative z-10 py-6 text-center text-white/40 text-sm">
        © 2024 ISEKAI TEAM Education Platform. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
