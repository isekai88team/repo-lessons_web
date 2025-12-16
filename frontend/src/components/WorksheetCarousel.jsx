import React, { useState, useEffect, useCallback } from "react";
import { FaChevronLeft, FaChevronRight, FaEdit, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const WorksheetCarousel = ({
  worksheets,
  isLoggedIn,
  teacherInfo,
  formatDate,
}) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play logic
  useEffect(() => {
    if (isPaused || worksheets.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % worksheets.length);
    }, 3000); // 3 seconds per slide

    return () => clearInterval(interval);
  }, [isPaused, worksheets.length]);

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + worksheets.length) % worksheets.length
    );
  };

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % worksheets.length);
  }, [worksheets.length]);

  if (!worksheets || worksheets.length === 0) {
    return (
      <div
        className={`text-center py-12 rounded-2xl ${
          isDarkMode ? "bg-slate-700/50" : "bg-white/20"
        }`}
      >
        <FaEdit className="text-4xl text-white/30 mx-auto mb-4" />
        <p className="text-white/60">ยังไม่มีใบงานในขณะนี้</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full max-w-5xl mx-auto py-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Cards Container */}
      <div className="relative h-[450px] md:h-[400px] flex items-center justify-center overflow-visible perspective-1000">
        {worksheets.map((worksheet, index) => {
          // Calculate position relative to current index
          let position =
            (index - currentIndex + worksheets.length) % worksheets.length; // 0, 1, 2...
          // Adjust for center focusing logic if needed or keep simple sliding logic
          // For truly centered focus (prev, center, next), we need a bit complex mapping

          // Simplified logic for 3 visible items if possible, or just standard carousel with focus
          // Better approach for "Focus Effect":
          // Calculate offset: -1 (left), 0 (center), 1 (right)
          const offset =
            ((index - currentIndex + worksheets.length + 1) %
              worksheets.length) -
            1; // ... -1, 0, 1 ... but works best with odd items

          // Improved logic for circular carousel with focus
          // We will render all, but style them based on distance from current
          const isActive = index === currentIndex;
          const isPrev =
            index ===
            (currentIndex - 1 + worksheets.length) % worksheets.length;
          const isNext = index === (currentIndex + 1) % worksheets.length;

          // Determine visibility and styles
          let styles = "opacity-0 scale-75 z-0 hidden"; // Default hidden
          let xTranslate = "0%";

          if (isActive) {
            styles = "opacity-100 scale-100 z-30 shadow-2xl";
            xTranslate = "0%";
          } else if (isPrev) {
            styles = "opacity-60 scale-90 z-20 cursor-pointer";
            xTranslate = "-60%"; // Move left
            // On mobile, maybe hide prev/next or stack them
          } else if (isNext) {
            styles = "opacity-60 scale-90 z-20 cursor-pointer";
            xTranslate = "60%"; // Move right
          }

          // Force show only prev, current, next for performance/visuals
          if (!isActive && !isPrev && !isNext) {
            // Hide others completely
            styles = "hidden";
          }

          return (
            <div
              key={worksheet._id}
              className={`absolute top-0 w-full md:w-[60%] lg:w-[45%] transition-all duration-700 ease-in-out ${styles}`}
              style={{
                transform: isActive
                  ? "translateX(0) scale(1)"
                  : isPrev
                  ? "translateX(-55%) scale(0.9)"
                  : isNext
                  ? "translateX(55%) scale(0.9)"
                  : "scale(0)",
                filter: isActive ? "blur(0px)" : "blur(2px)", // Optional blur for side items
              }}
              onClick={() => {
                if (isPrev) handlePrev();
                if (isNext) handleNext();
              }}
            >
              <div
                className={`rounded-2xl overflow-hidden shadow-xl h-full ${
                  isDarkMode ? "bg-slate-800" : "bg-white"
                }`}
              >
                {/* Lock Overlay for non-logged users - Only clickable on active */}
                {!isLoggedIn && (
                  <div
                    className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.error("กรุณาเข้าสู่ระบบเพื่อดูใบงาน");
                      navigate("/login");
                    }}
                  >
                    <div className="text-center">
                      <FaLock className="text-white text-3xl mx-auto mb-2" />
                      <p className="text-white text-sm">
                        เข้าสู่ระบบเพื่อดูใบงาน
                      </p>
                    </div>
                  </div>
                )}

                {/* Worksheet Header */}
                <div
                  className="p-6"
                  style={{
                    background: isDarkMode
                      ? "linear-gradient(135deg, #166534 0%, #15803d 100%)"
                      : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    borderBottom: "4px solid #14532d",
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <FaEdit className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      งานที่ {index + 1}
                    </h3>
                  </div>
                  <p className="text-white/90 text-lg leading-relaxed line-clamp-2">
                    {worksheet.title}
                  </p>
                  {worksheet.deadline && (
                    <p className="text-white/70 text-sm mt-2">
                      ทำภายในวันที่ {formatDate(worksheet.deadline)}
                    </p>
                  )}
                </div>

                {/* Teacher Info */}
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    {teacherInfo?.image ? (
                      <img
                        src={teacherInfo.image}
                        alt={teacherInfo.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-green-500"
                      />
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${
                          isDarkMode
                            ? "bg-gradient-to-br from-green-600 to-green-800 text-white"
                            : "bg-gradient-to-br from-green-500 to-green-700 text-white"
                        }`}
                      >
                        {teacherInfo?.name?.charAt(0) || "T"}
                      </div>
                    )}
                    <div>
                      <p
                        className={`font-bold ${
                          isDarkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {teacherInfo?.name || "อาจารย์ผู้สอน"}
                      </p>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-slate-400" : "text-gray-500"
                        }`}
                      >
                        {teacherInfo?.role || "ครูประจำวิชา"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        className={`absolute top-1/2 left-0 md:-left-4 -translate-y-1/2 z-40 p-3 rounded-full shadow-lg transition-all ${
          isDarkMode
            ? "bg-slate-700 text-white hover:bg-slate-600"
            : "bg-white text-blue-600 hover:bg-gray-50"
        }`}
      >
        <FaChevronLeft size={24} />
      </button>

      <button
        onClick={handleNext}
        className={`absolute top-1/2 right-0 md:-right-4 -translate-y-1/2 z-40 p-3 rounded-full shadow-lg transition-all ${
          isDarkMode
            ? "bg-slate-700 text-white hover:bg-slate-600"
            : "bg-white text-blue-600 hover:bg-gray-50"
        }`}
      >
        <FaChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {worksheets.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentIndex === idx
                ? "bg-green-500 w-8"
                : isDarkMode
                ? "bg-slate-600 hover:bg-slate-500"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default WorksheetCarousel;
