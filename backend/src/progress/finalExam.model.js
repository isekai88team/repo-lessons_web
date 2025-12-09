const mongoose = require("mongoose");

const finalExamSchema = new mongoose.Schema(
  {
    // ข้อมูลการอ้างอิง
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    // ข้อมูลแบบทดสอบ
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true }, // เวลาที่ใช้ทำ (นาที)
    passingScore: { type: Number, default: 60 }, // คะแนนที่ผ่าน (%)
    totalPoints: { type: Number, required: true },

    // โครงสร้างคำถาม (เหมือน Pretest)
    questions: [
      {
        questionText: { type: String, required: true },
        questionType: {
          type: String,
          enum: ["multiple-choice", "true-false", "short-answer", "matching"],
          default: "multiple-choice",
        },
        options: [{ type: String }],
        correctAnswer: { type: String },
        matchingPairs: [
          {
            left: { type: String },
            right: { type: String },
          },
        ],
        points: { type: Number, default: 1 },
        explanation: { type: String },
      },
    ],

    // การตั้งค่า
    isActive: { type: Boolean, default: true },
    shuffleQuestions: { type: Boolean, default: true },
    showCorrectAnswers: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One final exam per subject
finalExamSchema.index({ subject: 1 }, { unique: true });

const FinalExam = mongoose.model("FinalExam", finalExamSchema);
module.exports = FinalExam;
