const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/crane-marketplace";

const User = require("../models/User.model");

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.warn(
      "⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set – skipping admin seed"
    );
    return;
  }

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log("✅  Admin user already exists");
    return;
  }

  const hash = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: "Administrator",
    email: adminEmail,
    password: hash,
    role: "admin",
  });
  console.log(`✅  Admin user seeded: ${adminEmail}`);
}

mongoose
  .connect(MONGO_URI)
  .then((x) => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
    return seedAdmin();
  })
  .catch((err) => {
    console.error("Error connecting to mongo: ", err);
  });
