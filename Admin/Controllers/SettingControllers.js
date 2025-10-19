const Setting = require("../Model/SettingModel");

exports.getAll = async (req, res) => {
  const settings = await Setting.find();
  res.json({ settings });
};

exports.upsert = async (req, res) => {
  const { key, value, description } = req.body;
  const setting = await Setting.findOneAndUpdate({ key }, { value, description }, { upsert: true, new: true });
  res.json({ setting });
};
