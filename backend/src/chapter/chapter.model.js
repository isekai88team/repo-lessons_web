const mongoose = require("mongoose");
const chapterSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    chapter_name: { type: String, required: true },
    description: { type: String },
    video_url: { type: String },
    video_key: { type: String },
    document_url: { type: String },
    document_key: { type: String },
  },
  { timestamps: true }
);

const Chapter = mongoose.model("Chapter", chapterSchema);
module.exports = Chapter;
