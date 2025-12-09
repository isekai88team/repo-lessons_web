import React from "react";
import { Link } from "react-router-dom";
import {
  useFetchAllTeachersQuery,
  useFetchAllStudentsQuery,
} from "../../redux/features/admin/adminApi";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaSpinner,
  FaArrowRight,
  FaUsers,
  FaBook,
  FaChartLine,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const AdminDashboard = () => {
  const { isDarkMode, colors } = useTheme();

  const { data: teachersData, isLoading: teachersLoading } =
    useFetchAllTeachersQuery();

  const { data: studentsData, isLoading: studentsLoading } =
    useFetchAllStudentsQuery();

  const teachers = teachersData?.teachers || [];
  const students = studentsData?.students || [];

  // Get recent teachers/students (last 5)
  const recentTeachers = [...teachers].slice(-5).reverse();
  const recentStudents = [...students].slice(-5).reverse();

  // Helper Component for Stat Card
  const StatCard = ({
    title,
    count,
    icon: Icon,
    iconColor,
    link,
    loading,
    subtitle,
  }) => (
    <div
      className="rounded-2xl p-6 shadow-sm hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
      style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.border}30`,
      }}
    >
      {/* Decorative Background Blob */}
      <div
        className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"
        style={{ backgroundColor: iconColor }}
      ></div>

      <div className="flex justify-between items-start mb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Icon className="text-2xl" style={{ color: iconColor }} />
        </div>
        {link && (
          <Link
            to={link}
            className="transition-colors"
            style={{ color: colors.textSecondary }}
          >
            <FaArrowRight />
          </Link>
        )}
      </div>

      <div className="relative z-10">
        <p
          className="text-sm font-medium mb-1"
          style={{ color: colors.textSecondary }}
        >
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          {loading ? (
            <FaSpinner
              className="animate-spin text-2xl"
              style={{ color: iconColor }}
            />
          ) : (
            <h3 className="text-3xl font-bold" style={{ color: colors.text }}>
              {count}
            </h3>
          )}
          {subtitle && (
            <span
              className="text-xs font-normal"
              style={{ color: colors.textSecondary }}
            >
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 h-1 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
        style={{ backgroundColor: iconColor }}
      ></div>
    </div>
  );

  return (
    <div
      className="min-h-screen p-6 lg:p-10 font-sans transition-colors duration-300"
      style={{
        backgroundColor: isDarkMode
          ? colors.background
          : `${colors.background}50`,
      }}
    >
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: colors.text }}
          >
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
            ภาพรวมระบบจัดการการเรียนการสอน
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="px-4 py-2 rounded-lg shadow-sm text-sm flex items-center gap-2"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              color: colors.textSecondary,
            }}
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Online
          </div>
          <button
            className="px-4 py-2 text-sm font-bold rounded-lg shadow-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.primary, color: "#FFF6E0" }}
          >
            ดาวน์โหลดรายงาน
          </button>
        </div>
      </div>

      {/* --- Stats Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="อาจารย์ผู้สอน"
          count={teachers.length}
          loading={teachersLoading}
          icon={FaChalkboardTeacher}
          iconColor="#272829"
          link="/admin/teachers"
        />
        <StatCard
          title="นักเรียนทั้งหมด"
          count={students.length}
          loading={studentsLoading}
          icon={FaUserGraduate}
          iconColor="#61677A"
          link="/admin/students"
        />
        <StatCard
          title="ผู้ใช้งานรวม"
          count={teachers.length + students.length}
          loading={teachersLoading || studentsLoading}
          icon={FaUsers}
          iconColor="#8B5CF6"
        />
        <StatCard
          title="รายวิชา"
          count="-"
          subtitle="Coming Soon"
          loading={false}
          icon={FaBook}
          iconColor="#F59E0B"
        />
      </div>

      {/* --- Recent Activity Section --- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Teachers Table */}
        <div
          className="rounded-2xl shadow-sm overflow-hidden flex flex-col"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}30`,
          }}
        >
          <div
            className="p-6 flex justify-between items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <div>
              <h2
                className="text-lg font-bold flex items-center gap-2"
                style={{ color: "#FFF6E0" }}
              >
                <FaChalkboardTeacher />
                อาจารย์ที่เพิ่มล่าสุด
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#D8D9DA" }}>
                5 รายชื่อล่าสุด
              </p>
            </div>
            <Link
              to="/admin/teachers"
              className="text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
              style={{
                color: "#FFF6E0",
                border: "1px solid rgba(255,246,224,0.3)",
              }}
            >
              ดูทั้งหมด
            </Link>
          </div>

          <div className="p-0 flex-1">
            {teachersLoading ? (
              <div
                className="flex justify-center items-center h-48"
                style={{ color: colors.textSecondary }}
              >
                <FaSpinner className="animate-spin text-3xl" />
              </div>
            ) : recentTeachers.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-48"
                style={{ color: colors.textSecondary }}
              >
                <FaChartLine className="text-4xl mb-2 opacity-20" />
                <p>ยังไม่มีข้อมูล</p>
              </div>
            ) : (
              <div
                className="divide-y"
                style={{ borderColor: `${colors.border}30` }}
              >
                {recentTeachers.map((teacher) => (
                  <div
                    key={teacher._id}
                    className="group flex items-center gap-4 p-4 transition-colors cursor-default"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = `${colors.hover}50`)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm"
                      style={{
                        background: "linear-gradient(135deg, #272829, #61677A)",
                        color: "#FFF6E0",
                      }}
                    >
                      {teacher.firstName?.charAt(0) || "T"}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-bold truncate"
                        style={{ color: colors.text }}
                      >
                        {teacher.firstName} {teacher.lastName}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: colors.textSecondary }}
                      >
                        {teacher.email || "-"}
                      </p>
                    </div>
                    {/* Subjects Badge */}
                    <div className="hidden sm:flex items-center gap-1">
                      {teacher.subjects?.slice(0, 2).map((sub, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-[10px] rounded-full"
                          style={{
                            backgroundColor: `${colors.border}30`,
                            color: colors.textSecondary,
                          }}
                        >
                          {typeof sub === "object" ? sub.subject_name : sub}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Students Table */}
        <div
          className="rounded-2xl shadow-sm overflow-hidden flex flex-col"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}30`,
          }}
        >
          <div
            className="p-6 flex justify-between items-center"
            style={{ backgroundColor: colors.secondary }}
          >
            <div>
              <h2
                className="text-lg font-bold flex items-center gap-2"
                style={{ color: "#FFF6E0" }}
              >
                <FaUserGraduate />
                นักเรียนที่เพิ่มล่าสุด
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#D8D9DA" }}>
                5 รายชื่อล่าสุด
              </p>
            </div>
            <Link
              to="/admin/students"
              className="text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
              style={{
                color: "#FFF6E0",
                border: "1px solid rgba(255,246,224,0.3)",
              }}
            >
              ดูทั้งหมด
            </Link>
          </div>

          <div className="p-0 flex-1">
            {studentsLoading ? (
              <div
                className="flex justify-center items-center h-48"
                style={{ color: colors.textSecondary }}
              >
                <FaSpinner className="animate-spin text-3xl" />
              </div>
            ) : recentStudents.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-48"
                style={{ color: colors.textSecondary }}
              >
                <FaChartLine className="text-4xl mb-2 opacity-20" />
                <p>ยังไม่มีข้อมูล</p>
              </div>
            ) : (
              <div
                className="divide-y"
                style={{ borderColor: `${colors.border}30` }}
              >
                {recentStudents.map((student) => (
                  <div
                    key={student._id}
                    className="group flex items-center gap-4 p-4 transition-colors cursor-default"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = `${colors.hover}50`)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm"
                      style={{
                        background: "linear-gradient(135deg, #61677A, #D8D9DA)",
                        color: "#272829",
                      }}
                    >
                      {student.firstName?.charAt(0) || "S"}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-bold truncate"
                        style={{ color: colors.text }}
                      >
                        {student.firstName} {student.lastName}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: colors.textSecondary }}
                      >
                        @{student.username}
                      </p>
                    </div>
                    {/* Classroom Badge */}
                    <span
                      className="px-3 py-1 text-xs rounded-full font-medium"
                      style={{
                        backgroundColor: colors.primary,
                        color: "#FFF6E0",
                      }}
                    >
                      {student.classRoom || "-"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
