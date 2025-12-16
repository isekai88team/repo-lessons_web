const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  loginStudent,
  getChapterFullVideo,
  getProfile,
  updateProfile,
  changePassword,
  getChapterProgress,
  updateVideoProgress,
  markVideoComplete,
  getMyProgress,
  getChapterTests,
  submitPretest,
  submitPosttest,
  getAllChaptersProgress,
  getFinalExamForStudent,
  submitFinalExam,
  getMyTestResults,
  getMyFinalResults,
  getMyWorksheets,
  submitWorksheet,
  getMySubmissions,
} = require("./student.controller");

// Multer config for worksheet submission
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("ไม่รองรับไฟล์ประเภทนี้"), false);
    }
  },
});

router.post("/login", loginStudent);

// Protected route - get full video for authenticated students
router.get("/chapter/:chapterId/full", authMiddleware, getChapterFullVideo);

// Profile routes (protected)
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

// Progress routes (protected)
router.get("/my-progress", authMiddleware, getMyProgress);
router.get("/chapters/progress", authMiddleware, getAllChaptersProgress);

// Test results routes (protected)
router.get("/my-tests", authMiddleware, getMyTestResults);
router.get("/my-final-results", authMiddleware, getMyFinalResults);

// Video progress routes (protected)
router.get("/chapter/:chapterId/progress", authMiddleware, getChapterProgress);
router.put("/chapter/:chapterId/progress", authMiddleware, updateVideoProgress);
router.post("/chapter/:chapterId/complete", authMiddleware, markVideoComplete);

// Learning flow routes (protected)
router.get("/chapter/:id/tests", authMiddleware, getChapterTests);
router.post("/pretest/:id/submit", authMiddleware, submitPretest);
router.post("/posttest/:id/submit", authMiddleware, submitPosttest);

// Final Exam routes (protected)
router.get("/final-exam/:subjectId", authMiddleware, getFinalExamForStudent);
router.post("/final-exam/:id/submit", authMiddleware, submitFinalExam);

// Worksheet routes (protected)
router.get("/worksheets", authMiddleware, getMyWorksheets);
router.post(
  "/worksheets/:id/submit",
  authMiddleware,
  upload.single("file"),
  submitWorksheet
);
router.get("/submissions", authMiddleware, getMySubmissions);

// Classmates route (protected)
const { getClassmates, getMyNotifications } = require("./student.controller");
router.get("/classmates", authMiddleware, getClassmates);

// Notifications route (protected)
router.get("/notifications", authMiddleware, getMyNotifications);

module.exports = router;
