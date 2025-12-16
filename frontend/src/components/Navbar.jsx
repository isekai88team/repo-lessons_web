import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaBell,
  FaChevronDown,
  FaUserCircle,
  FaSearch,
  FaSignInAlt,
  FaSignOutAlt,
  FaUser,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
  FaHome,
  FaBook,
  FaQuestionCircle,
  FaChartLine,
  FaClipboardCheck,
  FaFileAlt,
  FaPaperPlane,
  FaHeadset,
  FaTrophy,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import getBaseUrl from "../untils/baseURL";
import logoImage from "../assets/icon lessons.jpg";

const Navbar = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [studentInfo, setStudentInfo] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Load student info from localStorage
  useEffect(() => {
    const checkAuth = () => {
      const storedInfo = localStorage.getItem("studentInfo");
      const token = localStorage.getItem("studentToken");
      if (storedInfo && token) {
        try {
          setStudentInfo(JSON.parse(storedInfo));
        } catch (e) {
          setStudentInfo(null);
        }
      } else {
        setStudentInfo(null);
      }
    };

    checkAuth();

    // Listen for storage changes (login/logout from other tabs)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Fetch Notifications
  useEffect(() => {
    if (studentInfo) {
      const fetchNotifications = async () => {
        try {
          const response = await fetch(
            `${getBaseUrl()}/api/notifications/active?studentId=${
              studentInfo._id
            }`
          );
          if (response.ok) {
            const data = await response.json();
            // Filter out duplicate notifications by _id
            const uniqueNotifications = data.filter(
              (note, index, self) =>
                index === self.findIndex((n) => n._id === note._id)
            );
            setNotifications(uniqueNotifications);
          }
        } catch (error) {
          console.error("Failed to fetch notifications", error);
        }
      };
      fetchNotifications();

      // Optional: Poll every 60 seconds?
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [studentInfo]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentInfo");
    setStudentInfo(null);
    setShowDropdown(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full shadow-lg font-sans transition-all duration-300 animate__animated animate__fadeInDown ${
          isDarkMode
            ? "bg-gradient-to-r from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-sm"
            : "bg-gradient-to-r from-blue-500/90 via-blue-600/90 to-blue-500/90 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          {/* --- Left Side: Brand Identity --- */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            {/* Logo Image */}
            <img
              src={logoImage}
              alt="Logo"
              className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
            />
            {/* Brand Name - Hide on very small screens */}
            <div className="flex flex-col leading-tight hidden sm:flex">
              <span className="text-white font-bold text-xs md:text-sm tracking-wide">
                บทเรียนบนเว็บ
              </span>
              <span className="text-white/60 text-[8px] md:text-[10px] tracking-widest hidden md:block">
                กระบวนการออกแบบเชิงวิศวกรรม
              </span>
            </div>
          </Link>

          {/* --- Center: Navigation Menu (Hidden on mobile) --- */}
          <div
            className={`hidden lg:flex items-center rounded-full px-2 py-1 border backdrop-blur-md ${
              isDarkMode
                ? "bg-slate-800/50 border-white/10"
                : "bg-blue-800/50 border-white/20"
            }`}
          >
            {/* Active Link Example */}
            <Link
              to="/"
              className={`px-5 py-2 rounded-full font-bold text-sm shadow-sm transition-all ${
                isDarkMode ? "bg-blue-500 text-white" : "bg-white text-blue-700"
              }`}
            >
              หน้าหลัก
            </Link>

            {/* Dropdown Link 1 */}
            <div className="group relative px-5 py-2 cursor-pointer flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <span className="text-sm font-medium">บทเรียน</span>
              <FaChevronDown className="text-[10px] opacity-60 group-hover:rotate-180 transition-transform duration-300" />
            </div>

            {/* Dropdown Link 2 */}
            <div className="group relative px-5 py-2 cursor-pointer flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <span className="text-sm font-medium">ช่วยเหลือ</span>
              <FaChevronDown className="text-[10px] opacity-60 group-hover:rotate-180 transition-transform duration-300" />
            </div>
          </div>

          {/* --- Right Side: Actions --- */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search Icon - Hidden on smallest screens */}
            <button className="hidden sm:block text-white/70 hover:text-white transition-colors p-2 cursor-pointer">
              <FaSearch />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 md:p-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                isDarkMode
                  ? "bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30"
                  : "bg-slate-800/20 text-white hover:bg-slate-800/30"
              }`}
              title={
                isDarkMode ? "เปลี่ยนเป็น Light Mode" : "เปลี่ยนเป็น Dark Mode"
              }
            >
              {isDarkMode ? (
                <FaSun className="text-base md:text-lg" />
              ) : (
                <FaMoon className="text-base md:text-lg" />
              )}
            </button>

            {/* Notification Dropdown (only when logged in) - Hidden on mobile */}
            {studentInfo && (
              <div className="relative hidden md:block" ref={notificationRef}>
                <button
                  onClick={() =>
                    setShowNotificationDropdown(!showNotificationDropdown)
                  }
                  className="relative text-white/70 hover:text-white transition-colors p-2 group cursor-pointer"
                >
                  <FaBell className="text-lg group-hover:swing" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-transparent"></span>
                  )}
                </button>

                {/* Dropdown */}
                {showNotificationDropdown && (
                  <div
                    className={`absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl shadow-xl border z-50 ${
                      isDarkMode
                        ? "bg-slate-800 border-slate-700"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <div
                      className={`p-4 border-b ${
                        isDarkMode ? "border-slate-700" : "border-gray-100"
                      }`}
                    >
                      <h3
                        className={`font-bold ${
                          isDarkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        การแจ้งเตือน
                      </h3>
                    </div>
                    <div className="py-2">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((note) => (
                          <button
                            key={note._id}
                            onClick={() => {
                              navigate(`/notifications/${note._id}`);
                              setShowNotificationDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-3 flex gap-3 border-b border-transparent transition-all duration-200 group ${
                              isDarkMode
                                ? "text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700/50 cursor-pointer"
                                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700 border-gray-100 cursor-pointer"
                            }`}
                          >
                            <div className="mt-1.5">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  note.type === "error"
                                    ? "bg-red-500"
                                    : note.type === "success"
                                    ? "bg-green-500"
                                    : note.type === "warning"
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <p
                                className={`font-bold text-sm line-clamp-1 transition-colors ${
                                  isDarkMode
                                    ? "text-white"
                                    : "text-gray-900 group-hover:text-blue-800"
                                }`}
                              >
                                {note.title}
                              </p>
                              <p className="text-xs opacity-70 line-clamp-2 my-0.5">
                                {note.message}
                              </p>
                              <p className="text-[10px] opacity-50">
                                {new Date(note.createdAt).toLocaleDateString(
                                  "th-TH"
                                )}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-8 text-center opacity-50 text-sm">
                          <FaBell className="mx-auto text-2xl mb-2 opacity-30" />
                          ไม่มีการแจ้งเตือน
                        </div>
                      )}
                    </div>
                    <div
                      className={`p-2 border-t text-center ${
                        isDarkMode ? "border-slate-700" : "border-gray-100"
                      }`}
                    >
                      <Link
                        to="/notifications"
                        onClick={() => setShowNotificationDropdown(false)}
                        className="text-xs font-bold text-blue-500 hover:text-blue-600 hover:underline"
                      >
                        ดูทั้งหมด
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Divider - Hidden on mobile */}
            <div className="h-8 w-px bg-white/10 hidden lg:block"></div>

            {/* User Profile / Login Button - Desktop */}
            <div className="hidden md:block">
              {studentInfo ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full border border-white/20 hover:bg-white/10 transition-all group cursor-pointer"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm overflow-hidden ${
                        isDarkMode
                          ? "bg-gradient-to-br from-blue-400 to-cyan-400 text-slate-900"
                          : "bg-gradient-to-br from-yellow-200 to-yellow-500 text-blue-900"
                      }`}
                    >
                      {studentInfo.profileImage ? (
                        <img
                          src={studentInfo.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold">
                          {studentInfo.firstName?.[0]?.toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-start hidden lg:block">
                      <span className="text-white text-xs font-bold group-hover:text-blue-200 transition-colors">
                        {studentInfo.firstName ||
                          studentInfo.username ||
                          "นักเรียน"}
                      </span>
                      <span className="text-white/50 text-[10px]">
                        {" "}
                        : นักเรียน
                      </span>
                    </div>
                    <FaChevronDown
                      className={`text-[10px] text-white/50 ml-1 transition-transform duration-200 ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {/* Dropdown Menu */}
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl py-2 border z-50 transition-all duration-300 ease-out origin-top-right ${
                      showDropdown
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    } ${
                      isDarkMode
                        ? "bg-slate-800 border-slate-700"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 border-b ${
                        isDarkMode ? "border-slate-700" : "border-gray-100"
                      }`}
                    >
                      <p
                        className={`text-sm font-bold ${
                          isDarkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {studentInfo.firstName} {studentInfo.lastName}
                      </p>
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-slate-400" : "text-gray-500"
                        }`}
                      >
                        @{studentInfo.username}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/profile");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition cursor-pointer ${
                        isDarkMode
                          ? "text-slate-300 hover:bg-slate-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaUser
                        className={
                          isDarkMode ? "text-slate-500" : "text-gray-400"
                        }
                      />
                      โปรไฟล์
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/my-progress");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition cursor-pointer ${
                        isDarkMode
                          ? "text-slate-300 hover:bg-slate-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaChartLine
                        className={
                          isDarkMode ? "text-slate-500" : "text-gray-400"
                        }
                      />
                      ความก้าวหน้าบทเรียน
                    </button>

                    <div
                      className={`border-t my-1 ${
                        isDarkMode ? "border-slate-700" : "border-gray-100"
                      }`}
                    ></div>

                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/my-tests");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition cursor-pointer ${
                        isDarkMode
                          ? "text-slate-300 hover:bg-slate-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaClipboardCheck
                        className={
                          isDarkMode ? "text-slate-500" : "text-gray-400"
                        }
                      />
                      แบบทดสอบ
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/my-final-exam");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition cursor-pointer ${
                        isDarkMode
                          ? "text-slate-300 hover:bg-slate-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaTrophy
                        className={
                          isDarkMode ? "text-slate-500" : "text-gray-400"
                        }
                      />
                      Final Exam
                    </button>

                    <div
                      className={`border-t my-1 ${
                        isDarkMode ? "border-slate-700" : "border-gray-100"
                      }`}
                    ></div>

                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/worksheets");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition cursor-pointer ${
                        isDarkMode
                          ? "text-slate-300 hover:bg-slate-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaFileAlt
                        className={
                          isDarkMode ? "text-slate-500" : "text-gray-400"
                        }
                      />
                      ใบงาน
                    </button>

                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/contact-admin");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition cursor-pointer ${
                        isDarkMode
                          ? "text-slate-300 hover:bg-slate-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaHeadset
                        className={
                          isDarkMode ? "text-slate-500" : "text-gray-400"
                        }
                      />
                      ติดต่อแอดมิน
                    </button>

                    <div
                      className={`border-t my-1 ${
                        isDarkMode ? "border-slate-700" : "border-gray-100"
                      }`}
                    ></div>

                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition cursor-pointer ${
                        isDarkMode
                          ? "text-red-400 hover:bg-red-500/10"
                          : "text-red-600 hover:bg-red-50"
                      }`}
                    >
                      <FaSignOutAlt
                        className={isDarkMode ? "text-red-500" : "text-red-400"}
                      />
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all font-medium text-sm ${
                    isDarkMode
                      ? "bg-blue-500/20 border-blue-400/30 text-blue-300 hover:bg-blue-500 hover:text-white"
                      : "bg-white/10 border-white/30 text-white hover:bg-white hover:text-blue-700"
                  }`}
                >
                  <FaSignInAlt />
                  <span className="hidden lg:inline">เข้าสู่ระบบ</span>
                </Link>
              )}
            </div>

            {/* Hamburger Menu Button - Mobile Only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <FaTimes className="text-xl" />
              ) : (
                <FaBars className="text-xl" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } ${
          isDarkMode
            ? "bg-slate-900"
            : "bg-gradient-to-b from-blue-600 to-blue-700"
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-white font-bold text-lg">เมนู</span>
          <button
            onClick={closeMobileMenu}
            className="p-2 text-white/80 hover:text-white cursor-pointer"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className="p-4 space-y-2">
          {/* User Info (if logged in) */}
          {studentInfo && (
            <div
              className={`p-4 rounded-xl mb-4 ${
                isDarkMode ? "bg-slate-800" : "bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${
                    isDarkMode
                      ? "bg-gradient-to-br from-blue-400 to-cyan-400 text-slate-900"
                      : "bg-gradient-to-br from-yellow-200 to-yellow-500 text-blue-900"
                  }`}
                >
                  {studentInfo.profileImage ? (
                    <img
                      src={studentInfo.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold">
                      {studentInfo.firstName?.[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-white font-bold">
                    {studentInfo.firstName || studentInfo.username}
                  </p>
                  <p className="text-white/60 text-sm">นักเรียน</p>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-white/10 my-2"></div>

          {/* Login/Logout Buttons */}
          {studentInfo ? (
            <>
              <Link
                to="/profile"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 p-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FaUser className="text-lg" />
                <span className="font-medium">โปรไฟล์</span>
              </Link>
              <Link
                to="/my-progress"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 p-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FaChartLine className="text-lg" />
                <span className="font-medium">ความก้าวหน้าบทเรียน</span>
              </Link>

              {/* Divider */}
              <div className="border-t border-white/10 my-2"></div>

              <Link
                to="/my-tests"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 p-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FaClipboardCheck className="text-lg" />
                <span className="font-medium">แบบทดสอบ</span>
              </Link>
              <Link
                to="/my-final-exam"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 p-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FaTrophy className="text-lg" />
                <span className="font-medium">Final Exam</span>
              </Link>

              {/* Divider */}
              <div className="border-t border-white/10 my-2"></div>

              <Link
                to="/worksheets"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 p-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FaFileAlt className="text-lg" />
                <span className="font-medium">ใบงาน</span>
              </Link>

              <Link
                to="/contact-admin"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 p-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FaHeadset className="text-lg" />
                <span className="font-medium">ติดต่อแอดมิน</span>
              </Link>

              {/* Divider */}
              <div className="border-t border-white/10 my-2"></div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors w-full cursor-pointer"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="font-medium">ออกจากระบบ</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={closeMobileMenu}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl font-bold transition-colors ${
                isDarkMode
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-white text-blue-700 hover:bg-blue-50"
              }`}
            >
              <FaSignInAlt />
              <span>เข้าสู่ระบบ</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
