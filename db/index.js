const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/crane-marketplace";

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.warn("ADMIN_EMAIL or ADMIN_PASSWORD not set – skipping admin seed");
    return;
  }

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    console.log("Admin user already exists");
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await User.create({
    name: "Administrator",
    email: adminEmail,
    password: passwordHash,
    role: "admin",
  });

  console.log(`Admin user seeded: ${adminEmail}`);
}

// database connection
async function connectDB() {
  try {
    const connection = await mongoose.connect(MONGO_URI);

    console.log(
      `Connected to MongoDB. Database name: "${connection.connections[0].name}"`
    );

    await seedAdmin();
  } catch (error) {
    console.log("MongoDB connection error:", error);
    throw error;
  }
}

module.exports = connectDB;
