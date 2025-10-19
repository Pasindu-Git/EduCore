const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const enrollmentSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
  status: { type: String, enum: ["enrolled", "completed", "dropped"], default: "enrolled" },
  enrolledAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
