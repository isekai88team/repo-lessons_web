const mongoose = require("mongoose");
const studentSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    email: { type: String, unique: true },
    classRoom: { type: String, required: true },
    profileImage: { type: String, default: "" },
    bio: { type: String, default: "" },
    dateOfBirth: { type: Date },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
