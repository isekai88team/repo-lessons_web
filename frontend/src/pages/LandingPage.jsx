import React, { useState } from "react";

import {
  FaChevronDown,
  FaChevronUp,
  FaBook,
  FaPlay,
  FaGraduationCap,
} from "react-icons/fa";

const LandingPage = () => {
  const [isObjectiveOpen, setIsObjectiveOpen] = useState(true);

  const objectives = [
    "1. ความหมายและหน้าที่ของระบบหมุนเวียนเลือด",
    "2. ส่วนประกอบสำคัญของเลือด",
    "3. โครงสร้างและการทำงานของหัวใจ",
    "4. หลอดเลือดชนิดต่างๆ ในร่างกาย",
    "5. วงจรการไหลเวียนเลือด",
    "6. โรคที่เกี่ยวข้องและการดูแลรักษา",
  ];

  return (
    <div className="min-h-screen bg-[#44624A] relative overflow-x-hidden flex flex-col font-sans">
      {/* --- Background Pattern (Grid & Glow) --- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
        {/* Soft Glow Top Right */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
      </div>

      {/* --- Navbar Placeholder --- */}

      {/* --- Main Content --- */}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-12 flex items-center justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl items-start lg:items-center">
          {/* --- Column Left: Syllabus / Objectives --- */}
          <div className="lg:col-span-5 flex flex-col gap-6 order-2 lg:order-1">
            <div className="text-white mb-2">
              <h4 className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">
                Course Outline
              </h4>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                ทำความเข้าใจ
                <br />
                <span className="text-[#A3C9A8]">ระบบร่างกายมนุษย์</span>
              </h1>
            </div>

            {/* Objectives Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <button
                onClick={() => setIsObjectiveOpen(!isObjectiveOpen)}
                className="w-full flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100 transition-colors hover:bg-gray-50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#44624A]/10 text-[#44624A] flex items-center justify-center">
                    <FaBook className="text-sm" />
                  </div>
                  <span className="font-bold text-[#44624A] text-lg">
                    วัตถุประสงค์การเรียนรู้
                  </span>
                </div>
                {isObjectiveOpen ? (
                  <FaChevronUp className="text-gray-400" />
                ) : (
                  <FaChevronDown className="text-gray-400 group-hover:text-[#44624A]" />
                )}
              </button>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isObjectiveOpen
                    ? "max-h-[400px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="py-2">
                  {objectives.map((obj, index) => (
                    <div
                      key={index}
                      className="px-6 py-3 border-l-4 border-transparent hover:border-[#44624A] hover:bg-[#44624A]/5 cursor-pointer transition-all flex items-start gap-3 group"
                    >
                      <span className="text-xs font-bold text-gray-400 mt-1 group-hover:text-[#44624A]">
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                      <span className="text-gray-700 text-sm group-hover:text-black font-medium">
                        {obj}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
                  * เนื้อหาอ้างอิงจากหลักสูตรแกนกลางฯ สสวท.
                </div>
              </div>
            </div>
            <h1 className="text-white text-l">
              const description = `Lorem ipsum dolor sit amet, consectetur
              adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo
              consequat. Duis aute irure dolor in reprehenderit in voluptate
              velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
              occaecat cupidatat non proident, sunt in culpa qui officia
              deserunt mollit anim id est laborum.`;
            </h1>
          </div>

          {/* --- Column Right: Main Hero Card --- */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end order-1 lg:order-2 relative">
            {/* Decorative Circle behind card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#ffffff] opacity-5 rounded-full blur-3xl -z-10"></div>

            {/* The Card */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-w-md w-full relative group hover:-translate-y-2 transition-transform duration-500 ease-out">
              {/* Badge Top */}
              <div className="flex justify-between items-start mb-6">
                <span className="bg-[#44624A] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
                  บทเรียนที่ 1
                </span>
                <span className="flex items-center gap-1 text-gray-400 text-sm">
                  <FaBook /> 9 หัวข้อ
                </span>
              </div>

              {/* Title Section */}
              <div className="mb-6">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
                  ระบบ
                  <br />
                  หมุนเวียนเลือด
                </h2>
                <p className="text-[#44624A] font-medium text-lg">
                  Circulatory System
                </p>
              </div>

              {/* Image Placeholder (Replacing the missing asset with a div for demo) */}
              <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden">
                {/* ใส่รูปจริงตรงนี้: <img src={heroImage} ... /> */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                  {/* Mock Illustration */}
                  <FaGraduationCap size={80} className="text-gray-300/50" />
                </div>
                <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-white/80 to-transparent"></div>
              </div>

              {/* Footer Info & Button */}
              <div className="flex flex-col gap-6">
                {/* Teacher Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
                    {/* Avatar placeholder */}
                    <div className="w-full h-full bg-gray-300"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      สุนิสา แสงมงคลพิพัฒน์
                    </p>
                    <p className="text-xs text-gray-500">
                      สาขาวิชาวิทยาศาสตร์ภาคบังคับ สสวท.
                    </p>
                  </div>
                </div>

                {/* Main CTA Button - แยกสีชัดเจน */}
                <button className="w-full bg-[#44624A] hover:bg-[#354e3a] text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-[#44624A]/30 flex items-center justify-center gap-3 transition-all active:scale-95">
                  <span>เข้าสู่บทเรียน</span>
                  <div className="bg-white/20 p-1.5 rounded-full">
                    <FaPlay size={12} className="ml-0.5" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
