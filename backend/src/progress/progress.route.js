const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getAllStudentsProgress,
  getStudentDetailedProgress,
  enrollStudent,
  unenrollStudent,
  getStudentTestHistory,
} = require("./progress.controller");

// Admin routes for viewing student progress
router.get("/students", authMiddleware, getAllStudentsProgress);
router.get("/student/:studentId", authMiddleware, getStudentDetailedProgress);
router.get("/student/:studentId/tests", authMiddleware, getStudentTestHistory);

// Enrollment management
router.post("/enroll", authMiddleware, enrollStudent);
router.delete(
  "/unenroll/:studentId/:subjectId",
  authMiddleware,
  unenrollStudent
);

module.exports = router;
