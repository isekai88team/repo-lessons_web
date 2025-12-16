const mongoose = require("mongoose");

const pretestSchema = new mongoose.Schema(
  {
    // ข้อมูลการอ้างอิง
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    // ข้อมูลแบบทดสอบ
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true }, // เวลาที่ใช้ทำ (นาที)
    passingScore: { type: Number, default: 60 }, // คะแนนที่ผ่าน (เปอร์เซ็นต์)
    totalPoints: { type: Number, required: true }, // คะแนนเต็ม

    // โครงสร้างคำถาม
    questions: [
      {
        questionText: { type: String, required: true },
        questionImage: { type: String }, // URL รูปภาพประกอบคำถาม
        questionType: {
          type: String,
          enum: ["multiple-choice", "true-false", "short-answer", "matching"],
          default: "multiple-choice",
        },
        options: [{ type: String }], // ตัวเลือกสำหรับปรนัย
        correctAnswer: { type: String }, // ไม่ required เพราะ matching ใช้ matchingPairs แทน
        // สำหรับคำถามแบบจับคู่
        matchingPairs: [
          {
            left: { type: String }, // ข้อความด้านซ้าย (โจทย์)
            leftImage: { type: String }, // URL รูปภาพด้านซ้าย
            right: { type: String }, // คำตอบที่ถูกต้องด้านขวา
            rightImage: { type: String }, // URL รูปภาพด้านขวา
          },
        ],
        points: { type: Number, default: 1 },
        explanation: { type: String }, // คำอธิบายคำตอบ
      },
    ],

    // การตั้งค่า
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    allowRetake: { type: Boolean, default: false },
    maxAttempts: { type: Number, default: 1 },
    shuffleQuestions: { type: Boolean, default: false },
    showCorrectAnswers: { type: Boolean, default: true }, // แสดงเฉลยหลังส่งคำตอบ
  },
  { timestamps: true }
);

const PretestSheet = mongoose.model("PretestSheet", pretestSchema);
module.exports = PretestSheet;
