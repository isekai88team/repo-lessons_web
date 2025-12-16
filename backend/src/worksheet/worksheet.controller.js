const Worksheet = require("./worksheet.model");
const WorksheetSubmission = require("./worksheetSubmission.model");
const Chapter = require("../chapter/chapter.model");
const {
  uploadFile,
  deleteObject,
  getObjectUrl,
} = require("../services/s3.service");

// Create Worksheet
const createWorksheet = async (req, res) => {
  try {
    const { title, description, chapter, subject, order, isActive, deadline } =
      req.body;

    // Get chapter info if provided
    let chapterData = null;
    let subjectId = subject || null;
    if (chapter) {
      chapterData = await Chapter.findById(chapter);
      if (chapterData) {
        subjectId = subject || chapterData.subject;
      }
    }

    let images = [];
    let document = null;

    // Handle image uploads
    if (req.files?.images) {
      const imageFiles = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      for (const file of imageFiles) {
        const folder = chapter || "general";
        const key = `worksheets/${folder}/images/${Date.now()}_${
          file.originalname
        }`;
        const result = await uploadFile(file.buffer, key, file.mimetype);
        images.push({
          url: result.url,
          key: result.key,
          originalName: file.originalname,
        });
      }
    }

    // Handle document upload
    if (req.files?.document?.[0]) {
      const file = req.files.document[0];
      const folder = chapter || "general";
      const key = `worksheets/${folder}/documents/${Date.now()}_${
        file.originalname
      }`;
      const result = await uploadFile(file.buffer, key, file.mimetype);
      const fileType = file.mimetype.includes("pdf") ? "pdf" : "doc";
      document = {
        url: result.url,
        key: result.key,
        originalName: file.originalname,
        fileType,
      };
    }

    const newWorksheet = new Worksheet({
      title,
      description,
      chapter: chapter || null,
      subject: subjectId,
      images,
      document,
      deadline: deadline ? new Date(deadline) : null,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.userId,
    });

    await newWorksheet.save();

    res.status(201).json({
      message: "สร้างใบงานสำเร็จ",
      worksheet: newWorksheet,
    });
  } catch (error) {
    console.error("Error creating worksheet:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการสร้างใบงาน",
      error: error.message,
    });
  }
};

// Get All Worksheets
const getAllWorksheets = async (req, res) => {
  try {
    const worksheets = await Worksheet.find()
      .populate("chapter", "chapter_name")
      .populate("subject", "subject_name code")
      .sort({ order: 1, createdAt: 1 });

    res.status(200).json({ worksheets });
  } catch (error) {
    console.error("Error fetching worksheets:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
};

// Get Worksheets by Chapter
const getWorksheetsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const worksheets = await Worksheet.find({ chapter: chapterId })
      .populate("chapter", "chapter_name")
      .sort({ order: 1, createdAt: 1 });

    res.status(200).json({ worksheets });
  } catch (error) {
    console.error("Error fetching worksheets:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
};

// Get Worksheet by ID (with signed URLs)
const getWorksheetById = async (req, res) => {
  try {
    const { id } = req.params;
    const worksheet = await Worksheet.findById(id)
      .populate("chapter", "chapter_name")
      .populate("subject", "subject_name code");

    if (!worksheet) {
      return res.status(404).json({ message: "ไม่พบใบงาน" });
    }

    // Generate signed URLs for images
    const signedImages = [];
    for (const img of worksheet.images || []) {
      if (img.key) {
        const signedUrl = await getObjectUrl(img.key);
        signedImages.push({
          ...img.toObject(),
          signedUrl,
        });
      }
    }

    // Generate signed URL for document
    let signedDocument = null;
    if (worksheet.document?.key) {
      const signedUrl = await getObjectUrl(worksheet.document.key);
      signedDocument = {
        ...worksheet.document.toObject(),
        signedUrl,
      };
    }

    res.status(200).json({
      worksheet,
      signedImages,
      signedDocument,
    });
  } catch (error) {
    console.error("Error fetching worksheet:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
};

// Update Worksheet
const updateWorksheet = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      order,
      isActive,
      deadline,
      removeImages,
      removeDocument,
    } = req.body;

    const worksheet = await Worksheet.findById(id);
    if (!worksheet) {
      return res.status(404).json({ message: "ไม่พบใบงาน" });
    }

    // Update basic fields
    if (title !== undefined) worksheet.title = title;
    if (description !== undefined) worksheet.description = description;
    if (order !== undefined) worksheet.order = order;
    if (isActive !== undefined) worksheet.isActive = isActive;
    if (deadline !== undefined)
      worksheet.deadline = deadline ? new Date(deadline) : null;

    // Remove specific images
    if (removeImages && Array.isArray(removeImages)) {
      for (const key of removeImages) {
        await deleteObject(key);
        worksheet.images = worksheet.images.filter((img) => img.key !== key);
      }
    }

    // Remove document
    if (removeDocument === "true" || removeDocument === true) {
      if (worksheet.document?.key) {
        await deleteObject(worksheet.document.key);
        worksheet.document = null;
      }
    }

    // Add new images
    if (req.files?.images) {
      const imageFiles = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      for (const file of imageFiles) {
        const key = `worksheets/${worksheet.chapter}/images/${Date.now()}_${
          file.originalname
        }`;
        const result = await uploadFile(file.buffer, key, file.mimetype);
        worksheet.images.push({
          url: result.url,
          key: result.key,
          originalName: file.originalname,
        });
      }
    }

    // Add/Replace document
    if (req.files?.document?.[0]) {
      // Delete old document
      if (worksheet.document?.key) {
        await deleteObject(worksheet.document.key);
      }

      const file = req.files.document[0];
      const key = `worksheets/${worksheet.chapter}/documents/${Date.now()}_${
        file.originalname
      }`;
      const result = await uploadFile(file.buffer, key, file.mimetype);
      const fileType = file.mimetype.includes("pdf") ? "pdf" : "doc";
      worksheet.document = {
        url: result.url,
        key: result.key,
        originalName: file.originalname,
        fileType,
      };
    }

    await worksheet.save();

    res.status(200).json({
      message: "อัปเดตใบงานสำเร็จ",
      worksheet,
    });
  } catch (error) {
    console.error("Error updating worksheet:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการอัปเดต",
      error: error.message,
    });
  }
};

// Delete Worksheet
const deleteWorksheet = async (req, res) => {
  try {
    const { id } = req.params;
    const worksheet = await Worksheet.findById(id);

    if (!worksheet) {
      return res.status(404).json({ message: "ไม่พบใบงาน" });
    }

    // Delete images from S3
    for (const img of worksheet.images || []) {
      if (img.key) {
        await deleteObject(img.key);
      }
    }

    // Delete document from S3
    if (worksheet.document?.key) {
      await deleteObject(worksheet.document.key);
    }

    await Worksheet.findByIdAndDelete(id);

    res.status(200).json({ message: "ลบใบงานสำเร็จ" });
  } catch (error) {
    console.error("Error deleting worksheet:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการลบ",
      error: error.message,
    });
  }
};

// ========== Submission APIs ==========

// Get Submissions by Worksheet
const getSubmissionsByWorksheet = async (req, res) => {
  try {
    const { worksheetId } = req.params;
    const submissions = await WorksheetSubmission.find({
      worksheet: worksheetId,
    })
      .populate("student", "firstName lastName classRoom profileImage")
      .populate("teamMembers", "firstName lastName classRoom profileImage")
      .sort({ submittedAt: -1 });

    res.status(200).json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Submission Status (Grading)
const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, score, feedback } = req.body;

    const submission = await WorksheetSubmission.findByIdAndUpdate(
      id,
      {
        status,
        score,
        feedback,
        checkedBy: req.userId,
        checkedAt: new Date(),
      },
      { new: true }
    )
      .populate("student", "firstName lastName")
      .populate("worksheet", "title");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Create notification for student
    const Notification = require("../notification/notification.model");

    let notifTitle = "";
    let notifMessage = "";
    let notifType = "info";

    if (status === "approved") {
      notifTitle = "✅ งานผ่านแล้ว!";
      notifMessage = `ใบงาน "${
        submission.worksheet?.title || "ใบงาน"
      }" ได้รับการอนุมัติแล้ว`;
      notifType = "success";
    } else if (status === "rejected") {
      notifTitle = "❌ งานไม่ผ่าน";
      notifMessage = `ใบงาน "${
        submission.worksheet?.title || "ใบงาน"
      }" ไม่ผ่านการตรวจ กรุณาส่งใหม่`;
      notifType = "error";
    } else if (status === "graded") {
      notifTitle = "📝 ตรวจงานเสร็จแล้ว";
      notifMessage = `ใบงาน "${
        submission.worksheet?.title || "ใบงาน"
      }" ได้รับการตรวจแล้ว${score !== undefined ? ` (คะแนน: ${score})` : ""}`;
      notifType = "success";
    }

    if (notifTitle) {
      // Delete existing notifications for this student and worksheet to prevent duplicates
      await Notification.deleteMany({
        recipient: submission.student._id,
        relatedWorksheet: submission.worksheet?._id,
        isGlobal: false,
      });

      await Notification.create({
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        recipient: submission.student._id,
        relatedWorksheet: submission.worksheet?._id,
        isGlobal: false,
        createdBy: req.userId,
      });
    }

    // Also notify team members if any
    if (
      submission.teamMembers &&
      submission.teamMembers.length > 0 &&
      notifTitle
    ) {
      for (const memberId of submission.teamMembers) {
        // Delete existing notifications for this team member and worksheet
        await Notification.deleteMany({
          recipient: memberId,
          relatedWorksheet: submission.worksheet?._id,
          isGlobal: false,
        });

        await Notification.create({
          title: notifTitle,
          message: notifMessage,
          type: notifType,
          recipient: memberId,
          relatedWorksheet: submission.worksheet?._id,
          isGlobal: false,
          createdBy: req.userId,
        });
      }
    }

    res.status(200).json({
      message: "อัปเดตสถานะงานสำเร็จ",
      submission,
    });
  } catch (error) {
    console.error("Error updating submission:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createWorksheet,
  getAllWorksheets,
  getWorksheetsByChapter,
  getWorksheetById,
  updateWorksheet,
  deleteWorksheet,
  getSubmissionsByWorksheet,
  updateSubmissionStatus,
};
