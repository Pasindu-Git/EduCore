const mongoose = require("mongoose");

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }
});

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ["pdf", "video", "slide", "quiz", "assignment"], required: true },
  module: { type: String, required: true },
  visibility: { type: String, enum: ["public", "restricted"], default: "public" },
  fileUrl: { type: String },
  quiz: [quizQuestionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Content", contentSchema);
