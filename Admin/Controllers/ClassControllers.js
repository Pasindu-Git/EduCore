const Class = require("../Model/ClassModel");

exports.list = async (_req, res, next) => {
  try {
    const classes = await Class.find().populate("instructors", "firstName lastName email");
    res.json({ classes });
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const cls = await Class.create(req.body);
    res.status(201).json({ cls });
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cls) return res.status(404).json({ message: "Class not found" });
    res.json({ cls });
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) { next(e); }
};
