const Report = require("../Model/ReportModel");

// Create a report record (generation logic separately)
exports.createReport = async (req, res) => {
  const r = new Report(req.body);
  await r.save();
  res.status(201).json({ report: r });
};

exports.getAll = async (req, res) => {
  const r = await Report.find();
  res.json({ reports: r });
};
