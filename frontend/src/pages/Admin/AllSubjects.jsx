import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useFetchAllSubjectsQuery,
  useDeleteSubjectMutation,
} from "../../redux/features/admin/adminApi";
import {
  FaBook,
  FaSpinner,
  FaExclamationTriangle,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaEye,
  FaChalkboardTeacher,
  FaCode,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const AllSubjects = () => {
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const { data, isLoading, isError, error } = useFetchAllSubjectsQuery();
  const [deleteSubject, { isLoading: isDeleting }] = useDeleteSubjectMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    subject: null,
  });

  const handleDelete = async () => {
    if (!deleteModal.subject) return;
    try {
      await deleteSubject(deleteModal.subject._id).unwrap();
      toast.error(`ลบรายวิชา ${deleteModal.subject.subject_name} สำเร็จ!`, {
        icon: "🗑️",
      });
      setDeleteModal({ show: false, subject: null });
    } catch (err) {
      toast.error(err?.data?.message || "ลบไม่สำเร็จ");
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: colors.background }}
      >
        <FaSpinner
          className="animate-spin text-5xl"
          style={{ color: colors.text }}
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
        <FaExclamationTriangle className="text-5xl mb-4" />
        <p>{error?.data?.message || "ไม่สามารถโหลดข้อมูลได้"}</p>
      </div>
    );
  }

  const subjects = data?.subjects || [];
  const filteredSubjects = subjects.filter(
    (s) =>
      s.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="min-h-screen p-6 lg:p-10 font-sans transition-colors"
      style={{
        backgroundColor: isDarkMode
          ? colors.background
          : `${colors.background}50`,
      }}
    >
      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div
            className="rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: colors.text }}>
                ยืนยันการลบ
              </h3>
              <button
                onClick={() => setDeleteModal({ show: false, subject: null })}
                style={{ color: colors.textSecondary }}
              >
                <FaTimes />
              </button>
            </div>
            <p style={{ color: colors.textSecondary }} className="mb-2">
              ลบรายวิชา{" "}
              <span className="font-semibold" style={{ color: colors.text }}>
                {deleteModal.subject?.subject_name}
              </span>
              ?
            </p>
            <p className="text-sm text-red-400 mb-6">
              ⚠️ การลบจะลบบทเรียนและวิดีโอทั้งหมดด้วย
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, subject: null })}
                className="flex-1 py-2 px-4 rounded-xl"
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.textSecondary,
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaTrash />
                )}{" "}
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-3xl font-bold flex items-center gap-3"
            style={{ color: colors.text }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#8B5CF6" }}
            >
              <FaBook className="text-xl text-white" />
            </div>
            รายวิชาทั้งหมด
          </h1>
          <p className="mt-2" style={{ color: colors.textSecondary }}>
            จำนวน {subjects.length} รายวิชา
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: colors.textSecondary }}
            />
            <input
              type="text"
              placeholder="ค้นหารายวิชา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 w-64 rounded-xl focus:outline-none"
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                color: colors.text,
              }}
            />
          </div>
          <Link
            to="/admin/add-subject"
            className="flex items-center gap-2 px-5 py-3 font-bold rounded-xl"
            style={{ backgroundColor: "#8B5CF6", color: "#FFF" }}
          >
            <FaPlus /> เพิ่มรายวิชา
          </Link>
        </div>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.length === 0 ? (
          <div
            className="col-span-full py-12 text-center"
            style={{ color: colors.textSecondary }}
          >
            <FaBook className="text-5xl mx-auto mb-3 opacity-20" />
            <p>ไม่พบรายวิชา</p>
          </div>
        ) : (
          filteredSubjects.map((subject) => (
            <div
              key={subject._id}
              className="rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}30`,
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#8B5CF620" }}
                >
                  <FaBook className="text-xl" style={{ color: "#8B5CF6" }} />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => navigate(`/admin/subject/${subject._id}`)}
                    className="p-2 rounded-lg transition-colors hover:bg-purple-500/20"
                    style={{ color: isDarkMode ? "#A78BFA" : "#7C3AED" }}
                    title="ดูรายละเอียด"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/admin/edit-subject/${subject._id}`)
                    }
                    className="p-2 rounded-lg transition-colors hover:bg-blue-500/20"
                    style={{ color: isDarkMode ? "#60A5FA" : "#3B82F6" }}
                    title="แก้ไข"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ show: true, subject })}
                    className="p-2 rounded-lg transition-colors hover:bg-red-500/20"
                    style={{ color: isDarkMode ? "#F87171" : "#EF4444" }}
                    title="ลบ"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* Content */}
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: colors.text }}
              >
                {subject.subject_name}
              </h3>

              <div className="flex items-center gap-2 mb-3">
                <FaCode style={{ color: colors.textSecondary }} />
                <span
                  className="text-sm font-mono"
                  style={{ color: colors.textSecondary }}
                >
                  {subject.code}
                </span>
              </div>

              {subject.description && (
                <p
                  className="text-sm mb-4 line-clamp-2"
                  style={{ color: colors.textSecondary }}
                >
                  {subject.description}
                </p>
              )}

              {/* Teacher */}
              {subject.teacher && (
                <div
                  className="flex items-center gap-2 pt-4 border-t"
                  style={{ borderColor: `${colors.border}30` }}
                >
                  <FaChalkboardTeacher style={{ color: colors.primary }} />
                  <span className="text-sm" style={{ color: colors.text }}>
                    {subject.teacher.firstName} {subject.teacher.lastName}
                  </span>
                </div>
              )}

              {/* View Button */}
              <button
                onClick={() => navigate(`/admin/subject/${subject._id}`)}
                className="w-full mt-4 py-2.5 rounded-xl font-semibold transition-all hover:opacity-90"
                style={{
                  backgroundColor: "#8B5CF6",
                  color: "#FFFFFF",
                }}
              >
                ดูบทเรียน →
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllSubjects;
