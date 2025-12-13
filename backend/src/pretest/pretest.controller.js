const PretestSheet = require("../pretestsheet/pretestsheet.model");
const Chapter = require("../chapter/chapter.model");

// Create Pretest
const createPretest = async (req, res) => {
  try {
    const {
      chapter,
      subject,
      title,
      description,
      duration,
      passingScore,
      totalPoints,
      questions,
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

    const newPretest = new PretestSheet({
      chapter,
      subject: subject || chapterExists.subject,
      createdBy: req.userId, // Admin who creates
      title,
      description,
      duration,
      passingScore: passingScore || 60,
      totalPoints: totalPoints || 100,
      questions: questions || [],
      isActive: isActive !== undefined ? isActive : true,
      allowRetake: allowRetake || false,
      maxAttempts: maxAttempts || 1,
      shuffleQuestions: shuffleQuestions || false,
      showCorrectAnswers:
        showCorrectAnswers !== undefined ? showCorrectAnswers : true,
    });

    await newPretest.save();

    res.status(201).json({
      message: "สร้างแบบทดสอบสำเร็จ",
      pretest: newPretest,
    });
  } catch (error) {
    console.error("Error creating pretest:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการสร้างแบบทดสอบ",
      error: error.message,
    });
  }
};

// Get Pretests by Chapter
const getPretestsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const pretests = await PretestSheet.find({ chapter: chapterId })
      .populate("chapter", "chapter_name")
      .sort({ createdAt: -1 });

    res.status(200).json({ pretests });
  } catch (error) {
    console.error("Error fetching pretests:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล", error: error.message });
  }
};

// Get All Pretests
const getAllPretests = async (req, res) => {
  try {
    const pretests = await PretestSheet.find()
      .populate("chapter", "chapter_name")
      .populate("subject", "subject_name code")
      .sort({ createdAt: 1 });

    res.status(200).json({ pretests });
  } catch (error) {
    console.error("Error fetching all pretests:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล", error: error.message });
  }
};

// Get Pretest by ID
const getPretestById = async (req, res) => {
  try {
    const { id } = req.params;
    const pretest = await PretestSheet.findById(id)
      .populate("chapter", "chapter_name")
      .populate("subject", "subject_name code");

    if (!pretest) {
      return res.status(404).json({ message: "ไม่พบแบบทดสอบ" });
    }

    res.status(200).json({ pretest });
  } catch (error) {
    console.error("Error fetching pretest:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล", error: error.message });
  }
};

// Update Pretest
const updatePretest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const pretest = await PretestSheet.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!pretest) {
      return res.status(404).json({ message: "ไม่พบแบบทดสอบ" });
    }

    res.status(200).json({
      message: "อัปเดตแบบทดสอบสำเร็จ",
      pretest,
    });
  } catch (error) {
    console.error("Error updating pretest:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการอัปเดต", error: error.message });
  }
};

// Delete Pretest
const deletePretest = async (req, res) => {
  try {
    const { id } = req.params;
    const pretest = await PretestSheet.findByIdAndDelete(id);

    if (!pretest) {
      return res.status(404).json({ message: "ไม่พบแบบทดสอบ" });
    }

    res.status(200).json({ message: "ลบแบบทดสอบสำเร็จ" });
  } catch (error) {
    console.error("Error deleting pretest:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการลบ", error: error.message });
  }
};

// Add Question to Pretest
const addQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      questionText,
      questionType,
      options,
      correctAnswer,
      matchingPairs,
      points,
      explanation,
    } = req.body;

    const pretest = await PretestSheet.findById(id);
    if (!pretest) {
      return res.status(404).json({ message: "ไม่พบแบบทดสอบ" });
    }

    pretest.questions.push({
      questionText,
      questionType: questionType || "multiple-choice",
      options: options || [],
      correctAnswer,
      matchingPairs: matchingPairs || [],
      points: points || 1,
      explanation,
    });

    // Update total points
    pretest.totalPoints = pretest.questions.reduce(
      (sum, q) => sum + (q.points || 1),
      0
    );

    await pretest.save();

    res.status(200).json({
      message: "เพิ่มคำถามสำเร็จ",
      pretest,
    });
  } catch (error) {
    console.error("Error adding question:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการเพิ่มคำถาม", error: error.message });
  }
};

// Update Question in Pretest
const updateQuestion = async (req, res) => {
  try {
    const { id, questionIndex } = req.params;
    const updateData = req.body;

    const pretest = await PretestSheet.findById(id);
    if (!pretest) {
      return res.status(404).json({ message: "ไม่พบแบบทดสอบ" });
    }

    if (questionIndex < 0 || questionIndex >= pretest.questions.length) {
      return res.status(404).json({ message: "ไม่พบคำถาม" });
    }

    // Update question fields
    Object.keys(updateData).forEach((key) => {
      pretest.questions[questionIndex][key] = updateData[key];
    });

    // Recalculate total points
    pretest.totalPoints = pretest.questions.reduce(
      (sum, q) => sum + (q.points || 1),
      0
    );

    await pretest.save();

    res.status(200).json({
      message: "อัปเดตคำถามสำเร็จ",
      pretest,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการอัปเดตคำถาม",
      error: error.message,
    });
  }
};

// Delete Question from Pretest
const deleteQuestion = async (req, res) => {
  try {
    const { id, questionIndex } = req.params;

    const pretest = await PretestSheet.findById(id);
    if (!pretest) {
      return res.status(404).json({ message: "ไม่พบแบบทดสอบ" });
    }

    if (questionIndex < 0 || questionIndex >= pretest.questions.length) {
      return res.status(404).json({ message: "ไม่พบคำถาม" });
    }

    pretest.questions.splice(questionIndex, 1);

    // Recalculate total points
    pretest.totalPoints = pretest.questions.reduce(
      (sum, q) => sum + (q.points || 1),
      0
    );

    await pretest.save();

    res.status(200).json({
      message: "ลบคำถามสำเร็จ",
      pretest,
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการลบคำถาม", error: error.message });
  }
};

module.exports = {
  createPretest,
  getPretestsByChapter,
  getAllPretests,
  getPretestById,
  updatePretest,
  deletePretest,
  addQuestion,
  updateQuestion,
  deleteQuestion,
};
