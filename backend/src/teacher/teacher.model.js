const mongoose = require("mongoose");
const teacherSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    subjects: [{ type: String, required: true }],
    classRoom: [{ type: String, required: true }],
  },
  { timestamps: true }
);
const Teacher = mongoose.model("Teacher", teacherSchema);
module.exports = Teacher;
