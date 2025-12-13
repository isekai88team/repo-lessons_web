const mongoose = require("mongoose");

const worksheetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      default: null,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    // Image files (can have multiple)
    images: [
      {
        url: String,
        key: String,
        originalName: String,
      },
    ],
    // Document file (PDF/DOC)
    document: {
      url: String,
      key: String,
      originalName: String,
      fileType: String, // "pdf" or "doc"
    },
    // Deadline for submission
    deadline: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

const Worksheet = mongoose.model("Worksheet", worksheetSchema);

module.exports = Worksheet;
