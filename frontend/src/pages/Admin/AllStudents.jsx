import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useFetchAllStudentsQuery,
  useDeleteStudentMutation,
} from "../../redux/features/admin/adminApi";
import {
  FaUserGraduate,
  FaEnvelope,
  FaPhone,
  FaSchool,
  FaSpinner,
  FaExclamationTriangle,
  FaPlus,
  FaKey,
  FaUser,
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const AllStudents = () => {
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const { data, isLoading, isError, error } = useFetchAllStudentsQuery();
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [showPasswords, setShowPasswords] = useState({});
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    student: null,
  });

  const togglePassword = (id) =>
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleDelete = async () => {
    if (!deleteModal.student) return;
    try {
      await deleteStudent(deleteModal.student._id).unwrap();
      toast.error(`ลบนักเรียน ${deleteModal.student.firstName} สำเร็จ!`, {
        icon: "🗑️",
      });
      setDeleteModal({ show: false, student: null });
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
          style={{ color: colors.secondary }}
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

  const students = data?.students || [];
  const filteredStudents = students.filter(
    (s) =>
      s.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.classRoom?.toLowerCase().includes(searchTerm.toLowerCase())
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
                onClick={() => setDeleteModal({ show: false, student: null })}
                style={{ color: colors.textSecondary }}
              >
                <FaTimes />
              </button>
            </div>
            <p style={{ color: colors.textSecondary }} className="mb-6">
              ลบนักเรียน{" "}
              <span className="font-semibold" style={{ color: colors.text }}>
                {deleteModal.student?.firstName} {deleteModal.student?.lastName}
              </span>
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, student: null })}
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
              style={{ backgroundColor: colors.secondary }}
            >
              <FaUserGraduate className="text-xl text-[#FFF6E0]" />
            </div>
            รายชื่อนักเรียน
          </h1>
          <p className="mt-2" style={{ color: colors.textSecondary }}>
            จำนวน {students.length} คน
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
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 w-64 rounded-xl"
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                color: colors.text,
              }}
            />
          </div>
          <Link
            to="/admin/add-student"
            className="flex items-center gap-2 px-5 py-3 font-bold rounded-xl"
            style={{ backgroundColor: colors.secondary, color: "#FFF6E0" }}
          >
            <FaPlus /> เพิ่มนักเรียน
          </Link>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl shadow-sm overflow-hidden"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}30`,
        }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: colors.secondary }}>
              {[
                "#",
                "นักเรียน",
                "ข้อมูลเข้าสู่ระบบ",
                "ห้องเรียน",
                "ติดต่อ",
                "จัดการ",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-left text-sm font-semibold text-[#FFF6E0]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center"
                  style={{ color: colors.textSecondary }}
                >
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, i) => (
                <tr
                  key={student._id}
                  className="border-b transition-colors hover:opacity-80"
                  style={{ borderColor: `${colors.border}30` }}
                >
                  <td
                    className="px-6 py-4 text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {i + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${colors.secondary}, #D8D9DA)`,
                          color: colors.primary,
                        }}
                      >
                        {student.firstName?.charAt(0) || "S"}
                      </div>
                      <div>
                        <p
                          className="font-semibold"
                          style={{ color: colors.text }}
                        >
                          {student.firstName} {student.lastName}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          @{student.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="rounded-lg p-2 inline-block text-xs"
                      style={{
                        backgroundColor: isDarkMode
                          ? colors.background
                          : "#F5F6F7",
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FaUser style={{ color: colors.textSecondary }} />
                        <code style={{ color: colors.text }}>
                          {student.username}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaKey style={{ color: colors.textSecondary }} />
                        <code style={{ color: colors.text }}>
                          {showPasswords[student._id]
                            ? student.password || "***"
                            : "••••••••"}
                        </code>
                        <button
                          onClick={() => togglePassword(student._id)}
                          style={{ color: colors.textSecondary }}
                        >
                          {showPasswords[student._id] ? (
                            <FaEyeSlash />
                          ) : (
                            <FaEye />
                          )}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor: colors.primary,
                        color: "#FFF6E0",
                      }}
                    >
                      <FaSchool className="text-xs" />
                      {student.classRoom || "-"}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {student.email && (
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-xs" />
                        {student.email}
                      </div>
                    )}
                    {student.phone && (
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-xs" />
                        {student.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/edit-student/${student._id}`)
                        }
                        className="p-2 rounded-lg"
                        style={{ color: colors.textSecondary }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ show: true, student })}
                        className="p-2 rounded-lg hover:text-red-500"
                        style={{ color: colors.textSecondary }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllStudents;
