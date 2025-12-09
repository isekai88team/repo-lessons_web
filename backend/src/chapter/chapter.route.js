const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createChapter,
  getChaptersBySubject,
  getChapterById,
  updateChapter,
  deleteChapter,
} = require("./chapter.controller");

// Multer config for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow video and document files
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

// Multer fields for video and document
const uploadFields = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "document", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

// CRUD Routes
router.post("/", uploadFields, createChapter);
router.get("/subject/:subjectId", getChaptersBySubject);
router.get("/:id", getChapterById);
router.put("/:id", uploadFields, updateChapter);
router.delete("/:id", deleteChapter);

module.exports = router;
