const mongoose = require("mongoose");

const pretestResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    pretest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PretestSheet",
      required: true,
    },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    answers: [
      {
        questionIndex: { type: Number },
        selectedOption: { type: String },
        isCorrect: { type: Boolean },
      },
    ],
    finishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const PretestResult = mongoose.model("PretestResult", pretestResultSchema);
module.exports = PretestResult;
