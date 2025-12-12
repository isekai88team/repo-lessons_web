import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSpinner,
  FaUser,
  FaLock,
  FaGraduationCap,
  FaBook,
} from "react-icons/fa";
import getBaseUrl from "../../untils/baseURL";

const StudentLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${getBaseUrl()}/api/students/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "เข้าสู่ระบบไม่สำเร็จ");
      }

      // Save token and student info
      localStorage.setItem("studentToken", data.token);
      localStorage.setItem("studentInfo", JSON.stringify(data.user));

      // Trigger storage event for Navbar to update
      window.dispatchEvent(new Event("storage"));

      // Redirect to lessons or previous page
      const returnUrl = localStorage.getItem("returnUrl") || "/";
      localStorage.removeItem("returnUrl");
      navigate(returnUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Floating circles */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-48 h-48 bg-cyan-400/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Floating education icons */}
        <div
          className="absolute top-20 right-20 text-cyan-500/10 text-6xl animate-bounce"
          style={{ animationDuration: "3s" }}
        >
          <FaGraduationCap />
        </div>
        <div
          className="absolute bottom-32 left-20 text-blue-500/10 text-5xl animate-bounce"
          style={{ animationDuration: "4s", animationDelay: "0.5s" }}
        >
          <FaBook />
        </div>
        <div className="absolute top-1/3 right-1/4 text-cyan-500/5 text-8xl">
          <FaGraduationCap />
        </div>
      </div>

      <div className="bg-[#1e293b]/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md relative z-10 border border-cyan-500/20">
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 opacity-5 blur-sm -z-10"></div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30 transform hover:scale-105 transition-transform duration-300">
            <FaGraduationCap className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            เข้าสู่ระบบนักเรียน
          </h1>
          <p className="text-gray-400">ISEKAI TEAM Education Platform</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="h-1 w-12 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></span>
            <span className="h-1 w-4 bg-cyan-500/50 rounded-full"></span>
            <span className="h-1 w-2 bg-blue-500/50 rounded-full"></span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              ชื่อผู้ใช้
            </label>
            <div className="relative group">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a]/80 border-2 border-gray-700 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all duration-300 text-white placeholder-gray-500"
                placeholder="กรอกชื่อผู้ใช้"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              รหัสผ่าน
            </label>
            <div className="relative group">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a]/80 border-2 border-gray-700 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all duration-300 text-white placeholder-gray-500"
                placeholder="กรอกรหัสผ่าน"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              <>
                <span>เข้าสู่ระบบ</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">
                  →
                </span>
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-cyan-400 hover:text-cyan-300 hover:underline text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-2 mx-auto group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            <span>กลับหน้าหลัก</span>
          </button>
        </div>

        {/* Footer decoration */}
        <div className="mt-8 pt-6 border-t border-gray-700/50 text-center">
          <p className="text-xs text-gray-500">
            🎓 พร้อมเรียนรู้สิ่งใหม่ๆ ไปด้วยกัน
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
