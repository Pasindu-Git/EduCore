// seedAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./Model/UserModel");
const Role = require("./Model/RoleModel");

const MONGO_URI = "mongodb+srv://admin:vMlVpfShLff2bKZ0@cluster0.v9tonu6.mongodb.net/";

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if Admin role exists
    let adminRole = await Role.findOne({ name: "Admin" });
    if (!adminRole) {
      adminRole = await Role.create({ name: "Admin" });
      console.log("Created Admin role");
    }

    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    // Create admin user
    const adminUser = new User({
      firstName: "Super",
      lastName: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: adminRole._id,
      status: "active",
      isEmailVerified: true
    });

    await adminUser.save();
    console.log("Admin user created successfully!");
    console.log("Email: admin@example.com | Password: Admin@123");
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();
