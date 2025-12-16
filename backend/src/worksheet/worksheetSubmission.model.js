const mongoose = require("mongoose");

const worksheetSubmissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    worksheet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worksheet",
      required: true,
    },
    // Team members for group work
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    // File uploaded by student
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String, // e.g., 'pdf', 'image'
    },
    fileName: {
      type: String,
    },

    // Status
    status: {
      type: String,
      enum: ["submitted", "late", "approved", "rejected", "graded"],
      default: "submitted",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },

    // Grading
    score: {
      type: Number,
    },
    feedback: {
      type: String,
    },
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    checkedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Allow one submission per student per worksheet?
// For now, let's keep it simple. If they resubmit, we might update this or create new.
// Let's index for quick lookup
worksheetSubmissionSchema.index({ student: 1, worksheet: 1 });

const WorksheetSubmission = mongoose.model(
  "WorksheetSubmission",
  worksheetSubmissionSchema
);

module.exports = WorksheetSubmission;
