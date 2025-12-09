const Subject = require("./subject.model");
const Chapter = require("../chapter/chapter.model");
const { deleteObject } = require("../services/s3.service");

// Create Subject
const createSubject = async (req, res) => {
  try {
    const { subject_name, code, description, teacher } = req.body;

    // Check if code already exists
    const existingSubject = await Subject.findOne({ code });
    if (existingSubject) {
      return res.status(400).json({ message: "รหัสวิชานี้มีอยู่แล้ว" });
    }

    const newSubject = new Subject({
      subject_name,
      code,
      description,
      teacher,
    });

    await newSubject.save();

    res.status(201).json({
      message: "สร้างรายวิชาสำเร็จ",
      subject: newSubject,
    });
  } catch (error) {
    console.error("Error creating subject:", error);
    res
      .status(500)
      .json({
        message: "เกิดข้อผิดพลาดในการสร้างรายวิชา",
        error: error.message,
      });
  }
};

// Get All Subjects
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate("teacher", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({ subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล", error: error.message });
  }
};

// Get Subject by ID (with chapters)
const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id).populate(
      "teacher",
      "firstName lastName"
    );
    if (!subject) {
      return res.status(404).json({ message: "ไม่พบรายวิชา" });
    }

    // Get chapters for this subject
    const chapters = await Chapter.find({ subject: id }).sort({ createdAt: 1 });

    res.status(200).json({ subject, chapters });
  } catch (error) {
    console.error("Error fetching subject:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล", error: error.message });
  }
};

// Update Subject
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_name, code, description, teacher } = req.body;

    // Check if new code conflicts with other subjects
    const existingSubject = await Subject.findOne({ code, _id: { $ne: id } });
    if (existingSubject) {
      return res.status(400).json({ message: "รหัสวิชานี้มีอยู่แล้ว" });
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { subject_name, code, description, teacher },
      { new: true }
    ).populate("teacher", "firstName lastName");

    if (!updatedSubject) {
      return res.status(404).json({ message: "ไม่พบรายวิชา" });
    }

    res.status(200).json({
      message: "อัปเดตรายวิชาสำเร็จ",
      subject: updatedSubject,
    });
  } catch (error) {
    console.error("Error updating subject:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการอัปเดต", error: error.message });
  }
};

// Delete Subject (also delete all chapters and their videos)
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    // Find all chapters for this subject
    const chapters = await Chapter.find({ subject: id });

    // Delete videos from S3
    for (const chapter of chapters) {
      if (chapter.video_key) {
        await deleteObject(chapter.video_key);
      }
      if (chapter.document_key) {
        await deleteObject(chapter.document_key);
      }
    }

    // Delete all chapters
    await Chapter.deleteMany({ subject: id });

    // Delete the subject
    const deletedSubject = await Subject.findByIdAndDelete(id);
    if (!deletedSubject) {
      return res.status(404).json({ message: "ไม่พบรายวิชา" });
    }

    res.status(200).json({
      message: "ลบรายวิชาและบทเรียนทั้งหมดสำเร็จ",
    });
  } catch (error) {
    console.error("Error deleting subject:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการลบ", error: error.message });
  }
};

module.exports = {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};
