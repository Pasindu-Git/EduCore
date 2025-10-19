const Enrollment = require("../Model/EnrollmentModel");

exports.getAll = async (req, res, next) => {
  try {
    const list = await Enrollment.find()
      .populate("student", "firstName lastName email")
      .populate("class", "code name");
    res.json({ enrollments: list });
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const { student, class: classId } = req.body;
    if (!student || !classId) return res.status(400).json({ message: "student and class required" });

    const e = new Enrollment({ student, class: classId });
    await e.save();
    res.status(201).json({ enrollment: e });
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const e = await Enrollment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!e) return res.status(404).json({ message: "Not found" });
    res.json({ enrollment: e });
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    await Enrollment.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) { next(e); }
};
