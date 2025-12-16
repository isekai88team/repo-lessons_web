const express = require("express");
const router = express.Router();
const Teacher = require("../teacher/teacher.model");
const Subject = require("../subject/subject.model");
const Chapter = require("../chapter/chapter.model");
const Worksheet = require("../worksheet/worksheet.model");

// Get subject and chapters for landing page (hardcoded for teacher "nu")
router.get("/landing", async (req, res) => {
  try {
    // Find teacher "nu" - hardcoded for this landing page
    const teacher = await Teacher.findOne({
      $or: [{ firstName: "nu" }, { firstName: "Nu" }, { username: "nu" }],
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Find subject(s) for this teacher
    const subjects = await Subject.find({ teacher: teacher._id }).lean();

    if (subjects.length === 0) {
      return res.status(404).json({ message: "No subjects found" });
    }

    // Get the first subject (or could return all)
    const subject = subjects[0];

    // Get chapters for this subject
    const chapters = await Chapter.find({ subject: subject._id })
      .sort({ createdAt: 1 })
      .lean();

    // Get active worksheets (either for this subject or not linked to any specific subject)
    const worksheets = await Worksheet.find({
      isActive: true,
      $or: [
        { subject: subject._id },
        { subject: null },
        { subject: { $exists: false } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      teacher: {
        _id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
      },
      subject: {
        _id: subject._id,
        subject_name: subject.subject_name,
        code: subject.code,
        description: subject.description,
      },
      chapters: chapters.map((ch, index) => ({
        _id: ch._id,
        chapter_name: ch.chapter_name,
        description: ch.description,
        order: index + 1,
        hasVideo: !!ch.video_url,
        hasDocument: !!ch.document_url,
      })),
      worksheets: worksheets.map((ws) => ({
        _id: ws._id,
        title: ws.title,
        description: ws.description,
        deadline: ws.deadline,
        hasDocument: !!ws.document?.url,
        hasImages: ws.images?.length > 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching landing page data:", error);
    res
      .status(500)
      .json({ message: "Error fetching data", error: error.message });
  }
});

// Get chapter detail by ID (for student learning)
router.get("/chapter/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await Chapter.findById(id)
      .populate({
        path: "subject",
        populate: { path: "teacher", select: "firstName lastName" },
      })
      .lean();

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    res.status(200).json({
      chapter: {
        _id: chapter._id,
        chapter_name: chapter.chapter_name,
        description: chapter.description,
        video_url: chapter.video_url, // ส่ง video_url - client จะ limit 15 วิ เอง
        document_url: chapter.document_url,
      },
      subject: chapter.subject
        ? {
            _id: chapter.subject._id,
            subject_name: chapter.subject.subject_name,
            code: chapter.subject.code,
            teacher: chapter.subject.teacher,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching chapter:", error);
    res
      .status(500)
      .json({ message: "Error fetching chapter", error: error.message });
  }
});

module.exports = router;
