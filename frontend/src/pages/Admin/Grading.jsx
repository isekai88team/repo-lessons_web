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

const Grading = () => {
  const { isDarkMode, colors } = useTheme();
  const [selectedWorksheet, setSelectedWorksheet] = useState("");
  const [filterClass, setFilterClass] = useState("all");

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

  // Mock Data if no submissions (For visual testing as per user request context)
  const mockSubmissions = [
    // กลุ่มที่ 1
    {
      _id: "mock1",
      student: {
        firstName: "สมชาย",
        lastName: "ใจดี",
        classRoom: "กลุ่มที่ 1",
      },
      fileUrl: "#",
      fileName: "lab1_somchai.pdf",
      submittedAt: new Date().toISOString(),
      status: "submitted",
    },
    {
      _id: "mock2",
      student: {
        firstName: "กานดา",
        lastName: "มีสุข",
        classRoom: "กลุ่มที่ 1",
      },
      fileUrl: null,
      fileName: null,
      submittedAt: null,
      status: "approved",
    },
    {
      _id: "mock3",
      student: {
        firstName: "อาทิตย์",
        lastName: "สดใส",
        classRoom: "กลุ่มที่ 1",
      },
      fileUrl: null,
      fileName: null,
      submittedAt: null,
      status: "rejected",
    },

    // กลุ่มที่ 2
    {
      _id: "mock4",
      student: {
        firstName: "มานี",
        lastName: "รักเรียน",
        classRoom: "กลุ่มที่ 2",
      },
      fileUrl: "#",
      fileName: "worksheet_manee.pdf",
      submittedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      status: "submitted",
    },
    {
      _id: "mock5",
      student: {
        firstName: "ปิติ",
        lastName: "พึ่งพา",
        classRoom: "กลุ่มที่ 2",
      },
      fileUrl: null,
      fileName: null,
      submittedAt: null,
      status: "submitted",
    },

    // กลุ่มที่ 3
    {
      _id: "mock6",
      student: {
        firstName: "ชูใจ",
        lastName: "เก่งกล้า",
        classRoom: "กลุ่มที่ 3",
      },
      fileUrl: "#",
      fileName: "assign_chujai.pdf",
      submittedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      status: "approved",
    },
    {
      _id: "mock7",
      student: { firstName: "วีระ", lastName: "มานะ", classRoom: "กลุ่มที่ 3" },
      fileUrl: null,
      fileName: null,
      submittedAt: null,
      status: "late",
    },

    // กลุ่มที่ 4
    {
      _id: "mock8",
      student: { firstName: "แก้ว", lastName: "ตา", classRoom: "กลุ่มที่ 4" },
      fileUrl: "#",
      fileName: "project_keaw.zip",
      submittedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      status: "rejected",
    },
    {
      _id: "mock9",
      student: { firstName: "ขวัญ", lastName: "ใจ", classRoom: "กลุ่มที่ 4" },
      fileUrl: null,
      fileName: null,
      submittedAt: null,
      status: "submitted",
    },
    {
      _id: "mock10",
      student: { firstName: "เพชร", lastName: "กล้า", classRoom: "กลุ่มที่ 4" },
      fileUrl: null,
      fileName: null,
      submittedAt: null,
      status: "submitted",
    },
  ];

  const displaySubmissions =
    submissionsData?.submissions?.length > 0
      ? submissionsData.submissions
      : selectedWorksheet // Show mock only if a worksheet is selected but no data found (for demo)
      ? mockSubmissions
      : [];

  const handleStatusUpdate = async (id, status) => {
    if (id.startsWith("mock")) {
      toast.success(`Mock update: ${status}`);
      return;
    }
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success("อัปเดตสถานะเสร็จสิ้น");
      refetch();
    } catch (error) {
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
    switch (status) {
      case "approved":
        return (
          <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800">
            ผ่าน
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-800">
            ไม่ผ่าน
          </span>
        );
      case "late":
        return (
          <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-800">
            ส่งช้า
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-800">
            รอตรวจ
          </span>
        );
    }
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
        <h1 className="text-2xl font-bold mb-6">ตรวจใบงาน</h1>

        {/* Filters */}
        <div
          className="p-6 rounded-2xl shadow-sm mb-6 transition-colors duration-300"
          style={{
            backgroundColor: isDarkMode ? "#272829" : "#FFFFFF",
            border: `1px solid ${
              isDarkMode ? "rgba(97,103,122,0.3)" : "#E5E7EB"
            }`,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 opacity-80">
                เลือกใบงานที่ต้องการตรวจ
              </label>
              <select
                value={selectedWorksheet}
                onChange={(e) => setSelectedWorksheet(e.target.value)}
                className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                style={{
                  backgroundColor: isDarkMode ? "#3A3B3C" : "#F9FAFB",
                  borderColor: isDarkMode
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
                  color: isDarkMode ? "#FFF" : "#000",
                }}
              >
                <option value="">-- กรุณาเลือกใบงาน --</option>
                {worksheetsData?.worksheets?.map((ws) => (
                  <option key={ws._id} value={ws._id}>
                    {ws.title} ({ws.chapter?.chapter_name || "General"})
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Class Filter - Mock implementation */}
            {/* <div>
              <label className="block text-sm font-medium mb-2 opacity-80">
                กรองตามห้อง
              </label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                style={{
                   backgroundColor: isDarkMode ? "#3A3B3C" : "#F9FAFB",
                   borderColor: isDarkMode
                     ? "rgba(255,255,255,0.1)"
                     : "rgba(0,0,0,0.1)",
                   color: isDarkMode ? "#FFF" : "#000",
                }}
              >
                <option value="all">ทั้งหมด</option>
                <option value="M.4/1">M.4/1</option>
                <option value="M.4/2">M.4/2</option>
              </select>
            </div> */}
          </div>
        </div>

        {/* Content */}
        {selectedWorksheet ? (
          <div
            className="rounded-2xl shadow-lg overflow-hidden transition-colors duration-300"
            style={{
              backgroundColor: isDarkMode ? "#272829" : "#FFFFFF",
            }}
          >
            {isLoadingSubmissions ? (
              <div className="p-12 text-center">
                <FaSpinner className="animate-spin text-4xl mx-auto mb-4 text-blue-500" />
                <p>กำลังโหลดข้อมูล...</p>
              </div>
            ) : displaySubmissions.length === 0 ? (
              <div className="p-12 text-center opacity-60">
                <FaFileAlt className="text-4xl mx-auto mb-4" />
                <p>ยังไม่มีการส่งงานในหัวข้อนี้</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: isDarkMode ? "#3A3B3C" : "#F3F4F6",
                        color: isDarkMode ? "#D1D5DB" : "#4B5563",
                      }}
                    >
                      <th className="p-4 font-semibold">กลุ่มที่</th>
                      <th className="p-4 font-semibold">ชื่อสมาชิก</th>
                      <th className="p-4 font-semibold">ไฟล์งาน</th>
                      <th className="p-4 font-semibold">วันที่ส่งงาน</th>
                      <th className="p-4 font-semibold">สถานะ</th>
                      <th className="p-4 font-semibold text-center">
                        การดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {displaySubmissions.map((sub, index) => {
                      const currentClass = sub.student?.classRoom || "-";
                      const prevClass =
                        index > 0
                          ? displaySubmissions[index - 1].student?.classRoom ||
                            "-"
                          : null;
                      const showClass = currentClass !== prevClass;

                      return (
                        <tr
                          key={sub._id}
                          className={`transition-colors hover:bg-opacity-50 ${
                            isDarkMode
                              ? "hover:bg-gray-700"
                              : "hover:bg-gray-50"
                          }`}
                          style={{
                            backgroundColor:
                              index % 2 === 0
                                ? "transparent"
                                : isDarkMode
                                ? "rgba(255,255,255,0.02)"
                                : "rgba(0,0,0,0.02)",
                          }}
                        >
                          <td className="p-4 align-top font-bold opacity-90">
                            {showClass ? currentClass : ""}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
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
                                <p className="font-medium">
                                  {sub.student?.firstName}{" "}
                                  {sub.student?.lastName}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            {sub.fileUrl ? (
                              <a
                                href={sub.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-blue-500 hover:text-blue-400 underline"
                              >
                                <FaFileAlt />
                                <span className="truncate max-w-[150px]">
                                  {sub.fileName || "View File"}
                                </span>
                              </a>
                            ) : (
                              <span className="text-gray-400 opacity-50 text-sm">
                                -
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-sm opacity-80">
                            {sub.submittedAt
                              ? formatDate(sub.submittedAt)
                              : "-"}
                          </td>
                          <td className="p-4">{getStatusBadge(sub.status)}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  handleStatusUpdate(sub._id, "approved")
                                }
                                disabled={
                                  sub.status === "approved" || isUpdating
                                }
                                className={`p-2 rounded-lg transition-all ${
                                  sub.status === "approved"
                                    ? "bg-green-500 text-white opacity-50 cursor-not-allowed"
                                    : "bg-gray-200 text-gray-600 hover:bg-green-500 hover:text-white dark:bg-gray-700 dark:text-gray-300"
                                }`}
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
                                className={`p-2 rounded-lg transition-all ${
                                  sub.status === "rejected"
                                    ? "bg-red-500 text-white opacity-50 cursor-not-allowed"
                                    : "bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white dark:bg-gray-700 dark:text-gray-300"
                                }`}
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
            )}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed transition-colors"
            style={{
              borderColor: isDarkMode
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.1)",
              color: isDarkMode ? "gray" : "lightgray",
            }}
          >
            <FaSearch className="text-4xl mb-4 opacity-50" />
            <p className="text-lg font-medium opacity-70">
              กรุณาเลือกใบงานเพื่อเริ่มตรวจงาน
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Grading;
