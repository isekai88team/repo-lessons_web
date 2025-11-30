const mongoose = require("mongoose");
const subjectSchema = new mongoose.Schema({
  subject_name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  teacher : { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
},{ timestamps: true });

const Subject = mongoose.model("Subject", subjectSchema);
module.exports = Subject;

// {
//     "subject_name": "คณิตศาสตร์พื้นฐาน",
//     "code": "112001",
//     "description": "วิชานี้เป็นการปูพื้นฐานทางคณิตศาสตร์ที่สำคัญสำหรับนักเรียนในระดับมัธยมศึกษา"
//     "teacher": "id_of_teacher"
// }