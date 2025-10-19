const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  phone:     { type: String }, // keep as string for leading zeros / +country
  password:  { type: String, required: true },
  role:      { type: Schema.Types.ObjectId, ref: "Role", required: true },
  status:    { type: String, enum: ["active","disabled","pending"], default: "pending" },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);


