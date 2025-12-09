import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaSpinner,
  FaPlay,
  FaBook,
  FaFileAlt,
  FaCheckCircle,
} from "react-icons/fa";
import getBaseUrl from "../../untils/baseURL";

const ChapterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chapterData, setChapterData] = useState(null);

  // Check if student is logged in
  useEffect(() => {
    const studentToken = localStorage.getItem("studentToken");
    if (!studentToken) {
      // Save current URL and redirect to login
      localStorage.setItem("returnUrl", `/chapter/${id}`);
      navigate("/login");
      return;
    }

    // Fetch chapter data
    const fetchChapter = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${getBaseUrl()}/api/public/chapter/${id}`
        );
        if (!response.ok) {
          throw new Error("ไม่พบบทเรียน");
        }
        const data = await response.json();
        setChapterData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [id, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#44624A] flex items-center justify-center">
        <FaSpinner className="animate-spin text-white text-4xl" />
      </div>
    );
  }

  // Error state
  if (error || !chapterData) {
    return (
      <div className="min-h-screen bg-[#44624A] flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">ไม่สามารถโหลดข้อมูลได้</p>
          <p className="text-white/60 mb-6">{error}</p>
          <Link
            to="/"
            className="bg-white/20 px-6 py-3 rounded-xl hover:bg-white/30 transition"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  const { chapter, subject } = chapterData;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#44624A] text-white py-4 px-6 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="font-bold text-lg">{chapter.chapter_name}</h1>
              <p className="text-white/70 text-sm">
                {subject?.subject_name} ({subject?.code})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                localStorage.removeItem("studentToken");
                localStorage.removeItem("studentInfo");
                navigate("/login");
              }}
              className="text-sm text-white/70 hover:text-white"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {chapter.video_url ? (
                <div className="aspect-video bg-black">
                  <video controls className="w-full h-full" poster="">
                    <source src={chapter.video_url} type="video/mp4" />
                    เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                  </video>
                </div>
              ) : (
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <FaPlay className="text-4xl mx-auto mb-2 opacity-30" />
                    <p>ยังไม่มีวิดีโอสำหรับบทเรียนนี้</p>
                  </div>
                </div>
              )}

              {/* Chapter Info */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {chapter.chapter_name}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {chapter.description || "ไม่มีคำอธิบายบทเรียน"}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-[#44624A]" />
                สถานะการเรียน
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">วิดีโอ</span>
                  <span
                    className={`text-sm font-medium ${
                      chapter.video_url ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {chapter.video_url ? "มีวิดีโอ" : "ไม่มีวิดีโอ"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">เอกสาร</span>
                  <span
                    className={`text-sm font-medium ${
                      chapter.document_url ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {chapter.document_url ? "มีเอกสาร" : "ไม่มีเอกสาร"}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Download */}
            {chapter.document_url && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaFileAlt className="text-[#44624A]" />
                  เอกสารประกอบ
                </h3>
                <a
                  href={chapter.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#44624A] text-white text-center py-3 rounded-xl hover:bg-[#354e3a] transition"
                >
                  ดาวน์โหลดเอกสาร
                </a>
              </div>
            )}

            {/* Teacher Info */}
            {subject?.teacher && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaBook className="text-[#44624A]" />
                  ครูผู้สอน
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#44624A] text-white flex items-center justify-center font-bold">
                    {subject.teacher.firstName?.charAt(0).toUpperCase() || "T"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {subject.teacher.firstName} {subject.teacher.lastName}
                    </p>
                    <p className="text-sm text-gray-500">ครูผู้สอน</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChapterDetail;
