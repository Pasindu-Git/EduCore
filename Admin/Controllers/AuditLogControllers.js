const AuditLog = require("../Model/AuditLogModel");

// GET all logs (admin only)
exports.getAll = async (req, res) => {
  const logs = await AuditLog.find().populate("performedBy", "firstName lastName email role");
  res.json({ logs });
};

// Create log (helper - used internally in other controllers)
exports.createLog = async ({ action, performedBy, targetModel, targetId, description, ipAddress }) => {
  const log = new AuditLog({
    action,
    performedBy,
    targetModel,
    targetId,
    description,
    ipAddress
  });
  await log.save();
};
