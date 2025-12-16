import React from "react";
import { Link } from "react-router-dom";
import { useFetchDashboardStatsQuery } from "../../redux/features/admin/adminApi";
import {
  FaUserGraduate,
  FaSpinner,
  FaArrowRight,
  FaBook,
  FaClipboardList,
  FaClipboardCheck,
  FaTrophy,
  FaFileAlt,
  FaBell,
  FaChartBar,
  FaChartPie,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaHourglassHalf,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const AdminDashboard = () => {
  const { isDarkMode, colors } = useTheme();
  const { data: statsData, isLoading } = useFetchDashboardStatsQuery();

  const stats = statsData || {
    counts: {},
    classroomDistribution: {},
    testStats: { pretest: {}, posttest: {}, final: {} },
    worksheetStats: {},
    chapterStats: [],
  };

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
      className="rounded-2xl p-5 shadow-sm hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer"
      style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.border}30`,
      }}
    >
      {/* Decorative Background Blob */}
      <div
        className="absolute top-0 right-0 w-20 h-20 opacity-10 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-110"
        style={{ backgroundColor: iconColor }}
      ></div>

      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Icon className="text-lg" style={{ color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-medium truncate"
            style={{ color: colors.textSecondary }}
          >
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            {loading ? (
              <FaSpinner
                className="animate-spin text-xl"
                style={{ color: iconColor }}
              />
            ) : (
              <h3 className="text-2xl font-bold" style={{ color: colors.text }}>
                {count}
              </h3>
            )}
            {subtitle && (
              <span
                className="text-[10px] font-normal"
                style={{ color: colors.textSecondary }}
              >
                {subtitle}
              </span>
            )}
          </div>
        </div>
        {link && (
          <Link
            to={link}
            className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors"
            style={{ color: colors.textSecondary }}
          >
            <FaArrowRight className="text-sm" />
          </Link>
        )}
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 h-1 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
        style={{ backgroundColor: iconColor }}
      ></div>
    </div>
  );

  // Mini Doughnut Chart Component
  const MiniDoughnut = ({ passed, failed, total, color, label }) => {
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    const circumference = 2 * Math.PI * 35;
    const passedOffset = circumference - (passRate / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke={isDarkMode ? colors.border : "#E5E7EB"}
              strokeWidth="8"
              fill="none"
            />
            {/* Passed arc */}
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={passedOffset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold" style={{ color: colors.text }}>
              {passRate}%
            </span>
          </div>
        </div>
        <p
          className="text-xs mt-2 font-medium"
          style={{ color: colors.textSecondary }}
        >
          {label}
        </p>
        <p className="text-[10px]" style={{ color: colors.textSecondary }}>
          ผ่าน {passed} / {total}
        </p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: colors.background }}
      >
        <FaSpinner
          className="animate-spin text-5xl"
          style={{ color: "#8B5CF6" }}
        />
      </div>
    );
  }

  // Prepare classroom data
  const classroomData = Object.entries(stats.classroomDistribution || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxClassCount = Math.max(...classroomData.map(([, count]) => count), 1);

  const barColors = [
    "#8B5CF6",
    "#3B82F6",
    "#22C55E",
    "#F59E0B",
    "#EC4899",
    "#EF4444",
  ];

  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-10 font-sans transition-colors duration-300"
      style={{
        backgroundColor: isDarkMode
          ? colors.background
          : `${colors.background}50`,
      }}
    >
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight"
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
        </div>
      </div>

      {/* --- Stats Grid Row 1 --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="นักเรียนทั้งหมด"
          count={stats.counts?.students || 0}
          loading={isLoading}
          icon={FaUserGraduate}
          iconColor="#8B5CF6"
          link="/admin/students"
        />
        <StatCard
          title="บทเรียน"
          count={stats.counts?.chapters || 0}
          loading={isLoading}
          icon={FaBook}
          iconColor="#3B82F6"
          link="/admin/chapters"
        />
        <StatCard
          title="Pretest"
          count={stats.counts?.pretests || 0}
          loading={isLoading}
          icon={FaClipboardList}
          iconColor="#F59E0B"
          link="/admin/quizzes"
        />
        <StatCard
          title="Posttest"
          count={stats.counts?.posttests || 0}
          loading={isLoading}
          icon={FaClipboardCheck}
          iconColor="#22C55E"
          link="/admin/quizzes"
        />
      </div>

      {/* --- Stats Grid Row 2 --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Final Exam"
          count={`${stats.testStats?.final?.passed || 0}/${
            stats.testStats?.final?.total || 0
          }`}
          subtitle="ผ่าน"
          loading={isLoading}
          icon={FaTrophy}
          iconColor="#EC4899"
          link="/admin/final-exam"
        />
        <StatCard
          title="ใบงาน"
          count={stats.counts?.worksheets || 0}
          loading={isLoading}
          icon={FaFileAlt}
          iconColor="#10B981"
          link="/admin/worksheets"
        />
        <StatCard
          title="การส่งงาน"
          count={stats.worksheetStats?.approved || 0}
          subtitle="ผ่านแล้ว"
          loading={isLoading}
          icon={FaCheckCircle}
          iconColor="#06B6D4"
          link="/admin/grading"
        />
        <StatCard
          title="ประกาศ"
          count={stats.counts?.notifications || 0}
          subtitle="active"
          loading={isLoading}
          icon={FaBell}
          iconColor="#EF4444"
          link="/admin/notifications"
        />
      </div>

      {/* --- Charts Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Test Performance Doughnut Charts */}
        <div
          className="rounded-2xl p-6 shadow-sm"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}30`,
          }}
        >
          <h3
            className="text-lg font-bold mb-6 flex items-center gap-2"
            style={{ color: colors.text }}
          >
            <FaChartPie style={{ color: "#8B5CF6" }} />
            ผลการทดสอบ
          </h3>

          <div className="flex justify-around flex-wrap gap-4">
            <MiniDoughnut
              passed={stats.testStats?.pretest?.passed || 0}
              failed={stats.testStats?.pretest?.failed || 0}
              total={stats.testStats?.pretest?.total || 0}
              color="#F59E0B"
              label="Pretest"
            />
            <MiniDoughnut
              passed={stats.testStats?.posttest?.passed || 0}
              failed={stats.testStats?.posttest?.failed || 0}
              total={stats.testStats?.posttest?.total || 0}
              color="#22C55E"
              label="Posttest"
            />
            <MiniDoughnut
              passed={stats.testStats?.final?.passed || 0}
              failed={stats.testStats?.final?.failed || 0}
              total={stats.testStats?.final?.total || 0}
              color="#EC4899"
              label="Final Exam"
            />
          </div>
        </div>

        {/* Worksheet Status */}
        <div
          className="rounded-2xl p-6 shadow-sm"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}30`,
          }}
        >
          <h3
            className="text-lg font-bold mb-6 flex items-center gap-2"
            style={{ color: colors.text }}
          >
            <FaFileAlt style={{ color: "#10B981" }} />
            สถานะใบงาน
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Pending */}
            <div
              className="p-4 rounded-xl flex items-center gap-3"
              style={{
                backgroundColor: isDarkMode ? colors.background : "#F9FAFB",
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-500/20">
                <FaClock className="text-gray-500" />
              </div>
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: colors.text }}
                >
                  {stats.worksheetStats?.pending || 0}
                </p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  ยังไม่ส่ง
                </p>
              </div>
            </div>

            {/* Submitted */}
            <div
              className="p-4 rounded-xl flex items-center gap-3"
              style={{
                backgroundColor: isDarkMode ? colors.background : "#F9FAFB",
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-500/20">
                <FaHourglassHalf className="text-amber-500" />
              </div>
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: colors.text }}
                >
                  {stats.worksheetStats?.submitted || 0}
                </p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  รอตรวจ
                </p>
              </div>
            </div>

            {/* Approved */}
            <div
              className="p-4 rounded-xl flex items-center gap-3"
              style={{
                backgroundColor: isDarkMode ? colors.background : "#F9FAFB",
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/20">
                <FaCheckCircle className="text-green-500" />
              </div>
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: colors.text }}
                >
                  {stats.worksheetStats?.approved || 0}
                </p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  ผ่าน
                </p>
              </div>
            </div>

            {/* Rejected */}
            <div
              className="p-4 rounded-xl flex items-center gap-3"
              style={{
                backgroundColor: isDarkMode ? colors.background : "#F9FAFB",
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/20">
                <FaTimesCircle className="text-red-500" />
              </div>
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: colors.text }}
                >
                  {stats.worksheetStats?.rejected || 0}
                </p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  ไม่ผ่าน
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Classroom Distribution Bar Chart --- */}
      <div
        className="rounded-2xl p-6 shadow-sm mb-8"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}30`,
        }}
      >
        <h3
          className="text-lg font-bold mb-6 flex items-center gap-2"
          style={{ color: colors.text }}
        >
          <FaChartBar style={{ color: "#3B82F6" }} />
          นักเรียนแยกตามห้องเรียน
        </h3>

        {classroomData.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-32"
            style={{ color: colors.textSecondary }}
          >
            <FaUserGraduate className="text-4xl mb-2 opacity-20" />
            <p>ยังไม่มีข้อมูลนักเรียน</p>
          </div>
        ) : (
          <div className="space-y-3">
            {classroomData.map(([classroom, count], index) => {
              const percentage = (count / maxClassCount) * 100;
              const barColor = barColors[index % barColors.length];

              return (
                <div key={classroom} className="flex items-center gap-3">
                  {/* Label */}
                  <div
                    className="w-16 text-sm font-medium truncate text-right"
                    style={{ color: colors.text }}
                    title={classroom}
                  >
                    {classroom}
                  </div>

                  {/* Bar */}
                  <div className="flex-1 relative">
                    <div
                      className="h-8 rounded-lg overflow-hidden"
                      style={{
                        backgroundColor: isDarkMode
                          ? `${colors.border}30`
                          : "#f3f4f6",
                      }}
                    >
                      <div
                        className="h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-3"
                        style={{
                          width: `${Math.max(percentage, 8)}%`,
                          background: `linear-gradient(90deg, ${barColor}80, ${barColor})`,
                        }}
                      >
                        <span className="text-xs font-bold text-white drop-shadow-sm">
                          {count} คน
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Summary */}
            <div
              className="pt-4 mt-4 border-t text-sm flex justify-between"
              style={{
                borderColor: `${colors.border}30`,
                color: colors.textSecondary,
              }}
            >
              <span>รวมทั้งหมด</span>
              <span className="font-bold" style={{ color: colors.text }}>
                {stats.counts?.students || 0} คน (
                {Object.keys(stats.classroomDistribution || {}).length} ห้อง)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* --- Chapter Progress --- */}
      <div
        className="rounded-2xl p-6 shadow-sm"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}30`,
        }}
      >
        <h3
          className="text-lg font-bold mb-6 flex items-center gap-2"
          style={{ color: colors.text }}
        >
          <FaBook style={{ color: "#8B5CF6" }} />
          ความก้าวหน้าแต่ละบท
        </h3>

        {(stats.chapterStats || []).length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-32"
            style={{ color: colors.textSecondary }}
          >
            <FaBook className="text-4xl mb-2 opacity-20" />
            <p>ยังไม่มีบทเรียน</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(stats.chapterStats || []).map((chapter, idx) => (
              <div
                key={chapter._id}
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: isDarkMode ? colors.background : "#F9FAFB",
                  border: `1px solid ${colors.border}20`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{
                      backgroundColor: "#8B5CF620",
                      color: "#8B5CF6",
                    }}
                  >
                    {idx + 1}
                  </div>
                  <p
                    className="text-sm font-medium truncate flex-1"
                    style={{ color: colors.text }}
                    title={chapter.name}
                  >
                    {chapter.name}
                  </p>
                </div>

                {/* Progress Bar */}
                <div
                  className="h-2 rounded-full overflow-hidden mb-2"
                  style={{
                    backgroundColor: isDarkMode ? colors.border : "#E5E7EB",
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${chapter.percentage}%`,
                      backgroundColor:
                        chapter.percentage >= 80
                          ? "#22C55E"
                          : chapter.percentage >= 50
                          ? "#F59E0B"
                          : "#8B5CF6",
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs">
                  <span style={{ color: colors.textSecondary }}>
                    {chapter.completedStudents}/{chapter.totalStudents} คน
                  </span>
                  <span
                    className="font-bold"
                    style={{
                      color:
                        chapter.percentage >= 80
                          ? "#22C55E"
                          : chapter.percentage >= 50
                          ? "#F59E0B"
                          : "#8B5CF6",
                    }}
                  >
                    {chapter.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
