const mongoose = require("mongoose");

const testResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    testType: {
      type: String,
      enum: ["pretest", "posttest", "final"],
      required: true,
    },
    // Reference to the test sheet
    testRef: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "testModel",
      required: true,
    },
    testModel: {
      type: String,
      enum: ["PretestSheet", "PosttestSheet", "FinalExam"],
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
    }, // null for final exam

    // Results
    score: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },

    // Answers (for review)
    answers: [
      {
        questionIndex: Number,
        questionText: String,
        userAnswer: mongoose.Schema.Types.Mixed,
        correctAnswer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean,
        points: Number,
      },
    ],

    startedAt: { type: Date },
    submittedAt: { type: Date, default: Date.now },
    duration: { type: Number }, // seconds taken
  },
  { timestamps: true }
);

// Index for querying student results
testResultSchema.index({ student: 1, testType: 1, chapter: 1 });
testResultSchema.index({ student: 1, subject: 1 });

const TestResult = mongoose.model("TestResult", testResultSchema);
module.exports = TestResult;
