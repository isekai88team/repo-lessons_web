import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaClipboardList,
  FaSpinner,
  FaPlus,
  FaEdit,
  FaBook,
  FaSearch,
  FaQuestionCircle,
  FaCog,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useFetchAllPretestsQuery } from "../../redux/features/admin/adminApi";

const QuizBank = () => {
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const { data: pretestsData, isLoading } = useFetchAllPretestsQuery();

  const [searchTerm, setSearchTerm] = useState("");

  const pretests = pretestsData?.pretests || [];

  // Filter pretests by search term
  const filteredPretests = pretests.filter(
    (pretest) =>
      pretest.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pretest.chapter?.chapter_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: colors.background }}
      >
        <FaSpinner
          className="animate-spin text-5xl"
          style={{ color: "#8B5CF6" }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6 lg:p-10 font-sans transition-colors"
      style={{
        backgroundColor: isDarkMode
          ? colors.background
          : `${colors.background}50`,
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#8B5CF620" }}
          >
            <FaClipboardList className="text-xl" style={{ color: "#8B5CF6" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              จัดการแบบทดสอบ
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              เพิ่ม ลบ แก้ไข แบบทดสอบก่อนเรียน (Pretest) ทั้งหมด
            </p>
          </div>
        </div>
      </div>

      {/* Search & Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <FaSearch
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: colors.textSecondary }}
          />
          <input
            type="text"
            placeholder="ค้นหาแบบทดสอบ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition"
            style={{
              backgroundColor: colors.cardBg,
              color: colors.text,
              border: `1px solid ${colors.border}30`,
            }}
          />
        </div>
        {pretests.length < 6 && (
          <Link
            to="/admin/add-pretest"
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium whitespace-nowrap"
            style={{ backgroundColor: "#8B5CF6", color: "#FFF" }}
          >
            <FaPlus /> เพิ่มแบบทดสอบ
          </Link>
        )}
      </div>

      {/* Pretests List */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}30`,
        }}
      >
        <div
          className="p-6 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${colors.border}30` }}
        >
          <div className="flex items-center gap-3">
            <FaClipboardList style={{ color: "#8B5CF6" }} />
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>
              แบบทดสอบทั้งหมด
            </h2>
            <span
              className="text-sm px-3 py-1 rounded-lg"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(139,92,246,0.2)"
                  : "#8B5CF620",
                color: "#8B5CF6",
              }}
            >
              {pretests.length}/6 บท
            </span>
          </div>
        </div>

        {filteredPretests.length === 0 ? (
          <div
            className="p-12 text-center"
            style={{ color: colors.textSecondary }}
          >
            <FaClipboardList className="text-5xl mx-auto mb-3 opacity-20" />
            <p>{searchTerm ? "ไม่พบแบบทดสอบที่ค้นหา" : "ยังไม่มีแบบทดสอบ"}</p>
            {!searchTerm && (
              <Link
                to="/admin/add-pretest"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl"
                style={{
                  backgroundColor: `${colors.primary}20`,
                  color: colors.primary,
                }}
              >
                <FaPlus /> เพิ่มแบบทดสอบแรก
              </Link>
            )}
          </div>
        ) : (
          <div
            className="divide-y"
            style={{ borderColor: `${colors.border}30` }}
          >
            {filteredPretests.map((pretest, index) => (
              <div
                key={pretest._id}
                className="p-4 hover:bg-gray-500/5 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  {/* Number + Title */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{
                        backgroundColor: `${colors.primary}20`,
                        color: colors.primary,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-semibold text-sm sm:text-base truncate"
                        style={{ color: colors.text }}
                      >
                        {pretest.title}
                      </h3>
                      <div
                        className="flex flex-wrap gap-2 text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        <span className="flex items-center gap-1">
                          <FaBook className="text-[10px]" />
                          {pretest.chapter?.chapter_name || "ไม่ระบุบท"}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaQuestionCircle className="text-[10px]" />
                          {pretest.questions?.length || 0} ข้อ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 pl-11 sm:pl-0">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        pretest.isActive
                          ? "bg-green-500/20 text-green-500"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {pretest.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pl-11 sm:pl-0">
                    <button
                      onClick={() =>
                        navigate(`/admin/edit-pretest/${pretest._id}`)
                      }
                      className="flex items-center gap-1 px-3 py-2 rounded-lg transition-colors hover:bg-blue-500/20"
                      style={{ color: isDarkMode ? "#60A5FA" : "#3B82F6" }}
                      title="จัดการคำถาม"
                    >
                      <FaEdit />
                      <span className="text-xs font-medium hidden sm:inline">
                        จัดการคำถาม
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/admin/posttest-settings/${pretest._id}`)
                      }
                      className="flex items-center gap-1 px-3 py-2 rounded-lg transition-colors hover:bg-amber-500/20"
                      style={{ color: isDarkMode ? "#FCD34D" : "#F59E0B" }}
                      title="ตั้งค่า Posttest"
                    >
                      <FaCog />
                      <span className="text-xs font-medium hidden sm:inline">
                        ตั้งค่า Posttest
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizBank;
