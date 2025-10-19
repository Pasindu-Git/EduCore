const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const auditLogSchema = new Schema({
  action: { type: String, required: true }, // e.g. "CREATE_USER", "DELETE_ENROLLMENT"
  performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  targetModel: { type: String, required: true }, // e.g. "User", "Enrollment"
  targetId: { type: Schema.Types.ObjectId }, // which record was affected
  description: { type: String },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", auditLogSchema);
