const mongoose = require("mongoose");
const { Schema } = mongoose;

const feedbackSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" }, // optional link
    email: { type: String, trim: true, lowercase: true }, // <- store email if not anonymous
    anonymous: { type: Boolean, default: false },         // <- flag

    role: { type: String, trim: true, default: "Student" },
    text: { type: String, required: true, trim: true, maxlength: 5000 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    resolved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// If anonymous, strip identifiers (optional safety)
feedbackSchema.pre("save", function (next) {
  if (this.anonymous) {
    this.user = undefined;
    this.email = undefined;
  }
  next();
});

feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
