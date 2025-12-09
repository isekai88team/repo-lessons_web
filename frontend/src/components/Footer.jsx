import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowRight,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#111111] text-gray-400 font-sans relative pt-16 pb-8 overflow-hidden">
      {/* Decorative Gradient Glow (Optional: เพื่อให้ไม่ดูดำมืดจนเกินไป) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-[#44624A] opacity-50 blur-[50px] rounded-full"></div>

      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* --- Col 1: Brand Info --- */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#44624A] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#44624A]/20">
                IS
              </div>
              <div>
                <h3 className="text-white text-xl font-bold tracking-wide">
                  ISEKAI TEAM
                </h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest">
                  Education Platform
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              แพลตฟอร์มการเรียนรู้ออนไลน์ที่มุ่งเน้นการพัฒนาศักยภาพผู้เรียนด้วยนวัตกรรมและสื่อการสอนที่ทันสมัย
              เข้าใจง่าย ใช้ได้จริง
            </p>
            <div className="flex gap-4">
              {/* Social Icons */}
              {[FaFacebookF, FaTwitter, FaYoutube, FaInstagram].map(
                (Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#44624A] hover:text-white transition-all duration-300"
                  >
                    <Icon size={14} />
                  </a>
                )
              )}
            </div>
          </div>

          {/* --- Col 2: Quick Links --- */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 relative inline-block">
              เมนูหลัก
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-[#44624A]"></span>
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                "หน้าแรก",
                "เกี่ยวกับเรา",
                "บทเรียนทั้งหมด",
                "คลังข้อสอบ",
                "ทีมงานผู้สอน",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="flex items-center gap-2 hover:text-[#44624A] hover:translate-x-1 transition-all duration-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#44624A] opacity-0 hover:opacity-100 transition-opacity"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* --- Col 3: Contact Info --- */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 relative inline-block">
              ติดต่อเรา
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-[#44624A]"></span>
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 text-[#44624A]" />
                <span>
                  999 อาคารนวัตกรรม ชั้น 5<br />
                  เขตปทุมวัน กรุงเทพฯ 10330
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-[#44624A]" />
                <span>02-123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-[#44624A]" />
                <span>contact@isekai-team.com</span>
              </li>
            </ul>
          </div>

          {/* --- Col 4: Newsletter --- */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">
              รับข่าวสารใหม่ๆ
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              ลงทะเบียนเพื่อรับข้อมูลอัปเดตเกี่ยวกับบทเรียนใหม่และโปรโมชั่นพิเศษ
            </p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="อีเมลของคุณ"
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#44624A] transition-colors"
              />
              <button className="bg-[#44624A] hover:bg-[#354e3a] text-white text-sm font-bold py-3 rounded-lg shadow-lg shadow-[#44624A]/20 transition-all flex items-center justify-center gap-2 group">
                สมัครรับข่าวสาร
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Isekai Team. สงวนลิขสิทธิ์</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              นโยบายความเป็นส่วนตัว
            </a>
            <a href="#" className="hover:text-white transition-colors">
              ข้อตกลงการใช้งาน
            </a>
            <a href="#" className="hover:text-white transition-colors">
              ช่วยเหลือ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
