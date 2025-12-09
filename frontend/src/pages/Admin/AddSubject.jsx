import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useCreateSubjectMutation,
  useFetchAllTeachersQuery,
} from "../../redux/features/admin/adminApi";
import {
  FaBook,
  FaSpinner,
  FaArrowLeft,
  FaCode,
  FaChalkboardTeacher,
  FaAlignLeft,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const AddSubject = () => {
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const [createSubject, { isLoading }] = useCreateSubjectMutation();
  const { data: teachersData } = useFetchAllTeachersQuery();

  const [formData, setFormData] = useState({
    subject_name: "",
    code: "",
    description: "",
    teacher: "",
  });

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSubject(formData).unwrap();
      toast.success("สร้างรายวิชาสำเร็จ! 🎉");
      setTimeout(() => navigate("/admin/subjects"), 1500);
    } catch (error) {
      toast.error(error?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const inputStyle = {
    backgroundColor: isDarkMode ? colors.background : "#F5F6F7",
    border: `1px solid ${colors.border}`,
    color: colors.text,
  };
  const teachers = teachersData?.teachers || [];

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
          onClick={() => navigate("/admin/subjects")}
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
            <FaBook style={{ color: "#8B5CF6" }} />
            เพิ่มรายวิชาใหม่
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            กรอกข้อมูลรายวิชา
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
          {/* Subject Name */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              ชื่อรายวิชา <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: colors.textSecondary }}
              >
                <FaBook />
              </div>
              <input
                type="text"
                name="subject_name"
                value={formData.subject_name}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
                style={inputStyle}
                placeholder="เช่น คณิตศาสตร์พื้นฐาน"
              />
            </div>
          </div>

          {/* Code */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              รหัสวิชา <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: colors.textSecondary }}
              >
                <FaCode />
              </div>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
                style={inputStyle}
                placeholder="เช่น MATH101"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              คำอธิบายรายวิชา
            </label>
            <div className="relative">
              <div
                className="absolute left-4 top-4"
                style={{ color: colors.textSecondary }}
              >
                <FaAlignLeft />
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none resize-none"
                style={inputStyle}
                placeholder="อธิบายเกี่ยวกับรายวิชานี้..."
              />
            </div>
          </div>

          {/* Teacher */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              ครูผู้สอน
            </label>
            <div className="relative">
              <div
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: colors.textSecondary }}
              >
                <FaChalkboardTeacher />
              </div>
              <select
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none appearance-none"
                style={inputStyle}
              >
                <option value="">-- เลือกครูผู้สอน --</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/subjects")}
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
              style={{ backgroundColor: "#8B5CF6", color: "#FFF" }}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <span>บันทึกรายวิชา</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubject;
