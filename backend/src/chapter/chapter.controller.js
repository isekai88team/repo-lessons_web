const Chapter = require("./chapter.model");
const {
  uploadFile,
  deleteObject,
  getObjectUrl,
} = require("../services/s3.service");

// Create Chapter (with file upload)
const createChapter = async (req, res) => {
  try {
    const { subject, chapter_name, description } = req.body;

    const chapterData = {
      subject,
      chapter_name,
      description,
    };

    // Handle video upload
    if (req.files?.video) {
      const videoFile = req.files.video[0];
      const videoKey = `videos/${subject}/${Date.now()}-${
        videoFile.originalname
      }`;
      const { url, key } = await uploadFile(
        videoFile.buffer,
        videoKey,
        videoFile.mimetype
      );
      chapterData.video_url = url;
      chapterData.video_key = key;
    }

    // Handle document upload
    if (req.files?.document) {
      const docFile = req.files.document[0];
      const docKey = `documents/${subject}/${Date.now()}-${
        docFile.originalname
      }`;
      const { url, key } = await uploadFile(
        docFile.buffer,
        docKey,
        docFile.mimetype
      );
      chapterData.document_url = url;
      chapterData.document_key = key;
    }

    const newChapter = new Chapter(chapterData);
    await newChapter.save();

    res.status(201).json({
      message: "สร้างบทเรียนสำเร็จ",
      chapter: newChapter,
    });
  } catch (error) {
    console.error("Error creating chapter:", error);
    res
      .status(500)
      .json({
        message: "เกิดข้อผิดพลาดในการสร้างบทเรียน",
        error: error.message,
      });
  }
};

// Get Chapters by Subject
const getChaptersBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const chapters = await Chapter.find({ subject: subjectId }).sort({
      createdAt: 1,
    });

    res.status(200).json({ chapters });
  } catch (error) {
    console.error("Error fetching chapters:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล", error: error.message });
  }
};

// Get Chapter by ID (with signed URL for video)
const getChapterById = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findById(id).populate(
      "subject",
      "subject_name code"
    );

    if (!chapter) {
      return res.status(404).json({ message: "ไม่พบบทเรียน" });
    }

    // Get signed URLs for protected content
    let signedVideoUrl = null;
    let signedDocumentUrl = null;

    if (chapter.video_key) {
      signedVideoUrl = await getObjectUrl(chapter.video_key);
    }
    if (chapter.document_key) {
      signedDocumentUrl = await getObjectUrl(chapter.document_key);
    }

    res.status(200).json({
      chapter,
      signedVideoUrl,
      signedDocumentUrl,
    });
  } catch (error) {
    console.error("Error fetching chapter:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล", error: error.message });
  }
};

// Update Chapter
const updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapter_name, description } = req.body;

    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res.status(404).json({ message: "ไม่พบบทเรียน" });
    }

    // Update basic info
    chapter.chapter_name = chapter_name || chapter.chapter_name;
    chapter.description = description || chapter.description;

    // Handle new video upload
    if (req.files?.video) {
      // Delete old video
      if (chapter.video_key) {
        await deleteObject(chapter.video_key);
      }
      const videoFile = req.files.video[0];
      const videoKey = `videos/${chapter.subject}/${Date.now()}-${
        videoFile.originalname
      }`;
      const { url, key } = await uploadFile(
        videoFile.buffer,
        videoKey,
        videoFile.mimetype
      );
      chapter.video_url = url;
      chapter.video_key = key;
    }

    // Handle new document upload
    if (req.files?.document) {
      // Delete old document
      if (chapter.document_key) {
        await deleteObject(chapter.document_key);
      }
      const docFile = req.files.document[0];
      const docKey = `documents/${chapter.subject}/${Date.now()}-${
        docFile.originalname
      }`;
      const { url, key } = await uploadFile(
        docFile.buffer,
        docKey,
        docFile.mimetype
      );
      chapter.document_url = url;
      chapter.document_key = key;
    }

    await chapter.save();

    res.status(200).json({
      message: "อัปเดตบทเรียนสำเร็จ",
      chapter,
    });
  } catch (error) {
    console.error("Error updating chapter:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการอัปเดต", error: error.message });
  }
};

// Delete Chapter
const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findById(id);

    if (!chapter) {
      return res.status(404).json({ message: "ไม่พบบทเรียน" });
    }

    // Delete files from S3
    if (chapter.video_key) {
      await deleteObject(chapter.video_key);
    }
    if (chapter.document_key) {
      await deleteObject(chapter.document_key);
    }

    await Chapter.findByIdAndDelete(id);

    res.status(200).json({
      message: "ลบบทเรียนสำเร็จ",
    });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการลบ", error: error.message });
  }
};

module.exports = {
  createChapter,
  getChaptersBySubject,
  getChapterById,
  updateChapter,
  deleteChapter,
};
