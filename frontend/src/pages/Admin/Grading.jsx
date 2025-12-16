import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaSpinner,
  FaFileAlt,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import {
  useFetchAllWorksheetsQuery,
  useFetchSubmissionsByWorksheetQuery,
  useUpdateSubmissionStatusMutation,
} from "../../redux/features/admin/adminApi";
import toast from "react-hot-toast";
import CustomSelect from "../../components/Admin/CustomSelect";

const Grading = () => {
  const { isDarkMode, colors } = useTheme();
  const [selectedWorksheet, setSelectedWorksheet] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterRoom, setFilterRoom] = useState("all");

  // Fetch Worksheets
  const { data: worksheetsData, isLoading: isLoadingWorksheets } =
    useFetchAllWorksheetsQuery();

  // Fetch Submissions (Skip if no worksheet selected)
  const {
    data: submissionsData,
    isLoading: isLoadingSubmissions,
    refetch,
  } = useFetchSubmissionsByWorksheetQuery(selectedWorksheet, {
    skip: !selectedWorksheet,
  });

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateSubmissionStatusMutation();

  // Parse classroom into grade and room (e.g., "ม.4/1" -> grade: "ม.4", room: "1")
  const parseClassroom = (classroom) => {
    if (!classroom) return { grade: "", room: "" };
    const match = classroom.match(/^(ม\.\d+)\/(\d+)$/);
    if (match) {
      return { grade: match[1], room: match[2] };
    }
    return { grade: classroom, room: "" };
  };

  // Get unique grades and rooms
  const allClassrooms = (submissionsData?.submissions || [])
    .map((sub) => sub.student?.classRoom)
    .filter(Boolean);

  const uniqueGrades = [
    ...new Set(allClassrooms.map((c) => parseClassroom(c).grade)),
  ].sort();
  const uniqueRooms = [
    ...new Set(
      allClassrooms.map((c) => parseClassroom(c).room).filter(Boolean)
    ),
  ].sort((a, b) => Number(a) - Number(b));

  // Filter submissions by grade and room
  const filteredSubmissions = (submissionsData?.submissions || []).filter(
    (sub) => {
      const { grade, room } = parseClassroom(sub.student?.classRoom);
      const gradeMatch = filterGrade === "all" || grade === filterGrade;
      const roomMatch = filterRoom === "all" || room === filterRoom;
      return gradeMatch && roomMatch;
    }
  );

  const displaySubmissions = filteredSubmissions;

  const handleStatusUpdate = async (id, status) => {
    try {
      const result = await updateStatus({ id, status }).unwrap();
      if (status === "approved") {
        toast.success("✅ อนุมัติงานเรียบร้อย!");
      } else if (status === "rejected") {
        toast.error("❌ ไม่อนุมัติงาน");
      } else {
        toast.success("อัปเดตสถานะเสร็จสิ้น");
      }
      refetch();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปเดต");
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

  const getStatusBadge = (status) => {
    const badgeStyles = {
      approved: {
        backgroundColor: isDarkMode ? "rgba(34,197,94,0.2)" : "#dcfce7",
        color: isDarkMode ? "#4ade80" : "#166534",
      },
      rejected: {
        backgroundColor: isDarkMode ? "rgba(239,68,68,0.2)" : "#fee2e2",
        color: isDarkMode ? "#f87171" : "#991b1b",
      },
      late: {
        backgroundColor: isDarkMode ? "rgba(234,179,8,0.2)" : "#fef9c3",
        color: isDarkMode ? "#facc15" : "#854d0e",
      },
      default: {
        backgroundColor: isDarkMode ? "rgba(59,130,246,0.2)" : "#dbeafe",
        color: isDarkMode ? "#60a5fa" : "#1e40af",
      },
    };

    const labels = {
      approved: "ผ่าน",
      rejected: "ไม่ผ่าน",
      late: "ส่งช้า",
      default: "รอตรวจ",
    };

    const style = badgeStyles[status] || badgeStyles.default;
    const label = labels[status] || labels.default;

    return (
      <span className="px-2 py-1 rounded text-xs font-bold" style={style}>
        {label}
      </span>
    );
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
          <h1
            className="text-2xl md:text-3xl font-bold flex items-center gap-3"
            style={{ color: colors.text }}
          >
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <FaFileAlt className="text-xl text-[#FFF6E0]" />
            </div>
            ตรวจใบงาน
          </h1>
        </div>

        {/* Filters */}
        <div
          className="p-6 rounded-2xl shadow-sm mb-6 transition-colors duration-300"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}30`,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 opacity-80">
                เลือกใบงานที่ต้องการตรวจ
              </label>
              <CustomSelect
                value={selectedWorksheet}
                onChange={setSelectedWorksheet}
                options={[
                  { value: "", label: "-- กรุณาเลือกใบงาน --" },
                  ...(worksheetsData?.worksheets?.map((ws) => ({
                    value: ws._id,
                    label: `${ws.title} (${
                      ws.chapter?.chapter_name || "General"
                    })`,
                  })) || []),
                ]}
                placeholder="-- กรุณาเลือกใบงาน --"
              />
            </div>
            {/* Grade Filter */}
            {selectedWorksheet && uniqueGrades.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 opacity-80">
                  กรองตามชั้น
                </label>
                <CustomSelect
                  value={filterGrade}
                  onChange={setFilterGrade}
                  options={[
                    { value: "all", label: "-- ทุกชั้น --" },
                    ...uniqueGrades.map((grade) => ({
                      value: grade,
                      label: grade,
                    })),
                  ]}
                  placeholder="-- ทุกชั้น --"
                />
              </div>
            )}
            {/* Room Filter */}
            {selectedWorksheet && uniqueRooms.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 opacity-80">
                  กรองตามห้อง
                </label>
                <CustomSelect
                  value={filterRoom}
                  onChange={setFilterRoom}
                  options={[
                    { value: "all", label: "-- ทุกห้อง --" },
                    ...uniqueRooms.map((room) => ({
                      value: room,
                      label: `ห้อง ${room}`,
                    })),
                  ]}
                  placeholder="-- ทุกห้อง --"
                />
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        {selectedWorksheet && !isLoadingSubmissions && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Total */}
            <div
              className="p-4 rounded-xl shadow-sm transition-colors duration-300"
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}30`,
              }}
            >
              <p className="text-xs opacity-60 mb-1">ทั้งหมด</p>
              <p className="text-2xl font-bold" style={{ color: colors.text }}>
                {displaySubmissions.length}
              </p>
            </div>

            {/* Pending */}
            <div
              className="p-4 rounded-xl shadow-sm transition-colors duration-300"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(59,130,246,0.15)"
                  : "#dbeafe",
                border: `1px solid ${
                  isDarkMode ? "rgba(59,130,246,0.3)" : "#93c5fd"
                }`,
              }}
            >
              <p className="text-xs opacity-60 mb-1">รอตรวจ</p>
              <p
                className="text-2xl font-bold"
                style={{ color: isDarkMode ? "#60a5fa" : "#2563eb" }}
              >
                {
                  displaySubmissions.filter((s) => s.status === "submitted")
                    .length
                }
              </p>
            </div>

            {/* Approved */}
            <div
              className="p-4 rounded-xl shadow-sm transition-colors duration-300"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(34,197,94,0.15)"
                  : "#dcfce7",
                border: `1px solid ${
                  isDarkMode ? "rgba(34,197,94,0.3)" : "#86efac"
                }`,
              }}
            >
              <p className="text-xs opacity-60 mb-1">ผ่าน</p>
              <p
                className="text-2xl font-bold"
                style={{ color: isDarkMode ? "#4ade80" : "#16a34a" }}
              >
                {
                  displaySubmissions.filter((s) => s.status === "approved")
                    .length
                }
              </p>
            </div>

            {/* Rejected */}
            <div
              className="p-4 rounded-xl shadow-sm transition-colors duration-300"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(239,68,68,0.15)"
                  : "#fee2e2",
                border: `1px solid ${
                  isDarkMode ? "rgba(239,68,68,0.3)" : "#fca5a5"
                }`,
              }}
            >
              <p className="text-xs opacity-60 mb-1">ไม่ผ่าน</p>
              <p
                className="text-2xl font-bold"
                style={{ color: isDarkMode ? "#f87171" : "#dc2626" }}
              >
                {
                  displaySubmissions.filter((s) => s.status === "rejected")
                    .length
                }
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {selectedWorksheet ? (
          <div
            className="rounded-2xl shadow-lg overflow-hidden transition-colors duration-300"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.border}30`,
            }}
          >
            {isLoadingSubmissions ? (
              <div className="p-12 text-center">
                <FaSpinner
                  className="animate-spin text-4xl mx-auto mb-4"
                  style={{ color: colors.primary }}
                />
                <p style={{ color: colors.textSecondary }}>
                  กำลังโหลดข้อมูล...
                </p>
              </div>
            ) : displaySubmissions.length === 0 ? (
              <div
                className="p-12 text-center"
                style={{ color: colors.textSecondary }}
              >
                <FaFileAlt className="text-4xl mx-auto mb-4 opacity-60" />
                <p>ยังไม่มีการส่งงานในหัวข้อนี้</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr style={{ backgroundColor: colors.primary }}>
                        <th className="p-4 font-semibold text-[#FFF6E0]">
                          กลุ่มที่
                        </th>
                        <th className="p-4 font-semibold text-[#FFF6E0]">
                          ชื่อสมาชิก
                        </th>
                        <th className="p-4 font-semibold text-[#FFF6E0]">
                          ไฟล์งาน
                        </th>
                        <th className="p-4 font-semibold text-[#FFF6E0]">
                          วันที่ส่งงาน
                        </th>
                        <th className="p-4 font-semibold text-[#FFF6E0]">
                          สถานะ
                        </th>
                        <th className="p-4 font-semibold text-[#FFF6E0] text-center">
                          การดำเนินการ
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ borderColor: `${colors.border}30` }}>
                      {displaySubmissions.map((sub, index) => {
                        const currentClass = sub.student?.classRoom || "-";
                        const prevClass =
                          index > 0
                            ? displaySubmissions[index - 1].student
                                ?.classRoom || "-"
                            : null;
                        const showClass = currentClass !== prevClass;

                        return (
                          <tr
                            key={sub._id}
                            className="transition-colors border-b"
                            style={{
                              borderColor: `${colors.border}30`,
                              backgroundColor:
                                index % 2 === 0
                                  ? "transparent"
                                  : isDarkMode
                                  ? "rgba(255,255,255,0.02)"
                                  : "rgba(0,0,0,0.02)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = `${colors.hover}50`)
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                index % 2 === 0
                                  ? "transparent"
                                  : isDarkMode
                                  ? "rgba(255,255,255,0.02)"
                                  : "rgba(0,0,0,0.02)")
                            }
                          >
                            <td className="p-4 align-top font-bold opacity-90">
                              {index + 1}
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1">
                                {/* Main Student */}
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                                    style={{
                                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                                      color: "#FFF6E0",
                                    }}
                                  >
                                    {sub.student?.profileImage ? (
                                      <img
                                        src={sub.student.profileImage}
                                        alt="avatar"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-xs font-bold">
                                        {sub.student?.firstName?.charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <p
                                      className="font-medium"
                                      style={{ color: colors.text }}
                                    >
                                      {sub.student?.firstName}{" "}
                                      {sub.student?.lastName}
                                    </p>
                                  </div>
                                </div>
                                {/* Team Members */}
                                {sub.teamMembers &&
                                  sub.teamMembers.length > 0 && (
                                    <div className="ml-11 flex flex-col gap-1 mt-1">
                                      {sub.teamMembers.map((member, idx) => (
                                        <span
                                          key={member._id || idx}
                                          className="text-xs px-2 py-0.5 rounded-full w-fit"
                                          style={{
                                            backgroundColor: isDarkMode
                                              ? "rgba(59,130,246,0.2)"
                                              : "#dbeafe",
                                            color: isDarkMode
                                              ? "#93c5fd"
                                              : "#1e40af",
                                          }}
                                        >
                                          {member.firstName
                                            ? `${member.firstName} ${
                                                member.lastName || ""
                                              }`
                                            : `สมาชิก ${idx + 1}`}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            </td>
                            <td className="p-4">
                              {sub.fileUrl ? (
                                <a
                                  href={sub.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2 underline transition-colors"
                                  style={{
                                    color: isDarkMode ? "#60a5fa" : "#3b82f6",
                                  }}
                                >
                                  <FaFileAlt />
                                  <span className="truncate max-w-[150px]">
                                    {sub.fileName || "View File"}
                                  </span>
                                </a>
                              ) : (
                                <span
                                  style={{ color: colors.textSecondary }}
                                  className="text-sm"
                                >
                                  -
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-sm opacity-80">
                              {sub.submittedAt
                                ? formatDate(sub.submittedAt)
                                : "-"}
                            </td>
                            <td className="p-4">
                              {getStatusBadge(sub.status)}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(sub._id, "approved")
                                  }
                                  disabled={
                                    sub.status === "approved" || isUpdating
                                  }
                                  className="p-2 rounded-lg transition-all cursor-pointer"
                                  style={{
                                    backgroundColor:
                                      sub.status === "approved"
                                        ? "#22c55e"
                                        : isDarkMode
                                        ? `${colors.border}50`
                                        : "#f3f4f6",
                                    color:
                                      sub.status === "approved"
                                        ? "#fff"
                                        : colors.textSecondary,
                                    opacity:
                                      sub.status === "approved" ? 0.6 : 1,
                                    cursor:
                                      sub.status === "approved"
                                        ? "not-allowed"
                                        : "pointer",
                                  }}
                                  title="ให้ผ่าน"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(sub._id, "rejected")
                                  }
                                  disabled={
                                    sub.status === "rejected" || isUpdating
                                  }
                                  className="p-2 rounded-lg transition-all cursor-pointer"
                                  style={{
                                    backgroundColor:
                                      sub.status === "rejected"
                                        ? "#ef4444"
                                        : isDarkMode
                                        ? `${colors.border}50`
                                        : "#f3f4f6",
                                    color:
                                      sub.status === "rejected"
                                        ? "#fff"
                                        : colors.textSecondary,
                                    opacity:
                                      sub.status === "rejected" ? 0.6 : 1,
                                    cursor:
                                      sub.status === "rejected"
                                        ? "not-allowed"
                                        : "pointer",
                                  }}
                                  title="ไม่ผ่าน"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                  {displaySubmissions.map((sub, index) => (
                    <div
                      key={sub._id}
                      className="rounded-xl overflow-hidden"
                      style={{
                        backgroundColor: isDarkMode ? colors.cardBg : "#fff",
                        border: `2px solid ${colors.primary}`,
                      }}
                    >
                      {/* Card Content */}
                      <div className="p-4 space-y-4">
                        {/* Group Info */}
                        <div className="flex items-center gap-3">
                          <span
                            className="text-sm font-medium"
                            style={{ color: colors.textSecondary }}
                          >
                            กลุ่มที่
                          </span>
                          <span
                            className="font-bold"
                            style={{ color: colors.text }}
                          >
                            {index + 1}
                          </span>
                        </div>

                        {/* Members Section */}
                        <div>
                          <p
                            className="text-sm font-medium mb-2"
                            style={{ color: colors.textSecondary }}
                          >
                            ชื่อสมาชิก
                          </p>
                          <div
                            className="rounded-lg p-3 space-y-1"
                            style={{
                              backgroundColor: isDarkMode
                                ? "rgba(255,255,255,0.08)"
                                : "#e5e7eb",
                            }}
                          >
                            {/* Main submitter */}
                            <p
                              className="text-sm"
                              style={{ color: colors.text }}
                            >
                              คนที่ 1 : {sub.student?.firstName}{" "}
                              {sub.student?.lastName}
                            </p>
                            {/* Team Members */}
                            {sub.teamMembers &&
                              sub.teamMembers.map((member, idx) => (
                                <p
                                  key={member._id || idx}
                                  className="text-sm"
                                  style={{ color: colors.text }}
                                >
                                  คนที่ {idx + 2} :{" "}
                                  {member.firstName
                                    ? `${member.firstName} ${
                                        member.lastName || ""
                                      }`
                                    : `สมาชิก ${idx + 2}`}
                                </p>
                              ))}
                          </div>
                        </div>

                        {/* File Section */}
                        <div className="flex items-center gap-3">
                          <span
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            ไฟล์
                          </span>
                          {sub.fileUrl ? (
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium underline truncate flex-1"
                              style={{
                                color: isDarkMode ? "#93c5fd" : "#3b82f6",
                              }}
                            >
                              {sub.fileName || "ดูไฟล์"}
                            </a>
                          ) : (
                            <span
                              className="text-sm"
                              style={{ color: colors.textSecondary }}
                            >
                              -
                            </span>
                          )}
                        </div>

                        {/* Date Section */}
                        <div className="flex items-center gap-3">
                          <span
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            วันที่ส่งงาน
                          </span>
                          <span
                            className="text-sm font-medium"
                            style={{ color: colors.text }}
                          >
                            {sub.submittedAt
                              ? new Date(sub.submittedAt).toLocaleDateString(
                                  "th-TH",
                                  {
                                    day: "numeric",
                                    month: "numeric",
                                    year: "numeric",
                                  }
                                )
                              : "-"}
                          </span>
                        </div>

                        {/* Status Section */}
                        <div className="flex items-center gap-3">
                          <span
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            สถานะ
                          </span>
                          {getStatusBadge(sub.status)}
                        </div>

                        {/* Actions Section */}
                        <div className="flex items-center gap-3">
                          <span
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            การดำเนินการ
                          </span>
                          <div className="flex gap-2 flex-1">
                            <button
                              onClick={() =>
                                handleStatusUpdate(sub._id, "approved")
                              }
                              disabled={sub.status === "approved" || isUpdating}
                              className="flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all cursor-pointer"
                              style={{
                                backgroundColor:
                                  sub.status === "approved"
                                    ? "#22c55e"
                                    : "#dcfce7",
                                color:
                                  sub.status === "approved"
                                    ? "#fff"
                                    : "#166534",
                                opacity: sub.status === "approved" ? 0.6 : 1,
                              }}
                            >
                              ผ่าน
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(sub._id, "rejected")
                              }
                              disabled={sub.status === "rejected" || isUpdating}
                              className="flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all cursor-pointer"
                              style={{
                                backgroundColor:
                                  sub.status === "rejected"
                                    ? "#ef4444"
                                    : "#fee2e2",
                                color:
                                  sub.status === "rejected"
                                    ? "#fff"
                                    : "#991b1b",
                                opacity: sub.status === "rejected" ? 0.6 : 1,
                              }}
                            >
                              ไม่ผ่าน
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed transition-colors"
            style={{
              borderColor: `${colors.border}50`,
              backgroundColor: colors.cardBg,
            }}
          >
            <FaSearch
              className="text-4xl mb-4"
              style={{ color: colors.textSecondary, opacity: 0.5 }}
            />
            <p
              className="text-lg font-medium"
              style={{ color: colors.textSecondary }}
            >
              กรุณาเลือกใบงานเพื่อเริ่มตรวจงาน
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Grading;
