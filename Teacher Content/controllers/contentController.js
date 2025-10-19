const Content = require("../models/Content");
const fs = require("fs");

// Helper: safely parse quiz
function parseQuiz(quiz) {
  if (!quiz) return [];
  if (typeof quiz === "string") return JSON.parse(quiz);
  return quiz;
}

exports.createContent = async (req, res) => {
  try {
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { title, description, type, module, visibility } = req.body;
    const fileUrl = req.file ? req.file.path.replace(/\\/g, "/") : null;
    const quiz = type === "quiz" ? parseQuiz(req.body.quiz) : [];

    const content = new Content({ title, description, type, module, visibility, fileUrl, quiz });
    await content.save();

    res.status(201).json(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getContents = async (req, res) => {
  try {
    const contents = await Content.find().sort({ createdAt: -1 });
    res.json(contents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ error: "Not found" });
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const { title, description, type, module, visibility } = req.body;
    const fileUrl = req.file ? req.file.path.replace(/\\/g, "/") : undefined;

    const updated = { title, description, type, module, visibility };
    if (fileUrl) updated.fileUrl = fileUrl;
    if (type === "quiz") updated.quiz = parseQuiz(req.body.quiz);

    const content = await Content.findByIdAndUpdate(req.params.id, updated, { new: true });
    if (!content) return res.status(404).json({ error: "Not found" });

    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);
    if (!content) return res.status(404).json({ error: "Not found" });

    if (content.fileUrl) {
      try { fs.unlinkSync(content.fileUrl); } catch (e) {}
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
