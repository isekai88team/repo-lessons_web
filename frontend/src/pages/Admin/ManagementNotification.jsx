import React, { useState } from "react";
import { FaBell, FaPlus, FaTrash, FaEdit, FaSpinner } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import {
  useFetchNotificationsQuery,
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
} from "../../redux/features/admin/adminApi";
import toast from "react-hot-toast";
import {
  TableSkeleton,
  CardListSkeleton,
} from "../../components/Admin/SkeletonLoader";

const ManagementNotification = () => {
  const { isDarkMode, colors } = useTheme();

  // Queries & Mutations
  const { data: notifications = [], isLoading } = useFetchNotificationsQuery();
  const [createNotification] = useCreateNotificationMutation();
  const [updateNotification] = useUpdateNotificationMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    isActive: true,
  });

  // Handlers
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormData({ title: "", message: "", type: "info", isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (notification) => {
    setIsEditMode(true);
    setEditId(notification._id);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isActive: notification.isActive,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("คุณต้องการลบการแจ้งเตือนนี้ใช่หรือไม่?")) {
      try {
        await deleteNotification(id).unwrap();
        toast.success("ลบการแจ้งเตือนสำเร็จ");
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการลบ");
      }
    }
  };

  const handleToggleActive = async (notification) => {
    try {
      await updateNotification({
        id: notification._id,
        isActive: !notification.isActive,
      }).unwrap();
      toast.success(
        `เปลี่ยนสถานะเป็น ${!notification.isActive ? "ใช้งาน" : "ปิดใช้งาน"}`
      );
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateNotification({ id: editId, ...formData }).unwrap();
        toast.success("แก้ไขการแจ้งเตือนสำเร็จ");
      } else {
        await createNotification(formData).unwrap();
        toast.success("สร้างการแจ้งเตือนสำเร็จ");
      }
      handleCloseModal();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="p-6 min-h-screen transition-colors duration-300 font-sans"
      style={{
        backgroundColor: isDarkMode ? colors.background : "#F5F6F7",
        color: isDarkMode ? colors.text : "#1F2937",
      }}
    >
      <div className="max-w-7xl mx-auto">
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
                <FaBell className="text-xl text-[#FFF6E0]" />
              </div>
              จัดการการแจ้งเตือน
            </h1>
            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 px-5 py-3 font-bold rounded-xl text-sm cursor-pointer shadow-md transition-all hover:opacity-90"
              style={{ backgroundColor: colors.primary, color: "#FFF6E0" }}
            >
              <FaPlus />
              <span className="hidden sm:inline">สร้างการแจ้งเตือน</span>
              <span className="sm:hidden">สร้าง</span>
            </button>
          </div>
        </div>

        {/* List */}
        {/* List Notification */}
        <div className="rounded-2xl shadow-lg overflow-hidden transition-colors duration-300 bg-transparent shadow-none">
          {isLoading ? (
            <>
              {/* Desktop Skeleton */}
              <div className="hidden md:block">
                <TableSkeleton rows={5} columns={6} />
              </div>
              {/* Mobile Skeleton */}
              <div className="md:hidden">
                <CardListSkeleton count={4} />
              </div>
            </>
          ) : (
            <>
              <div
                className="hidden md:block rounded-2xl shadow-lg overflow-hidden"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.border}30`,
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr style={{ backgroundColor: colors.primary }}>
                        <th className="p-3 md:p-4 font-semibold text-[#FFF6E0]">
                          หัวข้อ
                        </th>
                        <th className="p-3 md:p-4 font-semibold text-[#FFF6E0]">
                          ข้อความ
                        </th>
                        <th className="p-3 md:p-4 font-semibold text-[#FFF6E0]">
                          ประเภท
                        </th>
                        <th className="p-3 md:p-4 font-semibold text-[#FFF6E0] hidden sm:table-cell">
                          วันที่สร้าง
                        </th>
                        <th className="p-3 md:p-4 font-semibold text-[#FFF6E0] text-center">
                          สถานะ
                        </th>
                        <th className="p-3 md:p-4 font-semibold text-[#FFF6E0] text-center">
                          จัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.map((item) => (
                        <tr
                          key={item._id}
                          className="transition-colors border-b"
                          style={{ borderColor: `${colors.border}30` }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = `${colors.hover}50`)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <td
                            className="p-3 md:p-4 font-medium"
                            style={{ color: colors.text }}
                          >
                            {item.title}
                          </td>
                          <td
                            className="p-3 md:p-4 text-sm max-w-xs truncate"
                            style={{ color: colors.textSecondary }}
                          >
                            {item.message}
                          </td>
                          <td className="p-3 md:p-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                item.type === "warning"
                                  ? "bg-red-100 text-red-800"
                                  : item.type === "success"
                                  ? "bg-green-100 text-green-800"
                                  : item.type === "error"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {item.type.toUpperCase()}
                            </span>
                          </td>
                          <td
                            className="p-3 md:p-4 text-sm hidden sm:table-cell"
                            style={{ color: colors.textSecondary }}
                          >
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="p-3 md:p-4 text-center">
                            <button
                              onClick={() => handleToggleActive(item)}
                              className="px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer"
                              style={{
                                backgroundColor: item.isActive
                                  ? isDarkMode
                                    ? "rgba(34,197,94,0.2)"
                                    : "#dcfce7"
                                  : isDarkMode
                                  ? `${colors.border}50`
                                  : "#e5e7eb",
                                color: item.isActive
                                  ? isDarkMode
                                    ? "#4ade80"
                                    : "#15803d"
                                  : colors.textSecondary,
                              }}
                            >
                              {item.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
                            </button>
                          </td>
                          <td className="p-3 md:p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-2 rounded cursor-pointer transition-colors"
                                style={{
                                  backgroundColor: isDarkMode
                                    ? `${colors.border}50`
                                    : "#f3f4f6",
                                  color: colors.textSecondary,
                                }}
                                title="แก้ไข"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="p-2 rounded cursor-pointer transition-colors"
                                style={{
                                  backgroundColor: isDarkMode
                                    ? "rgba(239,68,68,0.2)"
                                    : "#fee2e2",
                                  color: isDarkMode ? "#f87171" : "#dc2626",
                                }}
                                title="ลบ"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {notifications.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="p-12 text-center"
                            style={{ color: colors.textSecondary }}
                          >
                            ไม่มีการแจ้งเตือน
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile View (Cards) */}
              <div className="md:hidden space-y-4">
                {notifications.map((item) => (
                  <div
                    key={item._id}
                    className="p-5 rounded-xl shadow-sm transition-all"
                    style={{
                      backgroundColor: colors.cardBg,
                      border: `1px solid ${colors.border}30`,
                    }}
                  >
                    <div className="mb-4">
                      <div
                        className="text-xs font-bold uppercase tracking-wider mb-1"
                        style={{ color: colors.textSecondary }}
                      >
                        หัวข้อ
                      </div>
                      <div
                        className="font-bold text-lg"
                        style={{ color: colors.text }}
                      >
                        {item.title}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div
                        className="text-xs font-bold uppercase tracking-wider mb-2"
                        style={{ color: colors.textSecondary }}
                      >
                        ข้อความ
                      </div>
                      <div
                        className="p-3 rounded-lg text-sm leading-relaxed"
                        style={{
                          backgroundColor: isDarkMode
                            ? `${colors.border}30`
                            : "#f5f6f7",
                          color: colors.text,
                        }}
                      >
                        {item.message}
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div
                        className="flex justify-between items-center pb-2 border-b"
                        style={{ borderColor: `${colors.border}30` }}
                      >
                        <span style={{ color: colors.textSecondary }}>
                          ประเภท
                        </span>
                        <span
                          className="px-2 py-1 rounded text-xs font-bold"
                          style={{
                            backgroundColor:
                              item.type === "warning" || item.type === "error"
                                ? isDarkMode
                                  ? "rgba(239,68,68,0.2)"
                                  : "#fee2e2"
                                : item.type === "success"
                                ? isDarkMode
                                  ? "rgba(34,197,94,0.2)"
                                  : "#dcfce7"
                                : isDarkMode
                                ? "rgba(59,130,246,0.2)"
                                : "#dbeafe",
                            color:
                              item.type === "warning" || item.type === "error"
                                ? isDarkMode
                                  ? "#f87171"
                                  : "#dc2626"
                                : item.type === "success"
                                ? isDarkMode
                                  ? "#4ade80"
                                  : "#15803d"
                                : isDarkMode
                                ? "#60a5fa"
                                : "#1e40af",
                          }}
                        >
                          {item.type.toUpperCase()}
                        </span>
                      </div>

                      <div
                        className="flex justify-between items-center pb-2 border-b"
                        style={{ borderColor: `${colors.border}30` }}
                      >
                        <span style={{ color: colors.textSecondary }}>
                          วันที่สร้าง
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: colors.text }}
                        >
                          {formatDate(item.createdAt)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span style={{ color: colors.textSecondary }}>
                          สถานะ
                        </span>
                        <button
                          onClick={() => handleToggleActive(item)}
                          className="px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer"
                          style={{
                            backgroundColor: item.isActive
                              ? isDarkMode
                                ? "rgba(34,197,94,0.2)"
                                : "#dcfce7"
                              : isDarkMode
                              ? `${colors.border}50`
                              : "#e5e7eb",
                            color: item.isActive
                              ? isDarkMode
                                ? "#4ade80"
                                : "#15803d"
                              : colors.textSecondary,
                          }}
                        >
                          {item.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                        style={{
                          backgroundColor: isDarkMode
                            ? `${colors.border}50`
                            : "#f3f4f6",
                          color: colors.text,
                        }}
                      >
                        <FaEdit /> แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                        style={{
                          backgroundColor: isDarkMode
                            ? "rgba(239,68,68,0.2)"
                            : "#fee2e2",
                          color: isDarkMode ? "#f87171" : "#dc2626",
                        }}
                      >
                        <FaTrash /> ลบ
                      </button>
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div
                    className="text-center p-8 rounded-lg"
                    style={{
                      backgroundColor: colors.cardBg,
                      color: colors.textSecondary,
                    }}
                  >
                    ไม่มีการแจ้งเตือน
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className="rounded-2xl shadow-2xl w-full max-w-md p-6 transition-all"
              style={{
                backgroundColor: colors.cardBg,
                color: colors.text,
                border: `1px solid ${colors.border}30`,
              }}
            >
              <h2 className="text-xl font-bold mb-4">
                {isEditMode ? "แก้ไขการแจ้งเตือน" : "สร้างการแจ้งเตือนใหม่"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    หัวข้อ
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    style={{
                      backgroundColor: isDarkMode
                        ? colors.background
                        : "#f5f6f7",
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ข้อความ
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    style={{
                      backgroundColor: isDarkMode
                        ? colors.background
                        : "#f5f6f7",
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ประเภท
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    style={{
                      backgroundColor: isDarkMode
                        ? colors.background
                        : "#f5f6f7",
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                  >
                    <option value="info">Info (ข่าวสารทั่วไป)</option>
                    <option value="warning">Warning (แจ้งเตือนสำคัญ)</option>
                    <option value="success">Success (เรื่องน่ายินดี)</option>
                    <option value="error">Error (แจ้งปัญหา)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm">
                    เปิดใช้งานทันที
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium rounded-xl cursor-pointer transition-colors"
                    style={{
                      backgroundColor: isDarkMode
                        ? `${colors.border}50`
                        : "#f3f4f6",
                      color: colors.textSecondary,
                    }}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-bold rounded-lg cursor-pointer transition-all hover:opacity-90"
                    style={{
                      backgroundColor: colors.primary,
                      color: "#FFF6E0",
                    }}
                  >
                    บันทึก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagementNotification;
