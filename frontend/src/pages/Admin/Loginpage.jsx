import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginAdminMutation } from "../../redux/features/admin/adminApi";
import { FaLock, FaUser, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const [loginAdmin, { isLoading }] = useLoginAdminMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const result = await loginAdmin({ username, password }).unwrap();

      // Store token in localStorage
      if (result.token) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("adminUser", JSON.stringify(result.user));
      }

      // Redirect to admin dashboard
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage(
        error?.data?.message || "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#272829] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(#D8D9DA 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      {/* Decorative Circles */}
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#61677A] opacity-10 blur-3xl"></div>
      <div className="absolute bottom-[-150px] left-[-100px] w-[400px] h-[400px] rounded-full bg-[#FFF6E0] opacity-5 blur-3xl"></div>

      {/* Login Card */}
      <div className="relative bg-[#363739] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-[#61677A]/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#272829] to-[#61677A] px-8 py-10 text-center relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFF6E0] opacity-5 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D8D9DA] opacity-5 rounded-tr-full"></div>

          <div className="w-16 h-16 mx-auto bg-[#FFF6E0]/10 rounded-2xl flex items-center justify-center mb-4 border border-[#FFF6E0]/20 backdrop-blur-sm">
            <span className="text-[#FFF6E0] text-2xl font-bold">IS</span>
          </div>
          <h1 className="text-[#FFF6E0] text-2xl font-bold">Admin Login</h1>
          <p className="text-[#D8D9DA] text-sm mt-2">
            เข้าสู่ระบบเพื่อจัดการข้อมูล
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <span>⚠️</span>
              {errorMessage}
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#D8D9DA]">
              ชื่อผู้ใช้
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#61677A]">
                <FaUser />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-[#272829] border border-[#61677A]/50 rounded-xl text-[#FFF6E0] placeholder-[#61677A] focus:outline-none focus:ring-2 focus:ring-[#FFF6E0]/30 focus:border-[#FFF6E0]/50 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#D8D9DA]">
              รหัสผ่าน
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#61677A]">
                <FaLock />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                required
                className="w-full pl-12 pr-12 py-3.5 bg-[#272829] border border-[#61677A]/50 rounded-xl text-[#FFF6E0] placeholder-[#61677A] focus:outline-none focus:ring-2 focus:ring-[#FFF6E0]/30 focus:border-[#FFF6E0]/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#61677A] hover:text-[#D8D9DA] transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-[#D8D9DA] cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[#61677A] bg-[#272829] text-[#FFF6E0] focus:ring-[#FFF6E0]/30"
              />
              <span>จดจำฉัน</span>
            </label>
            <a
              href="#"
              className="text-[#D8D9DA] hover:text-[#FFF6E0] transition-colors"
            >
              ลืมรหัสผ่าน?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#61677A] to-[#272829] hover:from-[#FFF6E0] hover:to-[#D8D9DA] hover:text-[#272829] disabled:opacity-50 text-[#FFF6E0] font-bold py-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] border border-[#61677A]/50"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              <span>เข้าสู่ระบบ</span>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#61677A]/30"></div>
            <span className="text-[#61677A] text-xs">ISEKAI ADMIN</span>
            <div className="flex-1 h-px bg-[#61677A]/30"></div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-[#61677A]">
            ระบบจัดการสำหรับผู้ดูแลระบบเท่านั้น
          </p>
        </form>
      </div>

      {/* Version Badge */}
      <div className="absolute bottom-4 right-4 text-[#61677A] text-xs">
        v1.0.0
      </div>
    </div>
  );
};

export default LoginPage;
