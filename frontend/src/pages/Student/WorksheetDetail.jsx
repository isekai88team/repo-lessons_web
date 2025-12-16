import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaFileAlt,
  FaSpinner,
  FaArrowLeft,
  FaUpload,
  FaCheckCircle,
  FaTimes,
  FaImage,
  FaFilePdf,
  FaFileWord,
  FaUsers,
  FaComment,
  FaUserCircle,
  FaUserPlus,
  FaCheck,
  FaDownload,
  FaExternalLinkAlt,
} from "react-icons/fa";
import getBaseUrl from "../../untils/baseURL";
import { useTheme } from "../../context/ThemeContext";

const FilePreviewModal = ({ file, onClose, isDarkMode }) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-5xl h-[85vh] rounded-xl flex flex-col shadow-2xl ${
          isDarkMode ? "bg-slate-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDarkMode ? "border-slate-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {file.type === "pdf" ? (
              <FaFilePdf className="text-red-500 text-xl flex-shrink-0" />
            ) : (
              <FaImage className="text-purple-500 text-xl flex-shrink-0" />
            )}
            <h3
              className={`font-medium truncate ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {file.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={file.url}
              download
              className={`p-2 rounded-lg transition ${
                isDarkMode
                  ? "hover:bg-slate-700 text-slate-300"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
              title="ดาวน์โหลด"
            >
              <FaDownload />
            </a>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition ${
                isDarkMode
                  ? "hover:bg-red-900/30 text-white hover:text-red-400"
                  : "hover:bg-red-50 text-gray-500 hover:text-red-500"
              }`}
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-gray-900 flex items-center justify-center relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
              <FaSpinner className="animate-spin text-4xl text-blue-500" />
            </div>
          )}

          {file.type === "pdf" ? (
            <iframe
              src={`${file.url}#toolbar=0`}
              className="w-full h-full"
              title="PDF Preview"
              onLoad={() => setIsLoading(false)}
            />
          ) : (
            <img
              src={file.url}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              onLoad={() => setIsLoading(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const WorksheetDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [worksheet, setWorksheet] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null); // Add state for preview
  const [classmates, setClassmates] = useState([]);
  const [classRoom, setClassRoom] = useState("");
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [showTeamSelect, setShowTeamSelect] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchWorksheet();
    fetchClassmates();
  }, [id]);

  const fetchWorksheet = async () => {
    try {
      const token = localStorage.getItem("studentToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${getBaseUrl()}/api/students/worksheets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      const ws = data.worksheets?.find((w) => w._id === id);
      if (ws) {
        setWorksheet(ws);
        // Load existing team members if any
        if (ws.submission?.teamMembers) {
          setSelectedTeam(ws.submission.teamMembers.map((m) => m._id || m));
        }
      } else {
        toast.error("ไม่พบใบงาน");
        navigate("/worksheets");
      }
    } catch (error) {
      console.error(error);
      toast.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchClassmates = async () => {
    try {
      const token = localStorage.getItem("studentToken");
      const response = await fetch(`${getBaseUrl()}/api/students/classmates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setClassmates(data.classmates || []);
        setClassRoom(data.classRoom || "");
      }
    } catch (error) {
      console.error("Error fetching classmates:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "ไม่มีกำหนด";
    return new Date(dateString).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error("ไฟล์ใหญ่เกินไป (สูงสุด 20MB)");
        return;
      }
      setSelectedFile(file);
    }
  };

  const toggleTeamMember = (mateId) => {
    setSelectedTeam((prev) =>
      prev.includes(mateId)
        ? prev.filter((id) => id !== mateId)
        : [...prev, mateId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedFile || !worksheet) return;

    setUploading(true);
    try {
      const token = localStorage.getItem("studentToken");
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("teamMembers", JSON.stringify(selectedTeam));

      const response = await fetch(
        `${getBaseUrl()}/api/students/worksheets/${worksheet._id}/submit`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast.success("ส่งงานสำเร็จ!");
      setSelectedFile(null);
      fetchWorksheet();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "เกิดข้อผิดพลาด");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelSubmission = () => {
    setSelectedFile(null);
    setSelectedTeam([]);
    toast.success("ยกเลิกแล้ว");
  };

  const getFileIcon = (type) => {
    if (type === "image") return <FaImage className="text-purple-500" />;
    if (type === "pdf") return <FaFilePdf className="text-red-500" />;
    if (type === "doc") return <FaFileWord className="text-blue-500" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  const getClassmateById = (mateId) => {
    return classmates.find((m) => m._id === mateId);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-slate-900" : "bg-gray-50"
        }`}
      >
        <FaSpinner className="animate-spin text-5xl text-blue-500" />
      </div>
    );
  }

  if (!worksheet) return null;

  const hasSubmission = worksheet.submission;
  const isGraded =
    worksheet.status === "graded" || worksheet.status === "approved";
  const isRejected = worksheet.status === "rejected";
  const isSubmitted = worksheet.status === "submitted";

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-slate-900" : "bg-gray-50"}`}
    >
      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        isDarkMode={isDarkMode}
      />

      {/* Header */}
      <div
        className={`sticky top-0 z-10 border-b ${
          isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/worksheets")}
            className={`p-2 rounded-full hover:bg-opacity-10 transition cursor-pointer ${
              isDarkMode ? "hover:bg-white" : "hover:bg-gray-500"
            }`}
          >
            <FaArrowLeft
              className={isDarkMode ? "text-white" : "text-gray-700"}
            />
          </button>
          <div className="flex-1">
            <h1
              className={`font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {worksheet.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Worksheet Details */}
          <div className="flex-1">
            {/* Worksheet Info Card */}
            <div
              className={`rounded-lg border p-6 mb-4 ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <FaFileAlt className="text-white text-lg" />
                </div>
                <div className="flex-1">
                  <h2
                    className={`text-xl font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {worksheet.title}
                  </h2>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    {worksheet.chapter?.chapter_name} • โพสต์เมื่อ{" "}
                    {formatDate(worksheet.createdAt)}
                  </p>
                  {worksheet.deadline && (
                    <p
                      className={`text-sm mt-1 ${
                        isDarkMode ? "text-slate-400" : "text-gray-500"
                      }`}
                    >
                      กำหนดส่ง: {formatDate(worksheet.deadline)}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              {worksheet.description && (
                <div
                  className={`mt-4 pt-4 border-t ${
                    isDarkMode ? "border-slate-700" : "border-gray-200"
                  }`}
                >
                  <p
                    className={isDarkMode ? "text-slate-300" : "text-gray-700"}
                  >
                    {worksheet.description}
                  </p>
                </div>
              )}

              {/* Attached Files Section */}
              {(worksheet.images?.length > 0 || worksheet.document) && (
                <div
                  className={`mt-4 pt-4 border-t ${
                    isDarkMode ? "border-slate-700" : "border-gray-200"
                  }`}
                >
                  <p
                    className={`text-sm font-medium mb-3 flex items-center gap-2 ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}
                  >
                    📎 ไฟล์แนบจากอาจารย์
                  </p>

                  <div className="space-y-3">
                    {/* Document File */}
                    {worksheet.document?.url && (
                      <div
                        className={`p-3 rounded-lg ${
                          isDarkMode ? "bg-slate-700" : "bg-gray-100"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {worksheet.document.fileType === "pdf" ? (
                            <FaFilePdf className="text-red-500 text-2xl flex-shrink-0 mt-0.5" />
                          ) : (
                            <FaFileWord className="text-blue-500 text-2xl flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium break-words mb-2 ${
                                isDarkMode ? "text-white" : "text-gray-800"
                              }`}
                            >
                              {worksheet.document.originalName || "เอกสาร"}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  setPreviewFile({
                                    url: worksheet.document.url,
                                    type: worksheet.document.fileType,
                                    name:
                                      worksheet.document.originalName ||
                                      "เอกสาร",
                                  })
                                }
                                className="px-4 py-1.5 text-xs rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
                              >
                                ดู
                              </button>
                              <a
                                href={worksheet.document.url}
                                download
                                className={`px-4 py-1.5 text-xs rounded-full ${
                                  isDarkMode
                                    ? "bg-slate-600 text-white hover:bg-slate-500"
                                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                } transition`}
                              >
                                ดาวน์โหลด
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Image Files */}
                    {worksheet.images?.map((img, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          isDarkMode ? "bg-slate-700" : "bg-gray-100"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <FaImage className="text-purple-500 text-2xl flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium break-words mb-2 ${
                                isDarkMode ? "text-white" : "text-gray-800"
                              }`}
                            >
                              {img.originalName || `รูปภาพ ${idx + 1}`}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  setPreviewFile({
                                    url: img.url,
                                    type: "image",
                                    name:
                                      img.originalName || `รูปภาพ ${idx + 1}`,
                                  })
                                }
                                className="px-4 py-1.5 text-xs rounded-full bg-purple-500 text-white hover:bg-purple-600 transition"
                              >
                                ดู
                              </button>
                              <a
                                href={img.url}
                                download
                                className={`px-4 py-1.5 text-xs rounded-full ${
                                  isDarkMode
                                    ? "bg-slate-600 text-white hover:bg-slate-500"
                                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                } transition`}
                              >
                                ดาวน์โหลด
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Your Work Panel */}
          <div className="lg:w-80">
            <div
              className={`rounded-lg border ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* Panel Header */}
              <div
                className={`p-4 border-b flex items-center justify-between ${
                  isDarkMode ? "border-slate-700" : "border-gray-200"
                }`}
              >
                <h3
                  className={`font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  งานของคุณ
                </h3>
                <span
                  className={`text-sm font-medium ${
                    isGraded
                      ? "text-green-500"
                      : isRejected
                      ? "text-red-500"
                      : isSubmitted
                      ? "text-blue-500"
                      : "text-yellow-500"
                  }`}
                >
                  {isGraded
                    ? "ตรวจแล้ว"
                    : isRejected
                    ? "ไม่ผ่าน"
                    : isSubmitted
                    ? "ส่งแล้ว"
                    : "ยังไม่ส่ง"}
                </span>
              </div>

              {/* Panel Content */}
              <div className="p-4">
                {/* Team Members Selection */}
                {!isGraded && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowTeamSelect(!showTeamSelect)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition cursor-pointer ${
                        isDarkMode
                          ? "border-slate-600 hover:bg-slate-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`flex items-center gap-2 text-sm ${
                          isDarkMode ? "text-slate-300" : "text-gray-700"
                        }`}
                      >
                        <FaUserPlus className="text-blue-500" />
                        เลือกเพื่อนในกลุ่ม
                        {selectedTeam.length > 0 && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {selectedTeam.length}
                          </span>
                        )}
                      </span>
                    </button>

                    {/* Team Select Dropdown */}
                    {showTeamSelect && (
                      <div
                        className={`mt-2 p-3 rounded-lg border max-h-60 overflow-y-auto ${
                          isDarkMode
                            ? "bg-slate-700 border-slate-600"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <p
                          className={`text-xs mb-2 ${
                            isDarkMode ? "text-slate-400" : "text-gray-500"
                          }`}
                        >
                          เลือกเพื่อนในห้อง {classRoom}:
                        </p>
                        {classmates.length === 0 ? (
                          <p
                            className={`text-sm ${
                              isDarkMode ? "text-slate-500" : "text-gray-400"
                            }`}
                          >
                            ไม่พบเพื่อนในห้อง
                          </p>
                        ) : (
                          <div className="space-y-1">
                            {classmates.map((mate) => (
                              <div
                                key={mate._id}
                                onClick={() => toggleTeamMember(mate._id)}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                                  selectedTeam.includes(mate._id)
                                    ? isDarkMode
                                      ? "bg-blue-900/50 border border-blue-500"
                                      : "bg-blue-50 border border-blue-300"
                                    : isDarkMode
                                    ? "hover:bg-slate-600"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                {mate.profileImage ? (
                                  <img
                                    src={mate.profileImage}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      isDarkMode
                                        ? "bg-slate-500"
                                        : "bg-gray-300"
                                    }`}
                                  >
                                    <span className="text-sm font-bold text-white">
                                      {mate.firstName?.[0]}
                                    </span>
                                  </div>
                                )}
                                <span
                                  className={`flex-1 text-sm ${
                                    isDarkMode ? "text-white" : "text-gray-800"
                                  }`}
                                >
                                  {mate.firstName} {mate.lastName}
                                </span>
                                {selectedTeam.includes(mate._id) && (
                                  <FaCheck className="text-blue-500" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selected Team Display */}
                    {selectedTeam.length > 0 && !showTeamSelect && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedTeam.map((mateId) => {
                          const mate = getClassmateById(mateId);
                          if (!mate) return null;
                          return (
                            <div
                              key={mateId}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                isDarkMode
                                  ? "bg-blue-900/50 text-blue-300"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              <span>
                                {mate.firstName} {mate.lastName?.[0]}.
                              </span>
                              <button
                                onClick={() => toggleTeamMember(mateId)}
                                className="hover:text-red-500 cursor-pointer"
                              >
                                <FaTimes size={10} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Existing Submission Team Members */}
                {hasSubmission &&
                  worksheet.submission.teamMembers?.length > 0 && (
                    <div className="mb-4">
                      <p
                        className={`text-xs mb-2 ${
                          isDarkMode ? "text-slate-400" : "text-gray-500"
                        }`}
                      >
                        สมาชิกในกลุ่ม:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {worksheet.submission.teamMembers.map((member) => (
                          <div
                            key={member._id}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              isDarkMode
                                ? "bg-green-900/30 text-green-300"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {member.firstName} {member.lastName?.[0]}.
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Existing Submission */}
                {hasSubmission && (
                  <div
                    className={`mb-4 p-3 rounded-lg border flex items-center gap-3 ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {getFileIcon(worksheet.submission.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {worksheet.submission.fileName}
                      </p>
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-slate-400" : "text-gray-500"
                        }`}
                      >
                        {worksheet.submission.fileType}
                      </p>
                    </div>
                  </div>
                )}

                {/* Selected File Preview */}
                {selectedFile && (
                  <div
                    className={`mb-4 p-3 rounded-lg border flex items-center gap-3 ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <FaCheckCircle className="text-green-500" />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {selectedFile.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}

                {/* Add/Change File */}
                {!isGraded && (
                  <>
                    <input
                      type="file"
                      id="fileUpload"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="fileUpload"
                      className={`block w-full py-3 text-center rounded-lg border-2 border-dashed cursor-pointer transition ${
                        isDarkMode
                          ? "border-slate-600 hover:border-slate-500 text-slate-300"
                          : "border-gray-300 hover:border-gray-400 text-gray-600"
                      }`}
                    >
                      <FaUpload className="inline mr-2" />
                      {hasSubmission || selectedFile
                        ? "เปลี่ยนไฟล์"
                        : "เพิ่มไฟล์งาน"}
                    </label>
                  </>
                )}

                {/* Submit Button */}
                {!isGraded && (
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedFile || uploading}
                    className={`w-full mt-4 py-3 rounded-lg font-medium transition cursor-pointer ${
                      selectedFile && !uploading
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin" />
                        กำลังอัปโหลด...
                      </span>
                    ) : hasSubmission ? (
                      "ส่งใหม่"
                    ) : (
                      "ส่งงาน"
                    )}
                  </button>
                )}

                {/* Cancel Button */}
                {(hasSubmission || selectedFile) && !isGraded && (
                  <button
                    onClick={handleCancelSubmission}
                    className={`w-full mt-2 py-3 rounded-lg font-medium border transition cursor-pointer ${
                      isDarkMode
                        ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    ยกเลิกการส่ง
                  </button>
                )}

                {/* Score if graded */}
                {isGraded && worksheet.submission?.score !== undefined && (
                  <div className="mt-4 text-center">
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-slate-400" : "text-gray-500"
                      }`}
                    >
                      คะแนนของคุณ
                    </p>
                    <p className="text-3xl font-bold text-green-500">
                      {worksheet.submission.score}
                    </p>
                    {worksheet.submission.feedback && (
                      <p
                        className={`mt-2 text-sm ${
                          isDarkMode ? "text-slate-300" : "text-gray-700"
                        }`}
                      >
                        💬 {worksheet.submission.feedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorksheetDetail;
