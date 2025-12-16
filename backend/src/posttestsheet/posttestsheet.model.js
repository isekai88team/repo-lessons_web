const mongoose = require("mongoose");

const posttestSchema = new mongoose.Schema(
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

    // เชื่อมโยงกับ Pretest ต้นทาง (สุ่มคำถามจาก Pretest นี้)
    sourcePretest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PretestSheet",
      required: true,
    },

    // ข้อมูลแบบทดสอบ
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true }, // เวลาที่ใช้ทำ (นาที)
    passingScore: { type: Number, default: 60 }, // คะแนนที่ผ่าน (เปอร์เซ็นต์)

    // จำนวนคำถามที่จะสุ่มจาก Pretest
    questionCount: { type: Number, default: 5 }, // จำนวนคำถามทั้งหมด
    selectionMethod: {
      type: String,
      enum: ["random", "specific"],
      default: "random",
    }, // วิธีเลือกคำถาม

    // จำนวนคำถามแต่ละประเภทที่จะสุ่ม (สำหรับ specific mode)
    multipleChoiceCount: { type: Number, default: 5 }, // จำนวนปรนัย
    trueFalseCount: { type: Number, default: 3 }, // จำนวนถูก/ผิด
    shortAnswerCount: { type: Number, default: 2 }, // จำนวนตอบสั้น
    matchingCount: { type: Number, default: 2 }, // จำนวนจับคู่

    // การตั้งค่า
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    allowRetake: { type: Boolean, default: false },
    maxAttempts: { type: Number, default: 1 },
    shuffleQuestions: { type: Boolean, default: true }, // สุ่มคำถามเสมอสำหรับ Posttest
    showCorrectAnswers: { type: Boolean, default: true }, // แสดงเฉลยหลังส่งคำตอบ
  },
  { timestamps: true }
);

const PosttestSheet = mongoose.model("PosttestSheet", posttestSchema);
module.exports = PosttestSheet;
