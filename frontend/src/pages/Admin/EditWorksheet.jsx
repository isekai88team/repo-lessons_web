import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useFetchWorksheetByIdQuery,
  useUpdateWorksheetMutation,
} from "../../redux/features/admin/adminApi";
import {
  FaFileAlt,
  FaSpinner,
  FaArrowLeft,
  FaImage,
  FaFilePdf,
  FaFileWord,
  FaPlus,
  FaTimes,
  FaSave,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { th } from "date-fns/locale";

const EditWorksheet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();

  const { data, isLoading, refetch } = useFetchWorksheetByIdQuery(id);
  const [updateWorksheet, { isLoading: isUpdating }] =
    useUpdateWorksheetMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isActive: true,
  });
  const [deadlineDate, setDeadlineDate] = useState(null);
  const [deadlineTime, setDeadlineTime] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [removeImageKeys, setRemoveImageKeys] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [existingDocument, setExistingDocument] = useState(null);
  const [removeDocument, setRemoveDocument] = useState(false);
  const [newDocumentFile, setNewDocumentFile] = useState(null);

  useEffect(() => {
    if (data?.worksheet) {
      const w = data.worksheet;
      setFormData({
        title: w.title || "",
        description: w.description || "",
        isActive: w.isActive !== false,
      });
      if (w.deadline) {
        const d = new Date(w.deadline);
        setDeadlineDate(d);
        setDeadlineTime(d);
      }
      setExistingImages(data.signedImages || w.images || []);
      setExistingDocument(data.signedDocument || w.document);
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNewImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalImages =
      existingImages.length -
      removeImageKeys.length +
      newImageFiles.length +
      files.length;
    const allowed = Math.min(
      files.length,
      10 -
        (existingImages.length - removeImageKeys.length + newImageFiles.length)
    );

    if (totalImages > 10) {
      toast.error("รูปภาพรวมได้สูงสุด 10 รูป");
    }

    const newFiles = [...newImageFiles, ...files.slice(0, allowed)];
    setNewImageFiles(newFiles);

    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setNewImagePreviews(previews);
  };

  const removeExistingImage = (key) => {
    setRemoveImageKeys([...removeImageKeys, key]);
    setExistingImages(existingImages.filter((img) => img.key !== key));
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  const handleDocumentSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewDocumentFile(file);
      setRemoveDocument(true);
    }
  };

  const removeExistingDocument = () => {
    setRemoveDocument(true);
    setExistingDocument(null);
  };

  const removeNewDocument = () => {
    setNewDocumentFile(null);
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
      } else {
        formDataToSend.append("deadline", "");
      }

      // Images to remove
      if (removeImageKeys.length > 0) {
        formDataToSend.append("removeImages", JSON.stringify(removeImageKeys));
      }

      // New images
      newImageFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      // Document removal
      if (removeDocument && !newDocumentFile) {
        formDataToSend.append("removeDocument", "true");
      }

      // New document
      if (newDocumentFile) {
        formDataToSend.append("document", newDocumentFile);
      }

      await updateWorksheet({ id, formData: formDataToSend }).unwrap();
      toast.success("อัปเดตใบงานสำเร็จ!");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  const inputStyle = {
    backgroundColor: isDarkMode ? colors.background : "#F5F6F7",
    border: `1px solid ${colors.border}`,
    color: colors.text,
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: colors.background }}
      >
        <FaSpinner
          className="animate-spin text-5xl"
          style={{ color: "#10B981" }}
        />
      </div>
    );
  }

  const worksheet = data?.worksheet;

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
        <div className="flex-1">
          <h1
            className="text-2xl font-bold flex items-center gap-3"
            style={{ color: colors.text }}
          >
            <FaFileAlt style={{ color: "#10B981" }} />
            แก้ไขใบงาน
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            {worksheet?.chapter?.chapter_name}
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isUpdating}
          className="flex items-center gap-2 px-5 py-3 font-bold rounded-xl"
          style={{ backgroundColor: "#22c55e", color: "#FFF" }}
        >
          {isUpdating ? <FaSpinner className="animate-spin" /> : <FaSave />}
          บันทึก
        </button>
      </div>

      <div
        className="max-w-3xl mx-auto rounded-2xl shadow-lg overflow-hidden"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}30`,
        }}
      >
        <div className="p-8 space-y-6">
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
              className="w-full px-4 py-3 rounded-xl focus:outline-none"
              style={inputStyle}
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

          {/* Existing Images */}
          <div className="space-y-3">
            <label
              className="text-sm font-medium flex items-center gap-2"
              style={{ color: colors.textSecondary }}
            >
              <FaImage style={{ color: "#3B82F6" }} /> รูปภาพ
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleNewImageSelect}
              className="hidden"
              id="new-image-upload"
            />

            <div className="flex flex-wrap gap-3">
              {/* Existing images */}
              {existingImages.map((img, index) => (
                <div key={img.key || index} className="relative">
                  <img
                    src={img.signedUrl || img.url}
                    alt={img.originalName}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.key)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}

              {/* New image previews */}
              {newImagePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative">
                  <img
                    src={preview}
                    alt={`New ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-xl border-2 border-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}

              {/* Add button */}
              {existingImages.length + newImageFiles.length < 10 && (
                <label
                  htmlFor="new-image-upload"
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

          {/* Document */}
          <div className="space-y-3">
            <label
              className="text-sm font-medium flex items-center gap-2"
              style={{ color: colors.textSecondary }}
            >
              <FaFilePdf style={{ color: "#EF4444" }} /> เอกสาร (PDF/DOC)
            </label>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleDocumentSelect}
              className="hidden"
              id="new-document-upload"
            />

            {/* Existing or New Document */}
            {(existingDocument && !removeDocument) || newDocumentFile ? (
              <div
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.05)"
                    : "#F5F6F7",
                }}
              >
                {newDocumentFile ? (
                  <>
                    {newDocumentFile.name.endsWith(".pdf") ? (
                      <FaFilePdf className="text-2xl text-red-500" />
                    ) : (
                      <FaFileWord className="text-2xl text-blue-600" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium truncate"
                        style={{ color: colors.text }}
                      >
                        {newDocumentFile.name}
                        <span className="ml-2 text-xs text-green-500">
                          (ใหม่)
                        </span>
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        {(newDocumentFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeNewDocument}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-500"
                    >
                      <FaTimes />
                    </button>
                  </>
                ) : (
                  <>
                    {existingDocument?.fileType === "pdf" ? (
                      <FaFilePdf className="text-2xl text-red-500" />
                    ) : (
                      <FaFileWord className="text-2xl text-blue-600" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium truncate"
                        style={{ color: colors.text }}
                      >
                        {existingDocument?.originalName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeExistingDocument}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-500"
                    >
                      <FaTimes />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <label
                htmlFor="new-document-upload"
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
            <span style={{ color: colors.text }}>เปิดใช้งาน</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditWorksheet;
