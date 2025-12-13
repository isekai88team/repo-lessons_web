import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCreateWorksheetMutation } from "../../redux/features/admin/adminApi";
import {
  FaFileAlt,
  FaSpinner,
  FaArrowLeft,
  FaImage,
  FaFilePdf,
  FaFileWord,
  FaPlus,
  FaTimes,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const AddWorksheet = () => {
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const [createWorksheet, { isLoading }] = useCreateWorksheetMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isActive: true,
  });
  const [deadlineDate, setDeadlineDate] = useState(null);
  const [deadlineTime, setDeadlineTime] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [documentFile, setDocumentFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...imageFiles, ...files].slice(0, 10); // Max 10 images
    setImageFiles(newImages);

    // Create previews
    const previews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newImages = imageFiles.filter((_, i) => i !== index);
    setImageFiles(newImages);

    // Revoke old preview URL
    URL.revokeObjectURL(imagePreviews[index]);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
  };

  const handleDocumentSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
    }
  };

  const removeDocument = () => {
    setDocumentFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("กรุณากรอกชื่อใบงาน");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("isActive", formData.isActive);

      // Combine date and time into deadline
      if (deadlineDate) {
        const combined = new Date(deadlineDate);
        if (deadlineTime) {
          combined.setHours(deadlineTime.getHours(), deadlineTime.getMinutes());
        } else {
          combined.setHours(23, 59);
        }
        formDataToSend.append("deadline", combined.toISOString());
      }

      // Append images
      imageFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      // Append document
      if (documentFile) {
        formDataToSend.append("document", documentFile);
      }

      await createWorksheet(formDataToSend).unwrap();
      toast.success("สร้างใบงานสำเร็จ! 🎉");
      setTimeout(() => navigate("/admin/worksheets"), 1000);
    } catch (error) {
      toast.error(error?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const inputStyle = {
    backgroundColor: isDarkMode ? colors.background : "#F5F6F7",
    border: `1px solid ${colors.border}`,
    color: colors.text,
  };

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
          onClick={() => navigate("/admin/worksheets")}
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
            <FaFileAlt style={{ color: "#10B981" }} />
            เพิ่มใบงานใหม่
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            สร้างใบงานพร้อมแนบรูปภาพและเอกสาร
          </p>
        </div>
      </div>

      <div
        className="max-w-3xl mx-auto rounded-2xl shadow-lg overflow-hidden"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}30`,
        }}
      >
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              ชื่อใบงาน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl focus:outline-none"
              style={inputStyle}
              placeholder="เช่น ใบงานที่ 1 - เรื่องพื้นฐาน"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              รายละเอียด
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
              style={inputStyle}
              placeholder="อธิบายเกี่ยวกับใบงานนี้..."
            />
          </div>

          {/* Deadline */}
          <div className="space-y-3">
            <label
              className="text-sm font-medium flex items-center gap-2"
              style={{ color: colors.textSecondary }}
            >
              <FaCalendarAlt style={{ color: "#F59E0B" }} /> กำหนดส่ง
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={inputStyle}
              >
                <FaCalendarAlt
                  className="text-lg"
                  style={{ color: "#FCD34D" }}
                />
                <div className="flex-1">
                  <p
                    className="text-xs mb-1"
                    style={{ color: colors.textSecondary }}
                  >
                    วันที่
                  </p>
                  <DatePicker
                    selected={deadlineDate}
                    onChange={(date) => setDeadlineDate(date)}
                    dateFormat="dd/MM/yyyy"
                    locale={th}
                    placeholderText="เลือกวันที่"
                    className="w-full bg-transparent focus:outline-none cursor-pointer"
                    wrapperClassName="w-full"
                    popperPlacement="bottom-start"
                  />
                </div>
              </div>
              {/* Time */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={inputStyle}
              >
                <FaClock className="text-lg" style={{ color: "#93C5FD" }} />
                <div className="flex-1">
                  <p
                    className="text-xs mb-1"
                    style={{ color: colors.textSecondary }}
                  >
                    เวลา
                  </p>
                  <DatePicker
                    selected={deadlineTime}
                    onChange={(date) => setDeadlineTime(date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="เวลา"
                    dateFormat="HH:mm น."
                    placeholderText="เลือกเวลา"
                    className="w-full bg-transparent focus:outline-none cursor-pointer"
                    wrapperClassName="w-full"
                    popperPlacement="bottom-start"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <label
              className="text-sm font-medium flex items-center gap-2"
              style={{ color: colors.textSecondary }}
            >
              <FaImage style={{ color: "#3B82F6" }} /> รูปภาพ (สูงสุด 10 รูป)
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />

            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}

              {imageFiles.length < 10 && (
                <label
                  htmlFor="image-upload"
                  className="w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                  style={{ borderColor: colors.border }}
                >
                  <FaPlus style={{ color: colors.textSecondary }} />
                  <span
                    className="text-xs mt-1"
                    style={{ color: colors.textSecondary }}
                  >
                    เพิ่มรูป
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-3">
            <label
              className="text-sm font-medium flex items-center gap-2"
              style={{ color: colors.textSecondary }}
            >
              <FaFilePdf style={{ color: "#EF4444" }} /> เอกสาร (PDF/DOC)
            </label>

            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleDocumentSelect}
              className="hidden"
              id="document-upload"
            />

            {documentFile ? (
              <div
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.05)"
                    : "#F5F6F7",
                }}
              >
                {documentFile.name.endsWith(".pdf") ? (
                  <FaFilePdf className="text-2xl text-red-500" />
                ) : (
                  <FaFileWord className="text-2xl text-blue-600" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium truncate"
                    style={{ color: colors.text }}
                  >
                    {documentFile.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeDocument}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-red-500"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <label
                htmlFor="document-upload"
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed cursor-pointer hover:border-orange-500 transition-colors"
                style={{ borderColor: colors.border }}
              >
                <FaFilePdf
                  className="text-3xl mb-2"
                  style={{ color: colors.textSecondary }}
                />
                <span style={{ color: colors.textSecondary }}>
                  คลิกเพื่อเลือกไฟล์ PDF หรือ DOC
                </span>
              </label>
            )}
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3 pt-4">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5 rounded"
            />
            <span style={{ color: colors.text }}>เปิดใช้งานทันที</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/worksheets")}
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
              className="flex-1 py-3 px-6 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: "#10B981", color: "#FFF" }}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>กำลังสร้าง...</span>
                </>
              ) : (
                <span>สร้างใบงาน</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorksheet;
