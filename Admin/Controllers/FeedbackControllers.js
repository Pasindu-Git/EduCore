// controllers/feedbackController.js
const mongoose = require("mongoose");
const Feedback = require("../Model/FeedbackModel");

/**
 * POST /api/feedback
 * Body:
 *  - text: string (required)
 *  - rating: number 1..5 (required)
 *  - role: string (optional)
 *  - anonymous: boolean (optional, default false)
 *  - email: string (optional; used only when anonymous === false)
 *  - userId: string (optional; used only when anonymous === false)
 */
exports.createFeedback = async (req, res) => {
  try {
    const {
      text,
      rating,
      role,
      anonymous = false,
      email,
      userId,
    } = req.body || {};

    // ---- validation ----
    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: "Feedback text is required." });
    }
    const rateNum = Number(rating);
    if (!Number.isFinite(rateNum) || rateNum < 1 || rateNum > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be a number between 1 and 5." });
    }

    // ---- build doc ----
    const doc = {
      text: String(text).trim(),
      rating: rateNum,
      role: (role && String(role).trim()) || "Student",
      anonymous: Boolean(anonymous),
      resolved: false,
    };

    // If NOT anonymous, keep identifiers that the frontend sent
    if (!doc.anonymous) {
      if (email && String(email).trim()) {
        doc.email = String(email).trim();
      }
      if (userId && String(userId).trim()) {
        // cast to ObjectId safely
        try {
          doc.user = new mongoose.Types.ObjectId(String(userId).trim());
        } catch {
          // ignore bad userId; continue without linking user
        }
      }
    }

    // ---- save ----
    const fb = new Feedback(doc);
    await fb.save();

    // return with populated user fields
    const saved = await Feedback.findById(fb._id).populate({
      path: "user",
      select: "firstName lastName email",
    });

    return res.status(201).json({ fb: saved });
  } catch (err) {
    console.error("createFeedback error:", err);
    return res.status(500).json({ message: "Failed to create feedback." });
  }
};

/**
 * GET /api/feedback
 * (Frontend decides whether to show identity based on `anonymous` flag.)
 */
exports.getAll = async (req, res) => {
  try {
    const f = await Feedback.find({})
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "firstName lastName email" });

    return res.json({ feedback: f });
  } catch (err) {
    console.error("getAll feedback error:", err);
    return res.status(500).json({ message: "Failed to fetch feedback." });
  }
};

/**
 * PUT /api/feedback/:id/resolve
 */
exports.resolve = async (req, res) => {
  try {
    const fb = await Feedback.findByIdAndUpdate(
      req.params.id,
      { $set: { resolved: true } },
      { new: true }
    ).populate({ path: "user", select: "firstName lastName email" });

    if (!fb) {
      return res.status(404).json({ message: "Feedback not found." });
    }
    return res.json({ fb });
  } catch (err) {
    console.error("resolve feedback error:", err);
    return res.status(500).json({ message: "Failed to resolve feedback." });
  }
};
