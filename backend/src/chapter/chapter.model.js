const mongoose = require("mongoose");
const chapterSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    chapter_name: { type: String, required: true },
    description: { type: String },
    // vedio_url: { type: String },
    // vedio_key: { type: String },
    // document_url: { type: String },
    // document_key: { type: String },

  },
  { timestamps: true }
);

const Chapter = mongoose.model("Chapter", chapterSchema);
module.exports = Chapter;

// {
//     "subject": "id_of_subject",
//     "chapter_name": "บทที่ 1 บทนำสู่การเขียนโปรแกรม",
//     "description": "บทนี้จะเป็นการปูพื้นฐานเกี่ยวกับการเขียนโปรแกรมเบื้องต้น รวมถึงแนวคิดและหลักการต่างๆ ที่สำคัญ",
// }
