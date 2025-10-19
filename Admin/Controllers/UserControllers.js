const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../Model/UserModel");
const Role = require("../Model/RoleModel");

const saltRounds = 10;

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};


exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query; // optional query param ?role=Teacher

    let query = {};
    if (role) {
      // Find the role object by name
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) {
        query.role = roleDoc._id; // filter by role id
      } else {
        return res.status(404).json({ message: `Role '${role}' not found` });
      }
    }

    const users = await User.find(query).populate("role");
    return res.status(200).json({ users });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("role");

    if(!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role: roleId, password } = req.body;
    if(!email || !password || !firstName || !lastName) return res.status(400).json({ message: "Missing fields" });

    if (!isValidEmail(email))
      return res.status(400).json({ message: "Invalid email format" });

    const exists = await User.findOne({ email });
    if(exists) return res.status(400).json({ message: "Email already exists" });

    const role = await Role.findById(roleId);
    if(!role) return res.status(400).json({ message: "Invalid role" });

    const hashed = await bcrypt.hash(password, saltRounds);
    const user = new User({ firstName, lastName, email, phone, password: hashed, role: role._id, status: "pending" });
    await user.save();

    // TODO: send verification email/phone with token
    return res.status(201).json({ message: "User created", userId: user._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;

     if (updates.email && !isValidEmail(updates.email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }



    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, saltRounds);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).populate("role");
    if(!user) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "Updated", user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.disableUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: "disabled" }, { new: true });
    if(!user) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "Disabled", user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if(!user) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Simulate verification endpoint (would be triggered by email link)
exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isEmailVerified: true, status: "active" }, { new: true });
    if(!user) return res.status(404).json({ message: "Not found" });
    return res.json({ message: "Email verified", user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Request password reset (creates a token to store & later validate)
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // TODO: send token by email - provide link to front-end e.g. /reset-password/:token
    return res.json({ message: "Reset token created", token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Perform password reset using token
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if(!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, saltRounds);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.json({ message: "Password updated" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
