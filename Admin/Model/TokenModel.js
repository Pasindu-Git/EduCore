const mongoose = require('mongoose');

const VerificationTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['email','phone'], required: true },
  token: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
  consumedAt: Date
}, { timestamps: true });
VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
  consumedAt: Date
}, { timestamps: true });
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = {
  VerificationToken: mongoose.model('VerificationToken', VerificationTokenSchema),
  PasswordResetToken: mongoose.model('PasswordResetToken', PasswordResetTokenSchema)
};
