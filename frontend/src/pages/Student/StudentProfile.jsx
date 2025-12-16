import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import th from "date-fns/locale/th";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaEdit,
  FaSave,
  FaTimes,
  FaLock,
  FaArrowLeft,
  FaSpinner,
  FaSchool,
  FaCrop,
  FaCheck,
  FaCalendarAlt,
  FaChartLine,
  FaBook,
  FaTrophy,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaPlay,
  FaGraduationCap,
} from "react-icons/fa";
import getBaseUrl from "../../untils/baseURL";
import { useTheme } from "../../context/ThemeContext";
import RevealOnScroll from "../../components/RevealOnScroll";

// Register Thai locale
registerLocale("th", th);

// ==================== CONSTANTS ====================
const PROFILE_FIELDS = [
  { key: "firstName", label: "ชื่อ", icon: FaUser, type: "text" },
  { key: "lastName", label: "นามสกุล", icon: FaUser, type: "text" },
  { key: "email", label: "อีเมล", icon: FaEnvelope, type: "email" },
  { key: "phone", label: "เบอร์โทร", icon: FaPhone, type: "tel" },
  { key: "dateOfBirth", label: "วันเกิด", icon: FaBirthdayCake, type: "date" },
];

const PASSWORD_FIELDS = [
  { key: "currentPassword", label: "รหัสผ่านปัจจุบัน" },
  { key: "newPassword", label: "รหัสผ่านใหม่" },
  { key: "confirmPassword", label: "ยืนยันรหัสผ่านใหม่" },
];

// ==================== SUB-COMPONENTS ====================

// Icon Box Component
const IconBox = ({ Icon, isDarkMode }) => (
  <div
    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
      isDarkMode ? "bg-blue-500/20" : "bg-blue-50"
    }`}
  >
    <Icon className="text-blue-500 text-sm" />
  </div>
);

// Profile Avatar Component
const ProfileAvatar = ({
  student,
  editForm,
  isEditing,
  isDarkMode,
  onImageSelect,
}) => {
  const displayImage = isEditing ? editForm.profileImage : student.profileImage;

  return (
    <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
        <div className="relative">
          <div
            className={`w-32 h-32 rounded-full border-4 overflow-hidden shadow-lg ${
              isDarkMode
                ? "border-slate-800 bg-slate-700"
                : "border-white bg-gray-200"
            }`}
          >
            {displayImage ? (
              <img
                src={displayImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {student.firstName?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {isEditing && (
            <label className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition">
              <FaCrop className="text-white text-sm" />
              <input
                type="file"
                accept="image/*"
                onChange={onImageSelect}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

// Profile Info Header Component
const ProfileInfoHeader = ({ student, isDarkMode }) => (
  <div className="pt-20 pb-4 px-6 text-center">
    <h2
      className={`text-xl font-bold ${
        isDarkMode ? "text-white" : "text-gray-800"
      }`}
    >
      {student.firstName} {student.lastName}
    </h2>
    <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
      @{student.username}
    </p>
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${
        isDarkMode
          ? "bg-blue-500/20 text-blue-400"
          : "bg-blue-100 text-blue-600"
      }`}
    >
      <FaSchool className="text-xs" />
      {student.classRoom}
    </span>
  </div>
);

// Edit Form Field Component
const EditFormField = ({ field, value, onChange, isDarkMode }) => {
  const { key, label, icon: Icon, type } = field;

  // For date field, use DatePicker
  if (type === "date") {
    const selectedDate = value ? new Date(value) : null;

    return (
      <div>
        <label
          className={`block text-xs mb-1 ${
            isDarkMode ? "text-slate-500" : "text-gray-400"
          }`}
        >
          {label}
        </label>
        <div className="flex items-center gap-3">
          <IconBox Icon={Icon} isDarkMode={isDarkMode} />
          <div className="flex-1 relative">
            <DatePicker
              selected={selectedDate}
              onChange={(date) =>
                onChange(key, date ? date.toISOString() : null)
              }
              dateFormat="d MMMM yyyy"
              locale="th"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              yearDropdownItemNumber={30}
              scrollableYearDropdown
              maxDate={new Date()}
              minDate={new Date(2000, 0, 1)}
              placeholderText="เลือกวันเกิด"
              className={`w-full p-2 border rounded-lg text-sm pr-10 cursor-pointer ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  : "bg-white border-gray-200 text-gray-800 placeholder-gray-400"
              }`}
              calendarClassName={
                isDarkMode ? "dark-calendar" : "light-calendar"
              }
              popperClassName="z-50"
              wrapperClassName="w-full"
            />
            <FaCalendarAlt
              className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                isDarkMode ? "text-slate-400" : "text-gray-400"
              }`}
            />
          </div>
        </div>
        {/* Custom Calendar Styles */}
        <style>{`
          /* Dark Mode Calendar */
          .dark-calendar {
            background: #1e293b !important;
            border: 1px solid #475569 !important;
            border-radius: 12px !important;
            font-family: inherit !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5) !important;
          }
          .dark-calendar .react-datepicker__header {
            background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
            border-bottom: none !important;
            border-radius: 12px 12px 0 0 !important;
            padding: 12px !important;
          }
          .dark-calendar .react-datepicker__current-month,
          .dark-calendar .react-datepicker__day-name {
            color: white !important;
            font-weight: 600 !important;
          }
          .dark-calendar .react-datepicker__day {
            color: #e2e8f0 !important;
            border-radius: 8px !important;
            margin: 2px !important;
            width: 2rem !important;
            height: 2rem !important;
            line-height: 2rem !important;
          }
          .dark-calendar .react-datepicker__day:hover {
            background: #3b82f6 !important;
            color: white !important;
          }
          .dark-calendar .react-datepicker__day--selected,
          .dark-calendar .react-datepicker__day--keyboard-selected {
            background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
            color: white !important;
            font-weight: bold !important;
          }
          .dark-calendar .react-datepicker__day--today {
            border: 2px solid #3b82f6 !important;
            font-weight: bold !important;
          }
          .dark-calendar .react-datepicker__day--outside-month {
            color: #64748b !important;
          }
          .dark-calendar .react-datepicker__navigation-icon::before {
            border-color: white !important;
          }
          .dark-calendar .react-datepicker__month-read-view,
          .dark-calendar .react-datepicker__year-read-view {
            color: white !important;
          }
          .dark-calendar .react-datepicker__month-read-view--down-arrow,
          .dark-calendar .react-datepicker__year-read-view--down-arrow {
            border-color: white !important;
          }
          
          /* DARK MODE DROPDOWN - Global CSS */
          .dark-calendar .react-datepicker__month-dropdown,
          .dark-calendar .react-datepicker__year-dropdown {
            background-color: #1e293b !important;
            border: 1px solid #475569 !important;
            border-radius: 8px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
          }
          .dark-calendar .react-datepicker__month-option,
          .dark-calendar .react-datepicker__year-option {
            background-color: #1e293b !important;
            color: #e2e8f0 !important;
            padding: 8px 16px !important;
            line-height: 1.5 !important;
          }
          .dark-calendar .react-datepicker__month-option:hover,
          .dark-calendar .react-datepicker__year-option:hover {
            background-color: #3b82f6 !important;
            color: white !important;
          }
          .dark-calendar .react-datepicker__month-option--selected_month,
          .dark-calendar .react-datepicker__year-option--selected_year {
            background-color: #3b82f6 !important;
            color: white !important;
          }
          .dark-calendar .react-datepicker__month-option--selected_month span,
          .dark-calendar .react-datepicker__year-option--selected_year span {
            display: none !important;
          }
          
          /* Light Mode Calendar */
          .light-calendar {
            background: white !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 12px !important;
            font-family: inherit !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important;
          }
          .light-calendar .react-datepicker__header {
            background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
            border-bottom: none !important;
            border-radius: 12px 12px 0 0 !important;
            padding: 12px !important;
          }
          .light-calendar .react-datepicker__current-month,
          .light-calendar .react-datepicker__day-name {
            color: white !important;
            font-weight: 600 !important;
          }
          .light-calendar .react-datepicker__day {
            color: #374151 !important;
            border-radius: 8px !important;
            margin: 2px !important;
            width: 2rem !important;
            height: 2rem !important;
            line-height: 2rem !important;
          }
          .light-calendar .react-datepicker__day:hover {
            background: #dbeafe !important;
            color: #1d4ed8 !important;
          }
          .light-calendar .react-datepicker__day--selected,
          .light-calendar .react-datepicker__day--keyboard-selected {
            background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
            color: white !important;
            font-weight: bold !important;
          }
          .light-calendar .react-datepicker__day--today {
            border: 2px solid #3b82f6 !important;
            font-weight: bold !important;
          }
          .light-calendar .react-datepicker__day--outside-month {
            color: #9ca3af !important;
          }
          .light-calendar .react-datepicker__navigation-icon::before {
            border-color: white !important;
          }
          .light-calendar .react-datepicker__month-read-view,
          .light-calendar .react-datepicker__year-read-view {
            color: white !important;
          }
          .light-calendar .react-datepicker__month-read-view--down-arrow,
          .light-calendar .react-datepicker__year-read-view--down-arrow {
            border-color: white !important;
          }
          
          /* LIGHT MODE DROPDOWN */
          .light-calendar .react-datepicker__month-dropdown,
          .light-calendar .react-datepicker__year-dropdown {
            background-color: white !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
          }
          .light-calendar .react-datepicker__month-option,
          .light-calendar .react-datepicker__year-option {
            background-color: white !important;
            color: #374151 !important;
            padding: 8px 16px !important;
            line-height: 1.5 !important;
          }
          .light-calendar .react-datepicker__month-option:hover,
          .light-calendar .react-datepicker__year-option:hover {
            background-color: #dbeafe !important;
            color: #1d4ed8 !important;
          }
          .light-calendar .react-datepicker__month-option--selected_month,
          .light-calendar .react-datepicker__year-option--selected_year {
            background-color: #3b82f6 !important;
            color: white !important;
          }
          
          /* Common */
          .react-datepicker-popper {
            z-index: 100 !important;
          }
          .react-datepicker__triangle {
            display: none !important;
          }
        `}</style>
      </div>
    );
  }

  // For other fields, use regular input
  return (
    <div>
      <label
        className={`block text-xs mb-1 ${
          isDarkMode ? "text-slate-500" : "text-gray-400"
        }`}
      >
        {label}
      </label>
      <div className="flex items-center gap-3">
        <IconBox Icon={Icon} isDarkMode={isDarkMode} />
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(key, e.target.value)}
          className={`flex-1 p-2 border rounded-lg text-sm ${
            isDarkMode
              ? "bg-slate-700 border-slate-600 text-white"
              : "bg-white border-gray-200 text-gray-800"
          }`}
        />
      </div>
    </div>
  );
};

// Info Display Item Component
const InfoDisplayItem = ({ field, student, isDarkMode }) => {
  const { key, label, icon: Icon, type } = field;

  const getDisplayValue = () => {
    const value = student[key];
    if (!value) return "-";
    if (type === "date") {
      return new Date(value).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return value;
  };

  return (
    <div className="flex items-center gap-3">
      <IconBox Icon={Icon} isDarkMode={isDarkMode} />
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs ${
            isDarkMode ? "text-slate-500" : "text-gray-400"
          }`}
        >
          {label}
        </p>
        <p
          className={`text-sm font-medium truncate ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          {getDisplayValue()}
        </p>
      </div>
    </div>
  );
};

// Profile Action Buttons Component
const ProfileActions = ({
  isEditing,
  saving,
  isDarkMode,
  onSave,
  onEdit,
  onCancel,
  onChangePassword,
  student,
  setEditForm,
}) => (
  <div className="p-6 pt-2 space-y-2">
    <button
      onClick={isEditing ? onSave : onEdit}
      disabled={saving}
      className="w-full py-2.5 px-4 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer"
    >
      {saving ? (
        <FaSpinner className="animate-spin" />
      ) : isEditing ? (
        <FaSave />
      ) : (
        <FaEdit />
      )}
      {isEditing ? "บันทึก" : "แก้ไขโปรไฟล์"}
    </button>

    {isEditing && (
      <button
        onClick={() => {
          setEditForm(student);
          onCancel();
        }}
        className={`w-full py-2.5 px-4 rounded-xl border font-medium flex items-center justify-center gap-2 transition cursor-pointer ${
          isDarkMode
            ? "border-slate-600 text-slate-300 hover:bg-slate-700"
            : "border-gray-300 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <FaTimes /> ยกเลิก
      </button>
    )}

    <button
      onClick={onChangePassword}
      className={`w-full py-2.5 px-4 rounded-xl border font-medium flex items-center justify-center gap-2 transition cursor-pointer ${
        isDarkMode
          ? "border-slate-600 text-slate-300 hover:bg-slate-700"
          : "border-gray-300 text-gray-600 hover:bg-gray-50"
      }`}
    >
      <FaLock /> เปลี่ยนรหัสผ่าน
    </button>
  </div>
);

// Image Crop Modal Component
const ImageCropModal = ({
  srcImage,
  crop,
  setCrop,
  setCompletedCrop,
  completedCrop,
  onClose,
  onConfirm,
  onImageLoad,
  isDarkMode,
}) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div
      className={`rounded-2xl w-full max-w-lg overflow-hidden ${
        isDarkMode ? "bg-slate-800" : "bg-white"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? "border-slate-700" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <FaCrop className="text-blue-500" />
          <h3
            className={`font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            ครอปรูปโปรไฟล์
          </h3>
        </div>
        <button
          onClick={onClose}
          className={`p-2 rounded-lg hover:bg-gray-500/20 cursor-pointer ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}
        >
          <FaTimes />
        </button>
      </div>

      {/* Crop Area */}
      <div className="p-4 flex justify-center bg-gray-900/50">
        <ReactCrop
          crop={crop}
          onChange={setCrop}
          onComplete={setCompletedCrop}
          aspect={1}
          circularCrop
          className="max-h-[50vh]"
        >
          <img
            src={srcImage}
            alt="Crop"
            onLoad={onImageLoad}
            className="max-h-[50vh] max-w-full"
            style={{ objectFit: "contain" }}
          />
        </ReactCrop>
      </div>

      {/* Actions */}
      <div
        className={`flex gap-3 p-4 border-t ${
          isDarkMode ? "border-slate-700" : "border-gray-200"
        }`}
      >
        <button
          onClick={onClose}
          className={`flex-1 py-3 px-4 rounded-xl border font-medium transition cursor-pointer ${
            isDarkMode
              ? "border-slate-600 text-slate-300 hover:bg-slate-700"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FaTimes className="inline mr-2" />
          ยกเลิก
        </button>
        <button
          onClick={onConfirm}
          disabled={!completedCrop}
          className="flex-1 py-3 px-4 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer"
        >
          <FaCheck />
          ใช้รูปนี้
        </button>
      </div>
    </div>
  </div>
);

// Password Modal Component
const PasswordModal = ({
  passwordForm,
  setPasswordForm,
  onSubmit,
  onClose,
  saving,
  isDarkMode,
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div
      className={`rounded-2xl w-full max-w-md p-6 ${
        isDarkMode ? "bg-slate-800" : "bg-white"
      }`}
    >
      <h3
        className={`text-xl font-bold mb-4 ${
          isDarkMode ? "text-white" : "text-gray-800"
        }`}
      >
        เปลี่ยนรหัสผ่าน
      </h3>
      <form onSubmit={onSubmit} className="space-y-4">
        {PASSWORD_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label
              className={`block text-sm mb-1 ${
                isDarkMode ? "text-slate-400" : "text-gray-600"
              }`}
            >
              {label}
            </label>
            <input
              type="password"
              value={passwordForm[key]}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, [key]: e.target.value }))
              }
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500/30 ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-white"
                  : "bg-white border-gray-200"
              }`}
              required
              minLength={key !== "currentPassword" ? 6 : undefined}
            />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 px-4 rounded-xl border font-medium cursor-pointer ${
              isDarkMode
                ? "border-slate-600 text-slate-300"
                : "border-gray-300 text-gray-600"
            }`}
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaLock />}
            เปลี่ยนรหัสผ่าน
          </button>
        </div>
      </form>
    </div>
  </div>
);

// Loading Component
const LoadingSpinner = ({ isDarkMode }) => (
  <div
    className={`min-h-screen flex items-center justify-center ${
      isDarkMode ? "bg-slate-900" : "bg-blue-50"
    }`}
  >
    <FaSpinner className="animate-spin text-5xl text-blue-500" />
  </div>
);

// No Profile Component
const NoProfileFound = ({ isDarkMode, onLogin }) => (
  <div
    className={`min-h-screen flex items-center justify-center ${
      isDarkMode ? "bg-slate-900" : "bg-blue-50"
    }`}
  >
    <div className="text-center">
      <p
        className={`text-xl mb-4 ${
          isDarkMode ? "text-white" : "text-gray-800"
        }`}
      >
        ไม่พบข้อมูลโปรไฟล์
      </p>
      <button
        onClick={onLogin}
        className="px-6 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition"
      >
        เข้าสู่ระบบ
      </button>
    </div>
  </div>
);

// ==================== LEARNING STATS COMPONENT ====================
const LearningStats = ({
  progressData,
  submissions,
  worksheets,
  isDarkMode,
  loading,
  navigate,
}) => {
  if (loading) {
    return (
      <div
        className={`rounded-2xl p-6 ${
          isDarkMode ? "bg-slate-800" : "bg-white"
        } shadow-lg`}
      >
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-3xl text-blue-500" />
        </div>
      </div>
    );
  }

  if (
    !progressData ||
    !progressData.subjects ||
    progressData.subjects.length === 0
  ) {
    return (
      <div
        className={`rounded-2xl p-6 ${
          isDarkMode ? "bg-slate-800" : "bg-white"
        } shadow-lg`}
      >
        <div className="flex items-center gap-3 mb-4">
          <FaChartLine className="text-xl text-blue-500" />
          <h3
            className={`text-lg font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            สถิติการเรียน
          </h3>
        </div>
        <p
          className={`text-center py-4 ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}
        >
          ยังไม่มีข้อมูลการเรียน
        </p>
      </div>
    );
  }

  // Calculate overall stats
  let totalPretests = 0,
    passedPretests = 0;
  let totalPosttests = 0,
    passedPosttests = 0;
  let totalFinals = 0,
    passedFinals = 0;
  // Calculate worksheet stats from worksheets data
  let totalWorksheets = worksheets?.length || 0;
  let submittedWorksheets =
    worksheets?.filter(
      (w) =>
        w.status === "submitted" ||
        w.status === "graded" ||
        w.status === "approved" ||
        w.status === "rejected"
    )?.length || 0;
  let passedWorksheets =
    worksheets?.filter((w) => w.status === "graded" || w.status === "approved")
      ?.length || 0;
  let pendingWorksheets =
    worksheets?.filter((w) => w.status === "submitted")?.length || 0;
  let failedWorksheets =
    worksheets?.filter((w) => w.status === "rejected")?.length || 0;
  let notSubmittedWorksheets =
    worksheets?.filter((w) => !w.status || w.status === "pending")?.length || 0;

  progressData.subjects.forEach((subject) => {
    subject.chapters?.forEach((chapter) => {
      if (chapter.lastPretestResult) {
        totalPretests++;
        if (chapter.lastPretestResult.passed) passedPretests++;
      }
      if (chapter.lastPosttestResult) {
        totalPosttests++;
        if (chapter.lastPosttestResult.passed) passedPosttests++;
      }
    });
    if (subject.finalExam?.result) {
      totalFinals++;
      if (subject.finalExam.result.passed) passedFinals++;
    }
  });

  // Circular Progress Component
  const CircularProgress = ({ percentage, size = 80, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            className="stroke-slate-600"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className="stroke-green-500 transition-all duration-700 ease-out"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{percentage}%</span>
        </div>
      </div>
    );
  };

  // Stat Card Component with link
  const StatCard = ({ icon: Icon, label, passed, total, iconBg, link }) => {
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    const hasData = total > 0;

    return (
      <div
        onClick={() => link && navigate(link)}
        className={`p-4 rounded-xl bg-slate-700 ${
          link ? "hover:bg-slate-600 cursor-pointer transition" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}
          >
            <Icon className="text-white text-lg" />
          </div>
          <div className="flex-1">
            <p className="text-slate-400 text-xs mb-1">{label}</p>
            <p className="text-white text-xl font-bold">
              {passed}/{total}
              {hasData && (
                <span className="text-green-400 text-sm font-normal ml-2">
                  ({percentage}%)
                </span>
              )}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              {hasData ? `ผ่าน ${passed} ครั้ง` : "ยังไม่ได้ทำ"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Status Badge Component
  const StatusBadge = ({ passed, type }) => {
    const baseClasses =
      "px-2 py-1 rounded text-xs font-medium flex items-center gap-1";
    if (passed === null)
      return (
        <span className={`${baseClasses} bg-gray-500/30 text-gray-400`}>
          {type}-
        </span>
      );
    if (passed)
      return (
        <span className={`${baseClasses} bg-green-500 text-white`}>
          {type}
          <FaCheck className="text-[10px]" />
        </span>
      );
    return (
      <span className={`${baseClasses} bg-red-500/20 text-red-400`}>
        {type}
        <FaTimes className="text-[10px]" />
      </span>
    );
  };

  return (
    <div className="rounded-2xl p-5 bg-slate-800 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <FaChartLine className="text-xl text-green-400" />
        <h3 className="text-lg font-bold text-white">สถิติการเรียน</h3>
      </div>

      {/* Stats Grid */}
      <RevealOnScroll animation="fadeInUp" duration={800}>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard
            icon={FaBook}
            label="Pretest"
            passed={passedPretests}
            total={totalPretests}
            iconBg="bg-blue-500"
            link="/my-tests"
          />
          <StatCard
            icon={FaGraduationCap}
            label="Posttest"
            passed={passedPosttests}
            total={totalPosttests}
            iconBg="bg-green-500"
            link="/my-tests"
          />
          <StatCard
            icon={FaTrophy}
            label="Final Exam"
            passed={passedFinals}
            total={totalFinals}
            iconBg="bg-yellow-500"
            link="/final-exams"
          />
          <StatCard
            icon={FaFileAlt}
            label="Worksheets"
            passed={passedWorksheets}
            total={totalWorksheets}
            iconBg="bg-purple-500"
            link="/worksheets"
          />
        </div>
      </RevealOnScroll>

      {/* Chapter Progress - แสดงความคืบหน้าแต่ละบท */}
      <RevealOnScroll animation="fadeInUp" duration={800} delay={200}>
        <div className="mb-5 p-4 rounded-xl bg-slate-700">
          <h4
            onClick={() => navigate("/my-progress")}
            className="text-white font-bold flex items-center gap-2 mb-4 hover:text-blue-400 cursor-pointer transition"
          >
            📚 ความคืบหน้าบทเรียน
            <span className="text-xs text-slate-400 ml-auto">ดูทั้งหมด →</span>
          </h4>

          {progressData.subjects.map((subject, sIdx) => (
            <div key={subject.subject._id || sIdx} className="mb-4 last:mb-0">
              {/* Subject Name as Section Header */}
              <p className="text-slate-400 text-xs mb-2 font-medium">
                {subject.subject.subject_name}
              </p>

              {/* Chapters with Progress Bars */}
              <div className="space-y-3">
                {subject.chapters?.map((chapter, cIdx) => {
                  const videoProgress = chapter.progress?.videoProgress || 0;
                  const pretestDone = !!chapter.lastPretestResult;
                  const posttestDone = !!chapter.lastPosttestResult;

                  // Calculate overall chapter progress
                  let chapterProgress = 0;
                  if (pretestDone) chapterProgress += 25;
                  if (videoProgress >= 90) chapterProgress += 50;
                  else chapterProgress += (videoProgress / 100) * 50;
                  if (posttestDone) chapterProgress += 25;
                  chapterProgress = Math.round(chapterProgress);

                  return (
                    <div
                      key={chapter._id || cIdx}
                      className="p-3 rounded-lg bg-slate-600/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-200 text-sm">
                          {cIdx + 1}.{" "}
                          {chapter.chapter_name || `บทที่ ${cIdx + 1}`}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <StatusBadge
                            passed={chapter.lastPretestResult?.passed ?? null}
                            type="P"
                          />
                          <StatusBadge
                            passed={
                              chapter.progress?.videoWatched ||
                              videoProgress >= 90
                                ? true
                                : videoProgress > 0
                                ? false
                                : null
                            }
                            type="🎬"
                          />
                          <StatusBadge
                            passed={chapter.lastPosttestResult?.passed ?? null}
                            type="T"
                          />
                        </div>
                      </div>
                      {/* Chapter Progress Bar */}
                      <div className="h-2 rounded-full bg-slate-500 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            chapterProgress >= 100
                              ? "bg-gradient-to-r from-green-400 to-green-500"
                              : chapterProgress >= 50
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                              : "bg-gradient-to-r from-blue-400 to-blue-500"
                          }`}
                          style={{ width: `${chapterProgress}%` }}
                        />
                      </div>
                      <div className="text-right mt-1">
                        <span
                          className={`text-xs font-medium ${
                            chapterProgress >= 100
                              ? "text-green-400"
                              : chapterProgress >= 50
                              ? "text-yellow-400"
                              : "text-blue-400"
                          }`}
                        >
                          {chapterProgress}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Final Exam Status */}
              {subject.finalExam && (
                <div className="mt-3 p-3 rounded-lg bg-slate-600/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaTrophy
                      className={
                        subject.finalExam.result?.passed
                          ? "text-yellow-400"
                          : "text-slate-400"
                      }
                    />
                    <span className="text-white font-medium">Final Exam</span>
                  </div>
                  {subject.finalExam.result ? (
                    subject.finalExam.result.passed ? (
                      <span className="px-4 py-1.5 rounded-lg text-xs font-bold bg-green-500 text-white">
                        ผ่าน {subject.finalExam.result.percentage}%
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-500/30 text-red-400">
                        ไม่ผ่าน {subject.finalExam.result.percentage}%
                      </span>
                    )
                  ) : subject.finalExam.canTake ? (
                    <span className="px-4 py-1.5 rounded-lg text-xs font-bold bg-green-500 text-white">
                      พร้อมสอบ
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">
                      เรียนให้ครบก่อน
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </RevealOnScroll>

      {/* Worksheets Stats Section */}
      <RevealOnScroll animation="fadeInUp" duration={800} delay={400}>
        <div className="p-4 rounded-xl bg-slate-700">
          <h4
            onClick={() => navigate("/worksheets")}
            className="text-white font-bold flex items-center gap-2 mb-4 hover:text-purple-400 cursor-pointer transition"
          >
            <FaFileAlt className="text-purple-400" /> สถิติใบงาน
            <span className="text-xs text-slate-400 ml-auto">ดูทั้งหมด →</span>
          </h4>

          {/* Worksheet Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-green-500/20 text-center">
              <p className="text-2xl font-bold text-green-400">
                {passedWorksheets}
              </p>
              <p className="text-xs text-slate-400">ผ่านแล้ว</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/20 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {pendingWorksheets}
              </p>
              <p className="text-xs text-slate-400">รอตรวจ</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/20 text-center">
              <p className="text-2xl font-bold text-red-400">
                {failedWorksheets}
              </p>
              <p className="text-xs text-slate-400">ไม่ผ่าน</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-500/20 text-center">
              <p className="text-2xl font-bold text-slate-300">
                {totalWorksheets}
              </p>
              <p className="text-xs text-slate-400">ทั้งหมด</p>
            </div>
          </div>

          {/* Worksheet List */}
          {worksheets && worksheets.length > 0 && (
            <div className="space-y-2">
              <p className="text-slate-400 text-xs mb-2">รายการใบงาน</p>
              {worksheets.slice(0, 5).map((ws, idx) => (
                <div
                  key={ws._id || idx}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-600/50"
                >
                  <span className="flex-1 text-slate-200 text-sm truncate">
                    {ws.title || "ใบงาน"}
                  </span>
                  {ws.status === "graded" || ws.status === "approved" ? (
                    <span className="px-3 py-1 rounded text-xs font-medium bg-green-500 text-white">
                      ✓ ผ่าน
                    </span>
                  ) : ws.status === "submitted" ? (
                    <span className="px-3 py-1 rounded text-xs font-medium bg-yellow-500/30 text-yellow-400">
                      รอตรวจ
                    </span>
                  ) : ws.status === "rejected" ? (
                    <span className="px-3 py-1 rounded text-xs font-medium bg-red-500/30 text-red-400">
                      ไม่ผ่าน
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded text-xs font-medium bg-blue-500/30 text-blue-400">
                      รอส่ง
                    </span>
                  )}
                </div>
              ))}
              {worksheets.length > 5 && (
                <p className="text-xs text-center text-slate-400 mt-2">
                  และอีก {worksheets.length - 5} รายการ...
                </p>
              )}
            </div>
          )}

          {/* No worksheets message */}
          {(!worksheets || worksheets.length === 0) && (
            <p className="text-center text-slate-400 text-sm py-4">
              ยังไม่มีใบงาน
            </p>
          )}
        </div>
      </RevealOnScroll>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const StudentProfile = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [student, setStudent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Image Crop States
  const [srcImage, setSrcImage] = useState(null);
  const [crop, setCrop] = useState({ unit: "%", width: 80, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  // Learning Stats States
  const [progressData, setProgressData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [worksheets, setWorksheets] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // ==================== API FUNCTIONS ====================
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) return navigate("/login");

      const res = await fetch(`${getBaseUrl()}/api/students/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      setStudent(data.student);
      setEditForm(data.student);
    } catch (error) {
      console.error(error);
      toast.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningStats = async () => {
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) return;

      // Fetch progress, submissions and worksheets in parallel
      const [progressRes, submissionsRes, worksheetsRes] = await Promise.all([
        fetch(`${getBaseUrl()}/api/students/my-progress`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${getBaseUrl()}/api/students/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${getBaseUrl()}/api/students/worksheets`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (progressRes.ok) {
        const data = await progressRes.json();
        setProgressData(data);
      }

      if (submissionsRes.ok) {
        const data = await submissionsRes.json();
        setSubmissions(data.submissions || []);
      }

      if (worksheetsRes.ok) {
        const data = await worksheetsRes.json();
        setWorksheets(data.worksheets || []);
      }
    } catch (error) {
      console.error("Error fetching learning stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("studentToken");
      const res = await fetch(`${getBaseUrl()}/api/students/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();
      setStudent(data.student);
      setIsEditing(false);
      toast.success("บันทึกข้อมูลสำเร็จ!", { icon: "✅" });
      localStorage.setItem("studentInfo", JSON.stringify(data.student));
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error(error);
      toast.error("บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("studentToken");
      const res = await fetch(`${getBaseUrl()}/api/students/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");

      toast.success("เปลี่ยนรหัสผ่านสำเร็จ!", { icon: "🔐" });
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  // ==================== IMAGE CROP FUNCTIONS ====================
  const getCroppedImg = useCallback(() => {
    if (!completedCrop || !imgRef.current) return null;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const outputSize = 300;

    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize
    );

    return canvas.toDataURL("image/jpeg", 0.8);
  }, [completedCrop]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ไฟล์ขนาดใหญ่เกินไป (ไม่เกิน 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSrcImage(reader.result);
      setShowCropModal(true);
      setCrop({ unit: "%", width: 80, aspect: 1 });
      setCompletedCrop(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropConfirm = () => {
    const croppedImageUrl = getCroppedImg();
    if (croppedImageUrl) {
      setEditForm((prev) => ({ ...prev, profileImage: croppedImageUrl }));
      toast.success("ครอปรูปสำเร็จ!", { icon: "✂️" });
    }
    closeCropModal();
  };

  const closeCropModal = () => {
    setShowCropModal(false);
    setSrcImage(null);
  };

  const onImageLoad = useCallback((e) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const size = Math.min(width, height) * 0.8;
    setCrop({
      unit: "px",
      width: size,
      height: size,
      x: (width - size) / 2,
      y: (height - size) / 2,
    });
  }, []);

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchProfile();
    fetchLearningStats();
  }, []);

  // ==================== RENDER ====================
  if (loading) return <LoadingSpinner isDarkMode={isDarkMode} />;
  if (!student)
    return (
      <NoProfileFound
        isDarkMode={isDarkMode}
        onLogin={() => navigate("/login")}
      />
    );

  return (
    <div
      className={`min-h-screen py-6 px-4 transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-blue-50 via-white to-blue-50"
      }`}
    >
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`p-3 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer ${
              isDarkMode
                ? "bg-slate-800 text-blue-400 hover:bg-slate-700"
                : "bg-white text-blue-600 hover:bg-blue-50"
            }`}
          >
            <FaArrowLeft />
          </button>
          <h1
            className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-blue-700"
            }`}
          >
            โปรไฟล์ของฉัน
          </h1>
        </div>
      </div>

      {/* 2-Column Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Profile (Sticky) */}
        <div className="lg:col-span-4">
          <RevealOnScroll animation="fadeInLeft" duration={1000}>
            <div
              className={`rounded-3xl shadow-xl overflow-hidden ${
                isDarkMode ? "bg-slate-800" : "bg-white"
              }`}
            >
              <ProfileAvatar
                student={student}
                editForm={editForm}
                isEditing={isEditing}
                isDarkMode={isDarkMode}
                onImageSelect={handleImageSelect}
              />

              <ProfileInfoHeader student={student} isDarkMode={isDarkMode} />

              {/* Info List / Edit Form */}
              <div className="px-6 pb-4 space-y-3">
                {isEditing ? (
                  <div className="space-y-4">
                    {PROFILE_FIELDS.map((field) => (
                      <EditFormField
                        key={field.key}
                        field={field}
                        value={editForm[field.key]}
                        onChange={(key, value) =>
                          setEditForm({ ...editForm, [key]: value })
                        }
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                ) : (
                  PROFILE_FIELDS.map((field) => (
                    <InfoDisplayItem
                      key={field.key}
                      field={field}
                      student={student}
                      isDarkMode={isDarkMode}
                    />
                  ))
                )}
              </div>

              <ProfileActions
                isEditing={isEditing}
                saving={saving}
                isDarkMode={isDarkMode}
                onSave={saveProfile}
                onEdit={() => setIsEditing(true)}
                onCancel={() => setIsEditing(false)}
                onChangePassword={() => setShowPasswordModal(true)}
                student={student}
                setEditForm={setEditForm}
              />
            </div>
          </RevealOnScroll>
        </div>

        {/* Right Column - Learning Stats */}
        <div className="lg:col-span-8">
          <LearningStats
            progressData={progressData}
            submissions={submissions}
            worksheets={worksheets}
            isDarkMode={isDarkMode}
            loading={statsLoading}
            navigate={navigate}
          />
        </div>
      </div>

      {/* Modals */}
      {showCropModal && srcImage && (
        <ImageCropModal
          srcImage={srcImage}
          crop={crop}
          setCrop={setCrop}
          setCompletedCrop={setCompletedCrop}
          completedCrop={completedCrop}
          onClose={closeCropModal}
          onConfirm={handleCropConfirm}
          onImageLoad={onImageLoad}
          isDarkMode={isDarkMode}
        />
      )}

      {showPasswordModal && (
        <PasswordModal
          passwordForm={passwordForm}
          setPasswordForm={setPasswordForm}
          onSubmit={changePassword}
          onClose={() => setShowPasswordModal(false)}
          saving={saving}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default StudentProfile;
