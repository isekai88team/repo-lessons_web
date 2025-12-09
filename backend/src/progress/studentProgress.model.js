const mongoose = require("mongoose");

const studentProgressSchema = new mongoose.Schema(
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
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },

    // Content Progress
    videoWatched: { type: Boolean, default: false },
    videoProgress: { type: Number, default: 0, min: 0, max: 100 }, // %
    documentViewed: { type: Boolean, default: false },

    // Pretest
    pretestCompleted: { type: Boolean, default: false },
    pretestScore: { type: Number },
    pretestPercentage: { type: Number },
    pretestPassed: { type: Boolean },
    pretestAttempts: { type: Number, default: 0 },
    pretestLastAttempt: { type: Date },

    // Posttest
    posttestCompleted: { type: Boolean, default: false },
    posttestScore: { type: Number },
    posttestPercentage: { type: Number },
    posttestPassed: { type: Boolean },
    posttestAttempts: { type: Number, default: 0 },
    posttestLastAttempt: { type: Date },

    // Chapter completed when: video watched + posttest passed
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound index for unique progress per student per chapter
studentProgressSchema.index({ student: 1, chapter: 1 }, { unique: true });

const StudentProgress = mongoose.model(
  "StudentProgress",
  studentProgressSchema
);
module.exports = StudentProgress;
