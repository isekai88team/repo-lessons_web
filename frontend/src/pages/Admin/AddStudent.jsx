import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useRegisterStudentMutation } from "../../redux/features/admin/adminApi";
import {
  FaUserGraduate,
  FaUser,
  FaLock,
  FaEnvelope,
  FaPhone,
  FaSpinner,
  FaArrowLeft,
  FaSchool,
  FaGraduationCap,
  FaDoorOpen,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import CustomSelect from "../../components/Admin/CustomSelect";

// Grade levels
const GRADE_LEVELS = [
  { value: "ม.1", label: "มัธยมศึกษาปีที่ 1" },
  { value: "ม.2", label: "มัธยมศึกษาปีที่ 2" },
  { value: "ม.3", label: "มัธยมศึกษาปีที่ 3" },
  { value: "ม.4", label: "มัธยมศึกษาปีที่ 4" },
  { value: "ม.5", label: "มัธยมศึกษาปีที่ 5" },
  { value: "ม.6", label: "มัธยมศึกษาปีที่ 6" },
];

// Room numbers 1-12
const ROOM_NUMBERS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `ห้อง ${i + 1}`,
}));

const AddStudent = () => {
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const [registerStudent, { isLoading }] = useRegisterStudentMutation();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    classRoom: "",
  });

  // Separate state for grade and room dropdowns
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  // Update classRoom when grade or room changes
  useEffect(() => {
    if (selectedGrade && selectedRoom) {
      setFormData((prev) => ({
        ...prev,
        classRoom: `${selectedGrade}/${selectedRoom}`,
      }));
    } else {
      setFormData((prev) => ({ ...prev, classRoom: "" }));
    }
  }, [selectedGrade, selectedRoom]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.classRoom) {
      toast.error("กรุณาเลือกห้องเรียน");
      return;
    }

    try {
      await registerStudent(formData).unwrap();
      toast.success("เพิ่มนักเรียนสำเร็จ! 🎉");
      setTimeout(() => navigate("/admin/students"), 1500);
    } catch (error) {
      toast.error(error?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มนักเรียน");
    }
  };

  const inputStyle = {
    backgroundColor: isDarkMode ? colors.background : "#F5F6F7",
    border: `1px solid ${colors.border}`,
    color: colors.text,
  };

  return (
    <div
      className="min-h-screen p-6 lg:p-10 font-sans transition-colors duration-300"
      style={{
        backgroundColor: isDarkMode
          ? colors.background
          : `${colors.background}50`,
      }}
    >
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/admin/students")}
          className="p-3 rounded-xl shadow-sm cursor-pointer"
          style={{
            backgroundColor: colors.cardBg,
            color: colors.textSecondary,
          }}
        >
          <FaArrowLeft />
        </button>
        <div>
          <h1
            className="text-2xl font-bold flex items-center gap-3"
            style={{ color: colors.text }}
          >
            <FaUserGraduate style={{ color: colors.secondary }} />
            เพิ่มนักเรียนใหม่
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            กรอกข้อมูลนักเรียนเพื่อเพิ่มเข้าระบบ
          </p>
        </div>
      </div>

      <div
        className="max-w-2xl mx-auto rounded-2xl shadow-lg overflow-hidden"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}30`,
        }}
      >
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                ชื่อผู้ใช้ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: colors.textSecondary }}
                >
                  <FaUser />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
                  style={inputStyle}
                  placeholder="กรอกชื่อผู้ใช้"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                รหัสผ่าน <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: colors.textSecondary }}
                >
                  <FaLock />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
                  style={inputStyle}
                  placeholder="กรอกรหัสผ่าน"
                />
              </div>
            </div>
          </div>

          {/* Hint for username and password */}
          <div
            className="flex flex-wrap gap-4 text-xs px-3 py-2 rounded-lg"
            style={{
              backgroundColor: `${colors.secondary}10`,
              border: `1px dashed ${colors.secondary}40`,
              color: colors.textSecondary,
            }}
          >
            <span>
              💡 <strong>หมายเหตุ:</strong>
            </span>
            <span>
              ชื่อผู้ใช้ ={" "}
              <span style={{ color: colors.secondary }}>Email นักเรียน</span>
            </span>
            <span>•</span>
            <span>
              รหัสผ่าน ={" "}
              <span style={{ color: colors.secondary }}>รหัสนักเรียน</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl focus:outline-none"
                style={inputStyle}
                placeholder="กรอกชื่อ"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl focus:outline-none"
                style={inputStyle}
                placeholder="กรอกนามสกุล"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                อีเมล <span className="text-xs opacity-60">(ไม่บังคับ)</span>
              </label>
              <div className="relative">
                <div
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: colors.textSecondary }}
                >
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
                  style={inputStyle}
                  placeholder="example@email.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                เบอร์โทร <span className="text-xs opacity-60">(ไม่บังคับ)</span>
              </label>
              <div className="relative">
                <div
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: colors.textSecondary }}
                >
                  <FaPhone />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
                  style={inputStyle}
                  placeholder="0812345678"
                />
              </div>
            </div>
          </div>

          {/* Note for optional fields */}
          <p
            className="text-xs italic"
            style={{ color: colors.textSecondary, opacity: 0.7 }}
          >
            * อีเมลและเบอร์โทร ไม่จำเป็นต้องกรอก
            นักเรียนสามารถเพิ่มเองได้ภายหลัง
          </p>

          <div className="space-y-3">
            <label
              className="text-sm font-medium flex items-center gap-2"
              style={{ color: colors.textSecondary }}
            >
              <FaSchool style={{ color: colors.secondary }} /> ห้องเรียน{" "}
              <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Grade Level Dropdown */}
              <CustomSelect
                value={selectedGrade}
                onChange={setSelectedGrade}
                options={GRADE_LEVELS.map((g) => ({
                  value: g.value,
                  label: g.value,
                  sublabel: g.label,
                }))}
                placeholder="-- เลือกระดับชั้น --"
                icon={FaGraduationCap}
                label="ระดับชั้น"
              />

              {/* Room Number Dropdown */}
              <CustomSelect
                value={selectedRoom}
                onChange={setSelectedRoom}
                options={ROOM_NUMBERS}
                placeholder="-- เลือกห้อง --"
                icon={FaDoorOpen}
                label="ห้อง"
              />
            </div>

            {/* Selected Classroom Display */}
            {formData.classRoom && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl mt-3"
                style={{
                  backgroundColor: `${colors.secondary}15`,
                  border: `1px solid ${colors.secondary}40`,
                }}
              >
                <FaSchool style={{ color: colors.secondary }} />
                <span
                  style={{ color: colors.textSecondary }}
                  className="text-sm"
                >
                  ห้องเรียนที่เลือก:
                </span>
                <span
                  className="font-bold text-lg"
                  style={{ color: colors.secondary }}
                >
                  {formData.classRoom}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/students")}
              className="flex-1 py-3 px-6 font-semibold rounded-xl cursor-pointer"
              style={{
                border: `1px solid ${colors.border}`,
                color: colors.textSecondary,
              }}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-6 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: colors.secondary, color: "#FFF6E0" }}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <span>บันทึกข้อมูล</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
