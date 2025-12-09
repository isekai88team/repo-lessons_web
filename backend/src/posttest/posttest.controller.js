const PosttestSheet = require("../posttestsheet/posttestsheet.model");
const PretestSheet = require("../pretestsheet/pretestsheet.model");
const Chapter = require("../chapter/chapter.model");

// Create Posttest
const createPosttest = async (req, res) => {
  try {
    const {
      chapter,
      subject,
      sourcePretest,
      title,
      description,
      duration,
      passingScore,
      questionCount,
      isActive,
      allowRetake,
      maxAttempts,
      shuffleQuestions,
      showCorrectAnswers,
    } = req.body;

    // Validate chapter exists
    const chapterExists = await Chapter.findById(chapter);
    if (!chapterExists) {
      return res.status(404).json({ message: "ไม่พบบทเรียน" });
    }

    // Validate source pretest exists
    const pretestExists = await PretestSheet.findById(sourcePretest);
    if (!pretestExists) {
      return res.status(404).json({ message: "ไม่พบแบบทดสอบก่อนเรียนต้นทาง" });
    }

    // Validate questionCount
    const maxQuestions = pretestExists.questions?.length || 0;
    if (questionCount > maxQuestions) {
      return res.status(400).json({
        message: `จำนวนคำถามไม่ถูกต้อง (มีคำถามใน Pretest ทั้งหมด ${maxQuestions} ข้อ)`,
      });
    }

    const newPosttest = new PosttestSheet({
      chapter,
      subject: subject || chapterExists.subject,
      createdBy: req.userId,
      sourcePretest,
      title,
      description,
      duration,
      passingScore: passingScore || 60,
      questionCount: questionCount || maxQuestions,
      isActive: isActive !== undefined ? isActive : true,
      allowRetake: allowRetake || false,
      maxAttempts: maxAttempts || 1,
      shuffleQuestions:
        shuffleQuestions !== undefined ? shuffleQuestions : true,
      showCorrectAnswers:
        showCorrectAnswers !== undefined ? showCorrectAnswers : true,
    });

    await newPosttest.save();

    res.status(201).json({
      message: "สร้างแบบทดสอบหลังเรียนสำเร็จ",
      posttest: newPosttest,
    });
  } catch (error) {
    console.error("Error creating posttest:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการสร้างแบบทดสอบ",
      error: error.message,
    });
  }
};

// Get Posttests by Chapter
const getPosttestsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const posttests = await PosttestSheet.find({ chapter: chapterId })
      .populate("chapter", "chapter_name")
      .populate("sourcePretest", "title questions")
      .sort({ createdAt: -1 });

    res.status(200).json({ posttests });
  } catch (error) {
    console.error("Error fetching posttests:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล", error: error.message });
  }
};

// Get Posttest by ID with randomized questions from source pretest
const getPosttestById = async (req, res) => {
  try {
    const { id } = req.params;
    const posttest = await PosttestSheet.findById(id)
      .populate("chapter", "chapter_name")
      .populate("subject", "subject_name code")
      .populate("sourcePretest");

    if (!posttest) {
      return res.status(404).json({ message: "ไม่พบแบบทดสอบ" });
    }

    // Get questions from source pretest and shuffle them
    const sourceQuestions = posttest.sourcePretest?.questions || [];
    let shuffledQuestions = [...sourceQuestions];

    // Shuffle questions
    if (posttest.shuffleQuestions) {
      shuffledQuestions = shuffledQuestions.sort(() => Math.random() - 0.5);
    }

    // Take only the specified number of questions
    const selectedQuestions = shuffledQuestions.slice(
      0,
      posttest.questionCount
    );

    // Calculate total points from selected questions
    const totalPoints = selectedQuestions.reduce(
      (sum, q) => sum + (q.points || 1),
      0
    );

    res.status(200).json({
      posttest: {
        ...posttest.toObject(),
        questions: selectedQuestions,
        totalPoints,
      },
    });
  } catch (error) {
    console.error("Error fetching posttest:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล", error: error.message });
  }
};

// Update Posttest
const updatePosttest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const posttest = await PosttestSheet.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!posttest) {
      return res.status(404).json({ message: "ไม่พบแบบทดสอบ" });
    }

    res.status(200).json({
      message: "อัปเดตแบบทดสอบสำเร็จ",
      posttest,
    });
  } catch (error) {
    console.error("Error updating posttest:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการอัปเดต", error: error.message });
  }
};

// Delete Posttest
const deletePosttest = async (req, res) => {
  try {
    const { id } = req.params;
    const posttest = await PosttestSheet.findByIdAndDelete(id);

    if (!posttest) {
      return res.status(404).json({ message: "ไม่พบแบบทดสอบ" });
    }

    res.status(200).json({ message: "ลบแบบทดสอบสำเร็จ" });
  } catch (error) {
    console.error("Error deleting posttest:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการลบ", error: error.message });
  }
};

module.exports = {
  createPosttest,
  getPosttestsByChapter,
  getPosttestById,
  updatePosttest,
  deletePosttest,
};
