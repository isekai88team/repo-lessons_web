import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaSpinner,
  FaArrowLeft,
  FaPlayCircle,
  FaFileAlt,
  FaPlay,
  FaLock,
} from "react-icons/fa";
import getBaseUrl from "../untils/baseURL";

const ChapterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if student is logged in
    const token = localStorage.getItem("studentToken");
    setIsLoggedIn(!!token);

    const fetchChapterDetail = async () => {
      try {
        // ใช้ public API endpoint เพื่อให้ดูรายละเอียดได้โดยไม่ต้อง login
        const response = await fetch(`${getBaseUrl()}/api/chapters/${id}`);

        if (!response.ok) {
          throw new Error("ไม่สามารถโหลดเนื้อหาบทเรียนได้");
        }

        const data = await response.json();
        setChapter(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterDetail();
  }, [id]);

  // Handler สำหรับปุ่มเริ่มเรียน - ต้อง login ก่อน
  const handleStartLearning = () => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      // บันทึก URL ปัจจุบันเพื่อ redirect กลับมาหลัง login
      localStorage.setItem("returnUrl", `/chapter/${id}`);
      navigate("/login");
    } else {
      // ถ้า login แล้ว ให้เริ่มเล่นวิดีโอหรือทำ action อื่น
      // สามารถเพิ่ม logic ที่ต้องการได้ตรงนี้
      console.log("Start learning chapter:", id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FaSpinner className="animate-spin text-[#44624A] text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="text-[#44624A] underline"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">
            {chapter.chapter_name}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Video Section */}
          <div className="bg-black rounded-xl overflow-hidden aspect-video shadow-lg relative group">
            {chapter.videoUrl ? (
              <div className="w-full h-full flex items-center justify-center text-white">
                Video Player Here
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white/50">
                <FaPlayCircle className="text-6xl mb-4 text-[#44624A]" />
                <p>ไม่มีวิดีโอประกอบ</p>
              </div>
            )}
          </div>

          {/* Start Learning Button */}
          <div className="flex justify-center">
            <button
              onClick={handleStartLearning}
              className="bg-[#44624A] hover:bg-[#354e3a] text-white text-lg font-bold py-4 px-8 rounded-xl shadow-lg shadow-[#44624A]/30 flex items-center gap-3 transition-all active:scale-95"
            >
              {isLoggedIn ? (
                <>
                  <FaPlay />
                  <span>เริ่มเรียน</span>
                </>
              ) : (
                <>
                  <FaLock />
                  <span>เข้าสู่ระบบเพื่อเริ่มเรียน</span>
                </>
              )}
            </button>
          </div>

          {/* Description & Content */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              รายละเอียดบทเรียน
            </h2>
            <div className="prose max-w-none text-gray-600">
              {chapter.content ||
                chapter.description ||
                "ไม่มีเนื้อหาเพิ่มเติม"}
            </div>

            {/* Attachments */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaFileAlt className="text-[#44624A]" /> เอกสารประกอบ
              </h3>
              <div className="flex flex-col gap-2">
                <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-[#44624A]/5 cursor-pointer transition">
                  <span className="text-sm text-gray-600">
                    Slide_Chapter_1.pdf
                  </span>
                  <span className="text-xs text-[#44624A] font-bold">
                    Download
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChapterDetail;
