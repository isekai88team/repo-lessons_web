const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },

    // Final Exam
    finalExamCompleted: { type: Boolean, default: false },
    finalExamScore: { type: Number },
    finalExamPercentage: { type: Number },
    finalExamPasssed: { type: Boolean },
  },
  { timestamps: true }
);

// Compound index for unique enrollment
enrollmentSchema.index({ student: 1, subject: 1 }, { unique: true });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
module.exports = Enrollment;
