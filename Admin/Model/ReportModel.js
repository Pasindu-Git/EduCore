const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema({
  type: String, // "attendance", "activity", "audit"
  params: Schema.Types.Mixed,
  fileUrl: String, // if exported
  generatedBy: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Report", reportSchema);
