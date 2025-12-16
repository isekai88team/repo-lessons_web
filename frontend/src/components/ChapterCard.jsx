import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaLock, FaCheck } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const ChapterCard = ({
  chapter,
  index,
  isLocked = false,
  lockReason = null,
  progress = null,
}) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleClick = () => {
    if (isLocked) {
      toast.error(lockReason || "บทเรียนนี้ยังล็อคอยู่");
      return;
    }
    navigate(`/chapter/${chapter._id}`);
  };

  // Progress indicators
  const pretestDone = progress?.pretestCompleted;
  const videoDone = progress?.videoWatched;
  const posttestDone = progress?.posttestPassed;

  return (
    <div
      onClick={handleClick}
      className={`rounded-2xl p-6 shadow-xl transition-all cursor-pointer group block relative ${
        isLocked ? "opacity-60" : "hover:shadow-2xl hover:-translate-y-1"
      } ${
        isDarkMode
          ? "bg-slate-800 hover:bg-slate-700"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute top-3 right-3 z-10">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDarkMode ? "bg-slate-600" : "bg-gray-200"
            }`}
          >
            <FaLock
              className={`text-base ${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}
            />
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
            posttestDone
              ? "bg-green-500/20 text-green-500"
              : isDarkMode
              ? "bg-blue-500/20 text-blue-400"
              : "bg-blue-600/10 text-blue-600"
          }`}
        >
          {posttestDone ? <FaCheck /> : (index + 1).toString().padStart(2, "0")}
        </div>
        {!isLocked && (
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${
              posttestDone
                ? "text-green-500 bg-green-500/20"
                : isDarkMode
                ? "text-blue-400 bg-blue-500/20"
                : "text-blue-600 bg-blue-600/10"
            }`}
          >
            {posttestDone ? "เสร็จแล้ว" : chapter.hasVideo ? "Video" : "Lesson"}
          </span>
        )}
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

      {/* Progress Indicators */}
      {progress && !isLocked && (
        <div className="flex items-center gap-2 mb-3">
          {/* Pretest */}
          <div className="flex items-center gap-1">
            <div
              className={`w-3 h-3 rounded-full ${
                pretestDone
                  ? "bg-green-500"
                  : isDarkMode
                  ? "bg-slate-600"
                  : "bg-gray-300"
              }`}
            />
            <span
              className={`text-xs ${
                isDarkMode ? "text-slate-500" : "text-gray-400"
              }`}
            >
              Pretest
            </span>
          </div>
          {/* Video */}
          <div className="flex items-center gap-1">
            <div
              className={`w-3 h-3 rounded-full ${
                videoDone
                  ? "bg-green-500"
                  : isDarkMode
                  ? "bg-slate-600"
                  : "bg-gray-300"
              }`}
            />
            <span
              className={`text-xs ${
                isDarkMode ? "text-slate-500" : "text-gray-400"
              }`}
            >
              Video
            </span>
          </div>
          {/* Posttest */}
          <div className="flex items-center gap-1">
            <div
              className={`w-3 h-3 rounded-full ${
                posttestDone
                  ? "bg-green-500"
                  : progress?.posttestCompleted
                  ? "bg-red-500"
                  : isDarkMode
                  ? "bg-slate-600"
                  : "bg-gray-300"
              }`}
            />
            <span
              className={`text-xs ${
                isDarkMode ? "text-slate-500" : "text-gray-400"
              }`}
            >
              Posttest
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span
          className={`text-xs ${
            isDarkMode ? "text-slate-500" : "text-gray-400"
          }`}
        >
          {isLocked ? "🔒 ล็อค" : `Chapter ${index + 1}`}
        </span>
        {!isLocked && (
          <FaPlay className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  );
};

export default ChapterCard;
