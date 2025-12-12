const FinalExam = require("./finalExam.model");
const PretestSheet = require("../pretestsheet/pretestsheet.model");
const Teacher = require("../teacher/teacher.model");
const Subject = require("../subject/subject.model");
const Chapter = require("../chapter/chapter.model");

// ========== Helper: Shuffle Array ==========
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ========== Get All Pretest Questions (grouped by chapter) ==========
const getAllPretestQuestions = async (req, res) => {
  try {
    const { subjectId } = req.query;

    // Find teacher "Nu"
    const teacher = await Teacher.findOne({
      $or: [{ firstName: "nu" }, { firstName: "Nu" }, { username: "nu" }],
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher Nu not found" });
    }

    // Build query - Find pretests by subject (Subject is linked to Teacher Nu)
    let query = { isActive: true };

    if (subjectId) {
      // If specific subjectId provided, use it directly
      query.subject = subjectId;
    } else {
      // Find all subjects owned by teacher Nu
      const subjects = await Subject.find({ teacher: teacher._id });
      const subjectIds = subjects.map((s) => s._id);
      query.subject = { $in: subjectIds };
    }

    // Get all pretests
    const pretests = await PretestSheet.find(query)
      .populate("chapter", "chapter_name")
      .populate("subject", "subject_name code")
      .sort({ createdAt: 1 });

    // Group questions by chapter
    const questionsByChapter = {};
    let totalQuestions = 0;

    pretests.forEach((pretest) => {
      const chapterId = pretest.chapter?._id?.toString() || "no-chapter";
      const chapterName = pretest.chapter?.chapter_name || "ไม่มีบท";

      if (!questionsByChapter[chapterId]) {
        questionsByChapter[chapterId] = {
          chapterId,
          chapterName,
          questions: [],
        };
      }

      pretest.questions.forEach((q, index) => {
        questionsByChapter[chapterId].questions.push({
          _id: `${pretest._id}-${index}`,
          pretestId: pretest._id,
          pretestTitle: pretest.title,
          questionIndex: index,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          correctAnswer: q.correctAnswer,
          matchingPairs: q.matchingPairs,
          points: q.points || 1,
          explanation: q.explanation,
        });
        totalQuestions++;
      });
    });

    res.status(200).json({
      teacher: {
        _id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
      },
      chapters: Object.values(questionsByChapter),
      totalQuestions,
    });
  } catch (error) {
    console.error("Error fetching pretest questions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========== Create Final Exam ==========
const createFinalExam = async (req, res) => {
  try {
    const {
      subjectId,
      title,
      description,
      duration,
      passingScore,
      selectionMode, // 'random', 'perChapter', 'specific'
      questionCount, // for random mode
      chapterCounts, // for perChapter mode: { chapterId: count }
      selectedQuestions, // for specific mode: array of question objects
      shuffleQuestions,
      showCorrectAnswers,
    } = req.body;

    // Validate subject
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Check if final exam already exists for this subject
    const existingExam = await FinalExam.findOne({ subject: subjectId });
    if (existingExam) {
      return res.status(400).json({
        message:
          "Final exam already exists for this subject. Please edit instead.",
        existingId: existingExam._id,
      });
    }

    // Get all pretests for this subject
    const pretests = await PretestSheet.find({
      subject: subjectId,
      isActive: true,
    }).populate("chapter", "chapter_name");

    // Collect all questions
    let allQuestions = [];
    pretests.forEach((pretest) => {
      pretest.questions.forEach((q) => {
        allQuestions.push({
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          correctAnswer: q.correctAnswer,
          matchingPairs: q.matchingPairs,
          points: q.points || 1,
          explanation: q.explanation,
          sourceChapter: pretest.chapter?._id,
          sourcePretest: pretest._id,
        });
      });
    });

    let finalQuestions = [];

    // Select questions based on mode
    if (selectionMode === "random") {
      // Shuffle and pick random questions
      const shuffled = shuffleArray(allQuestions);
      finalQuestions = shuffled.slice(
        0,
        Math.min(questionCount, allQuestions.length)
      );
    } else if (selectionMode === "perChapter") {
      // Group by chapter and pick specified count from each
      const byChapter = {};
      allQuestions.forEach((q) => {
        const chId = q.sourceChapter?.toString() || "no-chapter";
        if (!byChapter[chId]) byChapter[chId] = [];
        byChapter[chId].push(q);
      });

      Object.entries(chapterCounts || {}).forEach(([chapterId, count]) => {
        const chapterQuestions = byChapter[chapterId] || [];
        const shuffled = shuffleArray(chapterQuestions);
        finalQuestions.push(...shuffled.slice(0, count));
      });
    } else if (selectionMode === "specific") {
      // Use specifically selected questions
      finalQuestions = selectedQuestions.map((q) => ({
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        correctAnswer: q.correctAnswer,
        matchingPairs: q.matchingPairs,
        points: q.points || 1,
        explanation: q.explanation,
      }));
    }

    // Calculate total points
    const totalPoints = finalQuestions.reduce(
      (sum, q) => sum + (q.points || 1),
      0
    );

    // Create final exam
    const finalExam = new FinalExam({
      subject: subjectId,
      title: title || `Final Exam - ${subject.subject_name}`,
      description,
      duration: duration || 60,
      passingScore: passingScore || 60,
      totalPoints,
      questions: finalQuestions,
      isActive: true,
      shuffleQuestions:
        shuffleQuestions !== undefined ? shuffleQuestions : true,
      showCorrectAnswers:
        showCorrectAnswers !== undefined ? showCorrectAnswers : true,
    });

    await finalExam.save();

    res.status(201).json({
      message: "Final exam created successfully",
      finalExam,
    });
  } catch (error) {
    console.error("Error creating final exam:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========== Get Final Exam by Subject ==========
const getFinalExam = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const finalExam = await FinalExam.findOne({ subject: subjectId }).populate(
      "subject",
      "subject_name code"
    );

    if (!finalExam) {
      return res.status(404).json({ message: "Final exam not found" });
    }

    res.status(200).json({ finalExam });
  } catch (error) {
    console.error("Error fetching final exam:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========== Get Final Exam by ID ==========
const getFinalExamById = async (req, res) => {
  try {
    const { id } = req.params;

    const finalExam = await FinalExam.findById(id).populate(
      "subject",
      "subject_name code"
    );

    if (!finalExam) {
      return res.status(404).json({ message: "Final exam not found" });
    }

    res.status(200).json({ finalExam });
  } catch (error) {
    console.error("Error fetching final exam:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========== Update Final Exam ==========
const updateFinalExam = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Recalculate total points if questions changed
    if (updateData.questions) {
      updateData.totalPoints = updateData.questions.reduce(
        (sum, q) => sum + (q.points || 1),
        0
      );
    }

    const finalExam = await FinalExam.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!finalExam) {
      return res.status(404).json({ message: "Final exam not found" });
    }

    res.status(200).json({
      message: "Final exam updated successfully",
      finalExam,
    });
  } catch (error) {
    console.error("Error updating final exam:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========== Delete Final Exam ==========
const deleteFinalExam = async (req, res) => {
  try {
    const { id } = req.params;

    const finalExam = await FinalExam.findByIdAndDelete(id);

    if (!finalExam) {
      return res.status(404).json({ message: "Final exam not found" });
    }

    res.status(200).json({ message: "Final exam deleted successfully" });
  } catch (error) {
    console.error("Error deleting final exam:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllPretestQuestions,
  createFinalExam,
  getFinalExam,
  getFinalExamById,
  updateFinalExam,
  deleteFinalExam,
};
