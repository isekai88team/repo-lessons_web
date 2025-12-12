import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaEdit,
  FaSave,
  FaTimes,
  FaLock,
  FaArrowLeft,
  FaSpinner,
  FaSchool,
  FaCrop,
  FaCheck,
  FaChartLine,
  FaClipboardList,
  FaClipboardCheck,
  FaTrophy,
  FaBook,
} from "react-icons/fa";
import getBaseUrl from "../../untils/baseURL";
import { useTheme } from "../../context/ThemeContext";

const StudentProfile = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [student, setStudent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [progressData, setProgressData] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Image Crop States
  const [showCropModal, setShowCropModal] = useState(false);
  const [srcImage, setSrcImage] = useState(null);
  const [crop, setCrop] = useState({ unit: "%", width: 80, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  // Generate cropped image from canvas
  const getCroppedImg = useCallback(() => {
    if (!completedCrop || !imgRef.current) return null;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const outputSize = 300;
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize
    );

    return canvas.toDataURL("image/jpeg", 0.8);
  }, [completedCrop]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ไฟล์ขนาดใหญ่เกินไป (ไม่เกิน 5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSrcImage(reader.result);
        setShowCropModal(true);
        setCrop({ unit: "%", width: 80, aspect: 1 });
        setCompletedCrop(null);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleCropComplete = () => {
    const croppedImageUrl = getCroppedImg();
    if (croppedImageUrl) {
      setEditForm((prev) => ({ ...prev, profileImage: croppedImageUrl }));
      toast.success("ครอปรูปสำเร็จ!", { icon: "✂️" });
    }
    setShowCropModal(false);
    setSrcImage(null);
  };

  const onImageLoad = useCallback((e) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const size = Math.min(width, height) * 0.8;
    const x = (width - size) / 2;
    const y = (height - size) / 2;
    setCrop({ unit: "px", width: size, height: size, x, y });
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch profile and progress in parallel
      const [profileRes, progressRes] = await Promise.all([
        fetch(`${getBaseUrl()}/api/students/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${getBaseUrl()}/api/students/my-progress`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!profileRes.ok) throw new Error("Failed to fetch profile");

      const profileData = await profileRes.json();
      setStudent(profileData.student);
      setEditForm(profileData.student);

      if (progressRes.ok) {
        const progressDataRes = await progressRes.json();
        setProgressData(progressDataRes);
      }
    } catch (error) {
      console.error(error);
      toast.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("studentToken");
      const response = await fetch(`${getBaseUrl()}/api/students/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const data = await response.json();
      setStudent(data.student);
      setIsEditing(false);
      toast.success("บันทึกข้อมูลสำเร็จ!", { icon: "✅" });
      localStorage.setItem("studentInfo", JSON.stringify(data.student));
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error(error);
      toast.error("บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("studentToken");
      const response = await fetch(
        `${getBaseUrl()}/api/students/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to change password");

      toast.success("เปลี่ยนรหัสผ่านสำเร็จ!", { icon: "🔐" });
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  // Get all chapters with test data
  const getAllChaptersWithTests = () => {
    if (!progressData?.subjects) return [];
    const chapters = [];
    progressData.subjects.forEach((subject) => {
      subject.chapters?.forEach((chapter) => {
        chapters.push({
          ...chapter,
          subjectName: subject.subject.subject_name,
        });
      });
    });
    return chapters;
  };

  const chaptersWithTests = getAllChaptersWithTests();

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-slate-900" : "bg-blue-50"
        }`}
      >
        <FaSpinner className="animate-spin text-5xl text-blue-500" />
      </div>
    );
  }

  if (!student) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-slate-900" : "bg-blue-50"
        }`}
      >
        <div className="text-center">
          <p
            className={`text-xl mb-4 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            ไม่พบข้อมูลโปรไฟล์
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-8 px-4 transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-blue-50 via-white to-blue-50"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`p-3 rounded-xl shadow-md hover:shadow-lg transition ${
              isDarkMode
                ? "bg-slate-800 text-blue-400 hover:bg-slate-700"
                : "bg-white text-blue-600 hover:bg-blue-50"
            }`}
          >
            <FaArrowLeft />
          </button>
          <h1
            className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-blue-700"
            }`}
          >
            โปรไฟล์ของฉัน
          </h1>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div
              className={`rounded-3xl shadow-xl overflow-hidden ${
                isDarkMode ? "bg-slate-800" : "bg-white"
              }`}
            >
              {/* Cover + Avatar */}
              <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                  <div className="relative">
                    <div
                      className={`w-32 h-32 rounded-full border-4 overflow-hidden shadow-lg ${
                        isDarkMode
                          ? "border-slate-800 bg-slate-700"
                          : "border-white bg-gray-200"
                      }`}
                    >
                      {(
                        isEditing ? editForm.profileImage : student.profileImage
                      ) ? (
                        <img
                          src={
                            isEditing
                              ? editForm.profileImage
                              : student.profileImage
                          }
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <span className="text-4xl font-bold text-white">
                            {student.firstName?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition">
                        <FaCrop className="text-white text-sm" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="pt-20 pb-4 px-6 text-center">
                <h2
                  className={`text-xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {student.firstName} {student.lastName}
                </h2>
                <p className={isDarkMode ? "text-slate-400" : "text-gray-500"}>
                  @{student.username}
                </p>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                    isDarkMode
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <FaSchool className="text-xs" />
                  {student.classRoom}
                </span>
              </div>

              {/* Info List */}
              <div className="px-6 pb-4 space-y-3">
                {[
                  { icon: FaUser, label: "ชื่อ", value: student.firstName },
                  { icon: FaUser, label: "นามสกุล", value: student.lastName },
                  { icon: FaEnvelope, label: "อีเมล", value: student.email },
                  { icon: FaPhone, label: "เบอร์โทร", value: student.phone },
                  {
                    icon: FaBirthdayCake,
                    label: "วันเกิด",
                    value: student.dateOfBirth
                      ? new Date(student.dateOfBirth).toLocaleDateString(
                          "th-TH",
                          { day: "numeric", month: "short", year: "numeric" }
                        )
                      : null,
                  },
                ].map(({ icon: Icon, label, value }, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isDarkMode ? "bg-blue-500/20" : "bg-blue-50"
                      }`}
                    >
                      <Icon className="text-blue-500 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-slate-500" : "text-gray-400"
                        }`}
                      >
                        {label}
                      </p>
                      <p
                        className={`text-sm font-medium truncate ${
                          isDarkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {value || "-"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="p-6 pt-2 space-y-2">
                <button
                  onClick={() =>
                    isEditing ? handleSave() : setIsEditing(true)
                  }
                  disabled={saving}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {saving ? (
                    <FaSpinner className="animate-spin" />
                  ) : isEditing ? (
                    <FaSave />
                  ) : (
                    <FaEdit />
                  )}
                  {isEditing ? "บันทึก" : "แก้ไขโปรไฟล์"}
                </button>
                {isEditing && (
                  <button
                    onClick={() => {
                      setEditForm(student);
                      setIsEditing(false);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl border font-medium flex items-center justify-center gap-2 transition ${
                      isDarkMode
                        ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <FaTimes /> ยกเลิก
                  </button>
                )}
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className={`w-full py-2.5 px-4 rounded-xl border font-medium flex items-center justify-center gap-2 transition ${
                    isDarkMode
                      ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <FaLock /> เปลี่ยนรหัสผ่าน
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Stats */}
            <div
              className={`rounded-2xl p-6 shadow-lg ${
                isDarkMode ? "bg-slate-800" : "bg-white"
              }`}
            >
              <h3
                className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                <FaChartLine className="text-blue-500" />
                สถิติการเรียน
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  className={`p-4 rounded-xl text-center ${
                    isDarkMode ? "bg-slate-700/50" : "bg-blue-50"
                  }`}
                >
                  <FaBook className="text-2xl text-blue-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-500">
                    {progressData?.subjects?.length || 0}
                  </p>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    วิชาทั้งหมด
                  </p>
                </div>
                <div
                  className={`p-4 rounded-xl text-center ${
                    isDarkMode ? "bg-slate-700/50" : "bg-green-50"
                  }`}
                >
                  <FaClipboardList className="text-2xl text-green-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-500">
                    {chaptersWithTests.filter(
                      (c) => c.progress?.pretestCompleted
                    ).length || 0}
                  </p>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    Pretest ที่ทำแล้ว
                  </p>
                </div>
                <div
                  className={`p-4 rounded-xl text-center ${
                    isDarkMode ? "bg-slate-700/50" : "bg-purple-50"
                  }`}
                >
                  <FaClipboardCheck className="text-2xl text-purple-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-purple-500">
                    {chaptersWithTests.filter(
                      (c) => c.progress?.posttestCompleted
                    ).length || 0}
                  </p>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    Posttest ที่ทำแล้ว
                  </p>
                </div>
                <div
                  className={`p-4 rounded-xl text-center ${
                    isDarkMode ? "bg-slate-700/50" : "bg-amber-50"
                  }`}
                >
                  <FaTrophy className="text-2xl text-amber-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-amber-500">
                    {progressData?.subjects?.filter(
                      (s) => s.finalExam?.result?.passed
                    ).length || 0}
                  </p>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    Final Exam ผ่าน
                  </p>
                </div>
              </div>
            </div>

            {/* Pretest & Posttest Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pretest Chart */}
              <div
                className={`rounded-2xl p-6 shadow-lg ${
                  isDarkMode ? "bg-slate-800" : "bg-white"
                }`}
              >
                <h3
                  className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  <FaClipboardList className="text-green-500" />
                  คะแนน Pretest
                </h3>
                <div className="space-y-3">
                  {chaptersWithTests.length > 0 ? (
                    chaptersWithTests.map((chapter, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs mb-1">
                          <span
                            className={`truncate max-w-[150px] ${
                              isDarkMode ? "text-slate-400" : "text-gray-600"
                            }`}
                          >
                            {chapter.chapter_name}
                          </span>
                          <span
                            className={
                              chapter.progress?.pretestCompleted
                                ? "text-green-500 font-bold"
                                : isDarkMode
                                ? "text-slate-500"
                                : "text-gray-400"
                            }
                          >
                            {chapter.progress?.pretestCompleted
                              ? `${chapter.progress.pretestPercentage}%`
                              : "-"}
                          </span>
                        </div>
                        <div
                          className={`h-6 rounded-lg overflow-hidden ${
                            isDarkMode ? "bg-slate-700" : "bg-gray-200"
                          }`}
                        >
                          <div
                            className="h-full rounded-lg bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                            style={{
                              width: `${
                                chapter.progress?.pretestPercentage || 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p
                      className={`text-center py-8 ${
                        isDarkMode ? "text-slate-500" : "text-gray-400"
                      }`}
                    >
                      ยังไม่มีข้อมูล
                    </p>
                  )}
                </div>
              </div>

              {/* Posttest Chart */}
              <div
                className={`rounded-2xl p-6 shadow-lg ${
                  isDarkMode ? "bg-slate-800" : "bg-white"
                }`}
              >
                <h3
                  className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  <FaClipboardCheck className="text-purple-500" />
                  คะแนน Posttest
                </h3>
                <div className="space-y-3">
                  {chaptersWithTests.length > 0 ? (
                    chaptersWithTests.map((chapter, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs mb-1">
                          <span
                            className={`truncate max-w-[150px] ${
                              isDarkMode ? "text-slate-400" : "text-gray-600"
                            }`}
                          >
                            {chapter.chapter_name}
                          </span>
                          <span
                            className={
                              chapter.progress?.posttestCompleted
                                ? "text-purple-500 font-bold"
                                : isDarkMode
                                ? "text-slate-500"
                                : "text-gray-400"
                            }
                          >
                            {chapter.progress?.posttestCompleted
                              ? `${chapter.progress.posttestPercentage}%`
                              : "-"}
                          </span>
                        </div>
                        <div
                          className={`h-6 rounded-lg overflow-hidden ${
                            isDarkMode ? "bg-slate-700" : "bg-gray-200"
                          }`}
                        >
                          <div
                            className="h-full rounded-lg bg-gradient-to-r from-purple-400 to-purple-500 transition-all duration-500"
                            style={{
                              width: `${
                                chapter.progress?.posttestPercentage || 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p
                      className={`text-center py-8 ${
                        isDarkMode ? "text-slate-500" : "text-gray-400"
                      }`}
                    >
                      ยังไม่มีข้อมูล
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Final Exam Results */}
            {progressData?.subjects?.some((s) => s.finalExam) && (
              <div
                className={`rounded-2xl p-6 shadow-lg ${
                  isDarkMode ? "bg-slate-800" : "bg-white"
                }`}
              >
                <h3
                  className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  <FaTrophy className="text-amber-500" />
                  ผลสอบ Final Exam
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {progressData.subjects
                    .filter((s) => s.finalExam)
                    .map((subject, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl flex items-center justify-between ${
                          subject.finalExam.result
                            ? subject.finalExam.result.passed
                              ? "bg-green-500/20 border border-green-500/30"
                              : "bg-red-500/20 border border-red-500/30"
                            : isDarkMode
                            ? "bg-slate-700/50"
                            : "bg-gray-100"
                        }`}
                      >
                        <div>
                          <p
                            className={`font-bold ${
                              isDarkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {subject.subject.subject_name}
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? "text-slate-400" : "text-gray-500"
                            }`}
                          >
                            {subject.finalExam.title}
                          </p>
                        </div>
                        {subject.finalExam.result ? (
                          <div className="text-right">
                            <p
                              className={`text-xl font-bold ${
                                subject.finalExam.result.passed
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {subject.finalExam.result.percentage}%
                            </p>
                            <p
                              className={`text-xs ${
                                subject.finalExam.result.passed
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {subject.finalExam.result.passed
                                ? "ผ่าน ✓"
                                : "ไม่ผ่าน ✗"}
                            </p>
                          </div>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-lg text-sm ${
                              isDarkMode
                                ? "bg-slate-600 text-slate-300"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            ยังไม่ได้ทำ
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Crop Modal */}
      {showCropModal && srcImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-2xl w-full max-w-lg overflow-hidden ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            <div
              className={`flex items-center justify-between p-4 border-b ${
                isDarkMode ? "border-slate-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaCrop className="text-blue-500" />
                <h3
                  className={`font-bold ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  ครอปรูปโปรไฟล์
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setSrcImage(null);
                }}
                className={`p-2 rounded-lg hover:bg-gray-500/20 ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-4 flex justify-center bg-gray-900/50">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                className="max-h-[50vh]"
              >
                <img
                  src={srcImage}
                  alt="Crop"
                  onLoad={onImageLoad}
                  className="max-h-[50vh] max-w-full"
                  style={{ objectFit: "contain" }}
                />
              </ReactCrop>
            </div>

            <div
              className={`flex gap-3 p-4 border-t ${
                isDarkMode ? "border-slate-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setSrcImage(null);
                }}
                className={`flex-1 py-3 px-4 rounded-xl border font-medium transition ${
                  isDarkMode
                    ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaTimes className="inline mr-2" />
                ยกเลิก
              </button>
              <button
                onClick={handleCropComplete}
                disabled={!completedCrop}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition disabled:opacity-50"
              >
                <FaCheck />
                ใช้รูปนี้
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-2xl w-full max-w-md p-6 ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              เปลี่ยนรหัสผ่าน
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {["currentPassword", "newPassword", "confirmPassword"].map(
                (field, i) => (
                  <div key={field}>
                    <label
                      className={`block text-sm mb-1 ${
                        isDarkMode ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      {
                        [
                          "รหัสผ่านปัจจุบัน",
                          "รหัสผ่านใหม่",
                          "ยืนยันรหัสผ่านใหม่",
                        ][i]
                      }
                    </label>
                    <input
                      type="password"
                      value={passwordForm[field]}
                      onChange={(e) =>
                        setPasswordForm((p) => ({
                          ...p,
                          [field]: e.target.value,
                        }))
                      }
                      className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500/30 ${
                        isDarkMode
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-white border-gray-200"
                      }`}
                      required
                      minLength={field !== "currentPassword" ? 6 : undefined}
                    />
                  </div>
                )
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className={`flex-1 py-3 px-4 rounded-xl border font-medium ${
                    isDarkMode
                      ? "border-slate-600 text-slate-300"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaLock />}
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
