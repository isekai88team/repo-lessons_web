import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useRegisterTeacherMutation } from "../../redux/features/admin/adminApi";
import {
  FaChalkboardTeacher,
  FaUser,
  FaLock,
  FaEnvelope,
  FaPhone,
  FaSpinner,
  FaArrowLeft,
  FaBook,
  FaSchool,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const SUBJECT_LIST = [
  { id: "math", name: "คณิตศาสตร์" },
  { id: "science", name: "วิทยาศาสตร์" },
  { id: "english", name: "ภาษาอังกฤษ" },
  { id: "thai", name: "ภาษาไทย" },
  { id: "social", name: "สังคมศึกษา" },
  { id: "computer", name: "คอมพิวเตอร์" },
];

const CLASSROOM_LIST = [
  "ม.1/1",
  "ม.1/2",
  "ม.1/3",
  "ม.2/1",
  "ม.2/2",
  "ม.2/3",
  "ม.3/1",
  "ม.3/2",
  "ม.3/3",
  "ม.4/1",
  "ม.4/2",
  "ม.4/3",
  "ม.5/1",
  "ม.5/2",
  "ม.5/3",
  "ม.6/1",
  "ม.6/2",
  "ม.6/3",
];

const AddTeacher = () => {
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const [registerTeacher, { isLoading }] = useRegisterTeacherMutation();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedClassrooms, setSelectedClassrooms] = useState([]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubjectChange = (name) =>
    setSelectedSubjects((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  const handleClassroomChange = (room) =>
    setSelectedClassrooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerTeacher({
        ...formData,
        subjects: selectedSubjects,
        classRoom: selectedClassrooms,
      }).unwrap();
      toast.success("เพิ่มครูสำเร็จ! 🎉");
      setTimeout(() => navigate("/admin/teachers"), 1500);
    } catch (error) {
      toast.error(error?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มครู");
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
          onClick={() => navigate("/admin/teachers")}
          className="p-3 rounded-xl shadow-sm"
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
            <FaChalkboardTeacher style={{ color: colors.primary }} />
            เพิ่มครูใหม่
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            กรอกข้อมูลครูเพื่อเพิ่มเข้าระบบ
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
                อีเมล
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
                เบอร์โทร
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

          <div className="space-y-3">
            <label
              className="text-sm font-medium flex items-center gap-2"
              style={{ color: colors.textSecondary }}
            >
              <FaBook style={{ color: colors.primary }} /> วิชาที่สอน
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SUBJECT_LIST.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    backgroundColor: selectedSubjects.includes(s.name)
                      ? `${colors.primary}20`
                      : colors.inputBg,
                    border: `1px solid ${
                      selectedSubjects.includes(s.name)
                        ? colors.primary
                        : colors.border
                    }`,
                    color: selectedSubjects.includes(s.name)
                      ? colors.text
                      : colors.textSecondary,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(s.name)}
                    onChange={() => handleSubjectChange(s.name)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{s.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label
              className="text-sm font-medium flex items-center gap-2"
              style={{ color: colors.textSecondary }}
            >
              <FaSchool style={{ color: colors.secondary }} /> ห้องที่รับผิดชอบ
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {CLASSROOM_LIST.map((room) => (
                <label
                  key={room}
                  className="flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all text-sm"
                  style={{
                    backgroundColor: selectedClassrooms.includes(room)
                      ? `${colors.secondary}30`
                      : colors.inputBg,
                    border: `1px solid ${
                      selectedClassrooms.includes(room)
                        ? colors.secondary
                        : colors.border
                    }`,
                    color: selectedClassrooms.includes(room)
                      ? colors.text
                      : colors.textSecondary,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedClassrooms.includes(room)}
                    onChange={() => handleClassroomChange(room)}
                    className="sr-only"
                  />
                  <span className="font-medium">{room}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/teachers")}
              className="flex-1 py-3 px-6 font-semibold rounded-xl"
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
              className="flex-1 py-3 px-6 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
              style={{ backgroundColor: colors.primary, color: "#FFF6E0" }}
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

export default AddTeacher;
