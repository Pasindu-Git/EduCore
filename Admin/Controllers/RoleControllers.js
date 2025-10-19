const Role = require("../Model/RoleModel");

exports.getAllRoles = async (req, res) => {
  const roles = await Role.find();
  res.json({ roles });
};

exports.createRole = async (req, res) => {
  const { name, permissions } = req.body;
  const role = new Role({ name, permissions });
  await role.save();
  res.status(201).json({ role });
};

exports.updateRole = async (req, res) => {
  const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ role });
};

exports.deleteRole = async (req, res) => {
  await Role.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
