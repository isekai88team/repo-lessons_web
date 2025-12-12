const express = require("express");
const router = express.Router();
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
} = require("./student.controller");

router.post("/login", loginStudent);

// Protected route - get full video for authenticated students
router.get("/chapter/:chapterId/full", authMiddleware, getChapterFullVideo);

// Profile routes (protected)
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

// Progress routes (protected)
router.get("/my-progress", authMiddleware, getMyProgress);

// Video progress routes (protected)
router.get("/chapter/:chapterId/progress", authMiddleware, getChapterProgress);
router.put("/chapter/:chapterId/progress", authMiddleware, updateVideoProgress);
router.post("/chapter/:chapterId/complete", authMiddleware, markVideoComplete);

// Learning flow routes (protected)
router.get("/chapter/:id/tests", authMiddleware, getChapterTests);
router.post("/pretest/:id/submit", authMiddleware, submitPretest);
router.post("/posttest/:id/submit", authMiddleware, submitPosttest);

module.exports = router;
