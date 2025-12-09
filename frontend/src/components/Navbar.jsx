import React from "react";
import { FaBell, FaChevronDown, FaUserCircle, FaSearch } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-[#44624A] shadow-lg shadow-[#44624A]/20 font-sans">
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        {/* --- Left Side: Brand Identity --- */}
        <div className="flex items-center gap-4 cursor-pointer">
          {/* Logo Icon */}
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-lg tracking-tight">
              IS
            </span>
          </div>
          {/* Brand Name */}
          <div className="flex flex-col leading-tight">
            <span className="text-white font-bold text-lg tracking-wide">
              ISEKAI TEAM
            </span>
            <span className="text-white/60 text-[10px] uppercase tracking-widest">
              Education Platform
            </span>
          </div>
        </div>

        {/* --- Center: Navigation Menu (Hidden on mobile) --- */}
        <div className="hidden md:flex items-center bg-[#354e3a]/50 rounded-full px-2 py-1 border border-white/5 backdrop-blur-md">
          {/* Active Link Example */}
          <a
            href="#"
            className="px-5 py-2 rounded-full bg-white text-[#44624A] font-bold text-sm shadow-sm transition-all"
          >
            หน้าหลัก
          </a>

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
        <div className="flex items-center gap-4 md:gap-6">
          {/* Search Icon (Optional utility) */}
          <button className="text-white/70 hover:text-white transition-colors p-2">
            <FaSearch />
          </button>

          {/* Notification */}
          <button className="relative text-white/70 hover:text-white transition-colors p-2 group">
            <FaBell className="text-lg group-hover:swing" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-400 rounded-full ring-2 ring-[#44624A]"></span>
          </button>

          {/* Profile Divider */}
          <div className="h-8 w-px bg-white/10 hidden md:block"></div>

          {/* User Profile Button */}
          <button className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full border border-white/20 hover:bg-white/10 transition-all group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-500 flex items-center justify-center text-[#44624A] shadow-sm">
              <FaUserCircle className="text-xl opacity-80" />
            </div>
            <div className="flex flex-col items-start hidden sm:block">
              <span className="text-white text-xs font-bold group-hover:text-yellow-200 transition-colors">
                บัญชีของฉัน
              </span>
              <span className="text-white/50 text-[10px]">Student</span>
            </div>
            <FaChevronDown className="text-[10px] text-white/50 ml-1 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
