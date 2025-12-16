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
      selectionMethod,
      multipleChoiceCount,
      trueFalseCount,
      shortAnswerCount,
      matchingCount,
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

    const newPosttest = new PosttestSheet({
      chapter,
      subject: subject || chapterExists.subject,
      createdBy: req.userId,
      sourcePretest,
      title,
      description,
      duration,
      passingScore: passingScore || 60,
      questionCount: questionCount || 5,
      selectionMethod: selectionMethod || "random",
      multipleChoiceCount: multipleChoiceCount || 5,
      trueFalseCount: trueFalseCount || 3,
      shortAnswerCount: shortAnswerCount || 2,
      matchingCount: matchingCount || 2,
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

// Helper function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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

    // Get questions from source pretest
    const sourceQuestions = posttest.sourcePretest?.questions || [];

    // Group questions by type
    const questionsByType = {
      "multiple-choice": sourceQuestions.filter(
        (q) => q.questionType === "multiple-choice"
      ),
      "true-false": sourceQuestions.filter(
        (q) => q.questionType === "true-false"
      ),
      "short-answer": sourceQuestions.filter(
        (q) => q.questionType === "short-answer"
      ),
      matching: sourceQuestions.filter((q) => q.questionType === "matching"),
    };

    // Select random questions from each type based on settings
    let selectedQuestions = [];

    // Multiple Choice
    const mcQuestions = shuffleArray(questionsByType["multiple-choice"]).slice(
      0,
      posttest.multipleChoiceCount
    );
    selectedQuestions.push(...mcQuestions);

    // True/False
    const tfQuestions = shuffleArray(questionsByType["true-false"]).slice(
      0,
      posttest.trueFalseCount
    );
    selectedQuestions.push(...tfQuestions);

    // Short Answer
    const saQuestions = shuffleArray(questionsByType["short-answer"]).slice(
      0,
      posttest.shortAnswerCount
    );
    selectedQuestions.push(...saQuestions);

    // Matching
    const matchQuestions = shuffleArray(questionsByType["matching"]).slice(
      0,
      posttest.matchingCount
    );
    selectedQuestions.push(...matchQuestions);

    // Shuffle all selected questions if enabled
    if (posttest.shuffleQuestions) {
      selectedQuestions = shuffleArray(selectedQuestions);
    }

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
        questionCounts: {
          multipleChoice: mcQuestions.length,
          trueFalse: tfQuestions.length,
          shortAnswer: saQuestions.length,
          matching: matchQuestions.length,
        },
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

// Get all posttests
const getAllPosttests = async (req, res) => {
  try {
    const posttests = await PosttestSheet.find()
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

module.exports = {
  createPosttest,
  getPosttestsByChapter,
  getPosttestById,
  updatePosttest,
  deletePosttest,
  getAllPosttests,
};
