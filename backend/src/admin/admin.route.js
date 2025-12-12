const express = require("express");
const multer = require("multer");
const {
  postAdmin,
  loginAdmin,
  postTeachers,
  readTeachers,
  readTeacherById,
  updateTeacher,
  deleteTeacher,
  readStudents,
  readStudentById,
  postStudents,
  updateStudent,
  deleteStudent,
} = require("./admin.controller");
const {
  createChapter,
  getChaptersBySubject,
  getChapterById,
  updateChapter,
  deleteChapter,
} = require("../chapter/chapter.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

// Multer config for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
    ];
    const allowedDocTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
      file.fieldname === "video" &&
      allowedVideoTypes.includes(file.mimetype)
    ) {
      cb(null, true);
    } else if (
      file.fieldname === "document" &&
      allowedDocTypes.includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error(`ไม่รองรับไฟล์ประเภท ${file.mimetype}`), false);
    }
  },
});

const uploadFields = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "document", maxCount: 1 },
]);

//Admin Route
router.post("/register", postAdmin);
router.post("/login", loginAdmin);

//Management Teacher Route
router.post("/register-teacher", postTeachers);
router.get("/read-teacher", authMiddleware, readTeachers);
router.get("/read-teacher/:id", authMiddleware, readTeacherById);
router.put("/update-teacher/:id", authMiddleware, updateTeacher);
router.delete("/delete-teacher/:id", authMiddleware, deleteTeacher);

//Menagement Student Route
router.post("/register-student", postStudents);
router.get("/read-students", authMiddleware, readStudents);
router.get("/read-student/:id", authMiddleware, readStudentById);
router.put("/update-student/:id", authMiddleware, updateStudent);
router.delete("/delete-student/:id", authMiddleware, deleteStudent);

//Management Chapter Route
router.post("/chapters", authMiddleware, uploadFields, createChapter);
router.get(
  "/chapters/subject/:subjectId",
  authMiddleware,
  getChaptersBySubject
);
router.get("/chapters/:id", authMiddleware, getChapterById);
router.put("/chapters/:id", authMiddleware, uploadFields, updateChapter);
router.delete("/chapters/:id", authMiddleware, deleteChapter);

//Management Pretest Route
const {
  createPretest,
  getPretestsByChapter,
  getPretestById,
  updatePretest,
  deletePretest,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../pretest/pretest.controller");

router.post("/pretests", authMiddleware, createPretest);
router.get(
  "/pretests/chapter/:chapterId",
  authMiddleware,
  getPretestsByChapter
);
router.get("/pretests/:id", authMiddleware, getPretestById);
router.put("/pretests/:id", authMiddleware, updatePretest);
router.delete("/pretests/:id", authMiddleware, deletePretest);
router.post("/pretests/:id/questions", authMiddleware, addQuestion);
router.put(
  "/pretests/:id/questions/:questionIndex",
  authMiddleware,
  updateQuestion
);
router.delete(
  "/pretests/:id/questions/:questionIndex",
  authMiddleware,
  deleteQuestion
);

//Management Posttest Route
const {
  createPosttest,
  getPosttestsByChapter,
  getPosttestById,
  updatePosttest,
  deletePosttest,
} = require("../posttest/posttest.controller");

router.post("/posttests", authMiddleware, createPosttest);
router.get(
  "/posttests/chapter/:chapterId",
  authMiddleware,
  getPosttestsByChapter
);
router.get("/posttests/:id", authMiddleware, getPosttestById);
router.put("/posttests/:id", authMiddleware, updatePosttest);
router.delete("/posttests/:id", authMiddleware, deletePosttest);

//Management Final Exam Route
const {
  getAllPretestQuestions,
  createFinalExam,
  getFinalExam,
  getFinalExamById,
  updateFinalExam,
  deleteFinalExam,
} = require("../progress/finalExam.controller");

router.get("/final-exam/questions", authMiddleware, getAllPretestQuestions);
router.post("/final-exam", authMiddleware, createFinalExam);
router.get("/final-exam/subject/:subjectId", authMiddleware, getFinalExam);
router.get("/final-exam/:id", authMiddleware, getFinalExamById);
router.put("/final-exam/:id", authMiddleware, updateFinalExam);
router.delete("/final-exam/:id", authMiddleware, deleteFinalExam);

module.exports = router;
