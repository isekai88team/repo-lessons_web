import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaFileAlt,
  FaSpinner,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaEye,
  FaBook,
  FaSearch,
  FaImage,
  FaFilePdf,
  FaFileWord,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import {
  useFetchAllWorksheetsQuery,
  useDeleteWorksheetMutation,
} from "../../redux/features/admin/adminApi";

const AllWorksheets = () => {
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const {
    data: worksheetsData,
    isLoading,
    refetch,
  } = useFetchAllWorksheetsQuery();
  const [deleteWorksheet, { isLoading: isDeleting }] =
    useDeleteWorksheetMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    worksheet: null,
  });

  const worksheets = worksheetsData?.worksheets || [];

  // Filter worksheets by search term
  const filteredWorksheets = worksheets.filter(
    (worksheet) =>
      worksheet.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worksheet.chapter?.chapter_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleDeleteWorksheet = async () => {
    if (!deleteModal.worksheet) return;
    try {
      await deleteWorksheet(deleteModal.worksheet._id).unwrap();
      toast.success(`ลบใบงาน "${deleteModal.worksheet.title}" สำเร็จ!`);
      setDeleteModal({ show: false, worksheet: null });
      refetch();
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
          style={{ color: "#10B981" }}
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
                ยืนยันการลบใบงาน
              </h3>
              <button
                onClick={() => setDeleteModal({ show: false, worksheet: null })}
                style={{ color: colors.textSecondary }}
              >
                <FaTimes />
              </button>
            </div>
            <p style={{ color: colors.textSecondary }} className="mb-2">
              ลบใบงาน{" "}
              <span className="font-semibold" style={{ color: colors.text }}>
                "{deleteModal.worksheet?.title}"
              </span>
              ?
            </p>
            <p className="text-sm text-red-400 mb-6">
              ⚠️ รูปภาพและเอกสารที่แนบจะถูกลบถาวร
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, worksheet: null })}
                className="flex-1 py-2 px-4 rounded-xl"
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.textSecondary,
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteWorksheet}
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
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#10B98120" }}
          >
            <FaFileAlt className="text-xl" style={{ color: "#10B981" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              จัดการใบงาน
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              เพิ่ม ลบ แก้ไข ใบงานทั้งหมด (รูปภาพ / เอกสาร PDF/DOC)
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
            placeholder="ค้นหาใบงาน..."
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
        <Link
          to="/admin/add-worksheet"
          className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium whitespace-nowrap"
          style={{ backgroundColor: "#10B981", color: "#FFF" }}
        >
          <FaPlus /> เพิ่มใบงาน
        </Link>
      </div>

      {/* Worksheets List */}
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
            <FaFileAlt style={{ color: "#10B981" }} />
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>
              ใบงานทั้งหมด
            </h2>
            <span
              className="text-sm px-3 py-1 rounded-lg"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(16,185,129,0.2)"
                  : "#10B98120",
                color: "#10B981",
              }}
            >
              {worksheets.length} ใบงาน
            </span>
          </div>
        </div>

        {filteredWorksheets.length === 0 ? (
          <div
            className="p-12 text-center"
            style={{ color: colors.textSecondary }}
          >
            <FaFileAlt className="text-5xl mx-auto mb-3 opacity-20" />
            <p>{searchTerm ? "ไม่พบใบงานที่ค้นหา" : "ยังไม่มีใบงาน"}</p>
            {!searchTerm && (
              <Link
                to="/admin/add-worksheet"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl"
                style={{
                  backgroundColor: "#10B98120",
                  color: "#10B981",
                }}
              >
                <FaPlus /> เพิ่มใบงานแรก
              </Link>
            )}
          </div>
        ) : (
          <div
            className="divide-y"
            style={{ borderColor: `${colors.border}30` }}
          >
            {filteredWorksheets.map((worksheet, index) => (
              <div
                key={worksheet._id}
                className="p-4 hover:bg-gray-500/5 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  {/* Number + Title */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{
                        backgroundColor: "#10B98120",
                        color: "#10B981",
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-semibold text-sm sm:text-base truncate"
                        style={{ color: colors.text }}
                      >
                        {worksheet.title}
                      </h3>
                      <div
                        className="flex flex-wrap gap-2 text-xs mt-1"
                        style={{ color: colors.textSecondary }}
                      >
                        {worksheet.images?.length > 0 && (
                          <span className="flex items-center gap-1 text-blue-500">
                            <FaImage className="text-[10px]" />
                            {worksheet.images.length} รูป
                          </span>
                        )}
                        {worksheet.document && (
                          <span className="flex items-center gap-1 text-orange-500">
                            {worksheet.document.fileType === "pdf" ? (
                              <FaFilePdf className="text-[10px]" />
                            ) : (
                              <FaFileWord className="text-[10px]" />
                            )}
                            {worksheet.document.fileType?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      {worksheet.description && (
                        <p
                          className="text-xs mt-1 truncate"
                          style={{ color: colors.textSecondary }}
                        >
                          {worksheet.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 pl-11 sm:pl-0">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        worksheet.isActive
                          ? "bg-green-500/20 text-green-500"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {worksheet.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pl-11 sm:pl-0">
                    <button
                      onClick={() =>
                        navigate(`/admin/edit-worksheet/${worksheet._id}`)
                      }
                      className="flex items-center gap-1 px-3 py-2 rounded-lg transition-colors hover:bg-blue-500/20"
                      style={{ color: isDarkMode ? "#60A5FA" : "#3B82F6" }}
                      title="แก้ไข"
                    >
                      <FaEdit />
                      <span className="text-xs font-medium hidden sm:inline">
                        แก้ไข
                      </span>
                    </button>
                    <button
                      onClick={() => setDeleteModal({ show: true, worksheet })}
                      className="p-2 rounded-lg transition-colors hover:bg-red-500/20"
                      style={{ color: isDarkMode ? "#F87171" : "#EF4444" }}
                      title="ลบ"
                    >
                      <FaTrash />
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

export default AllWorksheets;
