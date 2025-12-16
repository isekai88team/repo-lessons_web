import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useFetchAllTeachersQuery,
  useDeleteTeacherMutation,
} from "../../redux/features/admin/adminApi";
import {
  FaChalkboardTeacher,
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
import {
  TableSkeleton,
  CardListSkeleton,
} from "../../components/Admin/SkeletonLoader";
import Pagination from "../../components/Admin/Pagination";

const AllTeachers = () => {
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const { data, isLoading, isError, error } = useFetchAllTeachersQuery();
  const [deleteTeacher, { isLoading: isDeleting }] = useDeleteTeacherMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [showPasswords, setShowPasswords] = useState({});
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    teacher: null,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const togglePassword = (id) =>
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleDelete = async () => {
    if (!deleteModal.teacher) return;
    try {
      await deleteTeacher(deleteModal.teacher._id).unwrap();
      toast.error(`ลบครู ${deleteModal.teacher.firstName} สำเร็จ!`, {
        icon: "🗑️",
      });
      setDeleteModal({ show: false, teacher: null });
    } catch (err) {
      toast.error(err?.data?.message || "ลบไม่สำเร็จ");
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen p-4 md:p-6 lg:p-10 font-sans transition-colors"
        style={{
          backgroundColor: isDarkMode
            ? colors.background
            : `${colors.background}50`,
        }}
      >
        {/* Header skeleton */}
        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl animate-pulse"
              style={{ backgroundColor: `${colors.border}50` }}
            />
            <div
              className="h-8 w-48 rounded animate-pulse"
              style={{ backgroundColor: `${colors.border}50` }}
            />
          </div>
        </div>

        {/* Desktop skeleton */}
        <div className="hidden md:block">
          <TableSkeleton rows={8} columns={6} />
        </div>

        {/* Mobile skeleton */}
        <div className="md:hidden">
          <CardListSkeleton count={5} />
        </div>
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

  const teachers = data?.teachers || [];
  const filteredTeachers = teachers.filter(
    (t) =>
      t.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalItems = filteredTeachers.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (count) => {
    setItemsPerPage(count);
    setCurrentPage(1);
  };

  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-10 font-sans transition-colors"
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
                onClick={() => setDeleteModal({ show: false, teacher: null })}
                style={{ color: colors.textSecondary }}
              >
                <FaTimes />
              </button>
            </div>
            <p style={{ color: colors.textSecondary }} className="mb-6">
              ลบครู{" "}
              <span className="font-semibold" style={{ color: colors.text }}>
                {deleteModal.teacher?.firstName} {deleteModal.teacher?.lastName}
              </span>
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, teacher: null })}
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
      <div className="flex flex-col gap-4 mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1
            className="text-2xl md:text-3xl font-bold flex items-center gap-3"
            style={{ color: colors.text }}
          >
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <FaChalkboardTeacher className="text-xl text-[#FFF6E0]" />
            </div>
            รายชื่อครู
          </h1>
          <p className="mt-2" style={{ color: colors.textSecondary }}>
            จำนวน {teachers.length} คน
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <FaSearch
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: colors.textSecondary }}
            />
            <input
              type="text"
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-11 pr-4 py-3 w-full sm:w-64 rounded-xl text-sm"
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                color: colors.text,
              }}
            />
          </div>
          <Link
            to="/admin/add-teacher"
            className="flex items-center justify-center gap-2 px-5 py-3 font-bold rounded-xl text-sm"
            style={{ backgroundColor: colors.primary, color: "#FFF6E0" }}
          >
            <FaPlus /> <span className="hidden sm:inline">เพิ่มครู</span>
            <span className="sm:hidden">เพิ่ม</span>
          </Link>
        </div>
      </div>

      {/* Mobile: Card Layout */}
      <div className="block md:hidden space-y-3">
        {filteredTeachers.length === 0 ? (
          <div
            className="text-center py-12 rounded-xl"
            style={{
              backgroundColor: colors.cardBg,
              color: colors.textSecondary,
            }}
          >
            ไม่พบข้อมูล
          </div>
        ) : (
          paginatedTeachers.map((teacher, i) => (
            <div
              key={teacher._id}
              className="rounded-xl p-4"
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}30`,
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                    color: "#FFF6E0",
                  }}
                >
                  {teacher.firstName?.charAt(0) || "T"}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold truncate"
                    style={{ color: colors.text }}
                  >
                    {teacher.firstName} {teacher.lastName}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: colors.textSecondary }}
                  >
                    @{teacher.username}
                  </p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                {/* Login */}
                <div
                  className="rounded-lg p-2"
                  style={{
                    backgroundColor: isDarkMode ? colors.background : "#F5F6F7",
                  }}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <FaUser
                      className="text-[10px]"
                      style={{ color: colors.textSecondary }}
                    />
                    <span style={{ color: colors.text }}>
                      {teacher.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaKey
                      className="text-[10px]"
                      style={{ color: colors.textSecondary }}
                    />
                    <span style={{ color: colors.text }}>
                      {showPasswords[teacher._id]
                        ? teacher.password || "***"
                        : "••••••"}
                    </span>
                    <button
                      onClick={() => togglePassword(teacher._id)}
                      style={{ color: colors.textSecondary }}
                    >
                      {showPasswords[teacher._id] ? (
                        <FaEyeSlash className="text-[10px]" />
                      ) : (
                        <FaEye className="text-[10px]" />
                      )}
                    </button>
                  </div>
                </div>
                {/* Contact */}
                <div
                  className="rounded-lg p-2"
                  style={{
                    backgroundColor: isDarkMode ? colors.background : "#F5F6F7",
                    color: colors.textSecondary,
                  }}
                >
                  {teacher.email && (
                    <div className="flex items-center gap-1 truncate mb-1">
                      <FaEnvelope className="text-[10px] flex-shrink-0" />
                      <span className="truncate">{teacher.email}</span>
                    </div>
                  )}
                  {teacher.phone && (
                    <div className="flex items-center gap-1">
                      <FaPhone className="text-[10px]" />
                      {teacher.phone}
                    </div>
                  )}
                  {!teacher.email && !teacher.phone && "-"}
                </div>
              </div>

              {/* Subjects & Rooms */}
              <div className="flex flex-wrap gap-1 mb-3">
                {teacher.subjects?.slice(0, 2).map((s, j) => (
                  <span
                    key={j}
                    className="px-2 py-0.5 rounded text-[10px]"
                    style={{
                      backgroundColor: `${colors.primary}20`,
                      color: colors.text,
                    }}
                  >
                    {s}
                  </span>
                ))}
                {teacher.classRoom?.slice(0, 2).map((r, j) => (
                  <span
                    key={j}
                    className="px-2 py-0.5 rounded text-[10px]"
                    style={{
                      backgroundColor: `${colors.secondary}20`,
                      color: colors.textSecondary,
                    }}
                  >
                    <FaSchool className="inline text-[8px] mr-1" />
                    {r}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div
                className="flex items-center justify-end gap-2 pt-2 border-t"
                style={{ borderColor: `${colors.border}30` }}
              >
                <button
                  onClick={() => navigate(`/admin/edit-teacher/${teacher._id}`)}
                  className="p-2 rounded-lg cursor-pointer"
                  style={{ color: colors.textSecondary }}
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => setDeleteModal({ show: true, teacher })}
                  className="p-2 rounded-lg hover:text-red-500 cursor-pointer"
                  style={{ color: colors.textSecondary }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: Table */}
      <div
        className="hidden md:block rounded-2xl shadow-sm overflow-x-auto"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}30`,
        }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: colors.primary }}>
              {[
                "#",
                "ครูผู้สอน",
                "ข้อมูลเข้าสู่ระบบ",
                "วิชา",
                "ห้อง",
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
            {filteredTeachers.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center"
                  style={{ color: colors.textSecondary }}
                >
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : (
              paginatedTeachers.map((teacher, i) => (
                <tr
                  key={teacher._id}
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
                          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                          color: "#FFF6E0",
                        }}
                      >
                        {teacher.firstName?.charAt(0) || "T"}
                      </div>
                      <div>
                        <p
                          className="font-semibold"
                          style={{ color: colors.text }}
                        >
                          {teacher.firstName} {teacher.lastName}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          @{teacher.username}
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
                          {teacher.username}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaKey style={{ color: colors.textSecondary }} />
                        <code style={{ color: colors.text }}>
                          {showPasswords[teacher._id]
                            ? teacher.password || "***"
                            : "••••••••"}
                        </code>
                        <button
                          onClick={() => togglePassword(teacher._id)}
                          style={{ color: colors.textSecondary }}
                        >
                          {showPasswords[teacher._id] ? (
                            <FaEyeSlash />
                          ) : (
                            <FaEye />
                          )}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects?.slice(0, 2).map((s, j) => (
                        <span
                          key={j}
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            backgroundColor: `${colors.primary}20`,
                            color: colors.text,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.classRoom?.slice(0, 2).map((r, j) => (
                        <span
                          key={j}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                          style={{
                            backgroundColor: `${colors.secondary}20`,
                            color: colors.textSecondary,
                          }}
                        >
                          <FaSchool className="text-[10px]" />
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {teacher.email && (
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-xs" />
                        {teacher.email}
                      </div>
                    )}
                    {teacher.phone && (
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-xs" />
                        {teacher.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/edit-teacher/${teacher._id}`)
                        }
                        className="p-2 rounded-lg"
                        style={{ color: colors.textSecondary }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ show: true, teacher })}
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

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default AllTeachers;
