const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const { isAuthenticated } = require("../middleware/jwt.middleware");

const router = express.Router();
const saltRounds = 10;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_REGEX = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

// POST /auth/signup
router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1) Basic required fields check
    if (![name, email, password].every(Boolean)) {
      return res
        .status(400)
        .json({ message: "Provide name, email and password." });
    }

    // 2) Validate email & password format
    if (!EMAIL_REGEX.test(email)) {
      return res
        .status(400)
        .json({ message: "Provide a valid email address." });
    }
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 chars, include one number, one lowercase and one uppercase letter.",
      });
    }

    // 3) Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // 4) Hash & create
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 5) Return safe user data
    const { _id, role } = newUser;
    res.status(201).json({ user: { _id, name, email, role } });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
router.post("/login", async (req, res, next) => {
  try {
    
    const { email, password } = req.body;
    if (![email, password].every(Boolean)) {
      return res.status(400).json({ message: "Provide email and password." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found or inactive." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const payload = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "6h",
    });

    res
      .cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict", // or "Lax" if you need cross-site popups
        maxAge: 6 * 60 * 60 * 1000, // 6 hours in ms
      })
      .status(200)
      .json({ authToken: token });
  } catch (err) {
    next(err);
  }
});

// GET /auth/verify
router.get("/verify", isAuthenticated, (req, res) => {
  // req.payload is set in your jwt middleware
  res.status(200).json(req.payload);
});

module.exports = router;
