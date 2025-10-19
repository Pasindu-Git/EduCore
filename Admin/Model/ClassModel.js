const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classSchema = new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  instructors: [{ type: Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.model("Class", classSchema);
