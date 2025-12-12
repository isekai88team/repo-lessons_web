import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaLock } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

const ChapterCard = ({ chapter, index }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleClick = () => {
    navigate(`/chapter/${chapter._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group block ${
        isDarkMode
          ? "bg-slate-800 hover:bg-slate-700"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
            isDarkMode
              ? "bg-blue-500/20 text-blue-400"
              : "bg-blue-600/10 text-blue-600"
          }`}
        >
          {(index + 1).toString().padStart(2, "0")}
        </div>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${
            isDarkMode
              ? "text-blue-400 bg-blue-500/20"
              : "text-blue-600 bg-blue-600/10"
          }`}
        >
          {chapter.hasVideo ? "Video" : "Lesson"}
        </span>
      </div>
      <h3
        className={`font-bold text-lg mb-2 transition-colors ${
          isDarkMode
            ? "text-white group-hover:text-blue-400"
            : "text-gray-800 group-hover:text-blue-600"
        }`}
      >
        {chapter.chapter_name}
      </h3>
      <p
        className={`text-sm mb-4 line-clamp-2 ${
          isDarkMode ? "text-slate-400" : "text-gray-500"
        }`}
      >
        {chapter.description || "Course content."}
      </p>
      <div className="flex items-center justify-between">
        <span
          className={`text-xs ${
            isDarkMode ? "text-slate-500" : "text-gray-400"
          }`}
        >
          Chapter {index + 1}
        </span>
        <FaPlay className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export default ChapterCard;
