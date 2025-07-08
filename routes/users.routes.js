const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.get("/profile", isAuthenticated, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.patch("/profile", isAuthenticated, async (req, res) => {
  try {
    const updates = {};
    const { name, email, currentPassword, newPassword } = req.body;

    if (name) updates.name = name;
    if (email) updates.email = email;

    // if the client wants to change password, they must supply current + new
    if (currentPassword && newPassword) {
      const me = await User.findById(req.payload._id);
      const ok = await bcrypt.compare(currentPassword, me.password);
      if (!ok)
        return res.status(400).json({ message: "Current password is wrong" });
      updates.password = await bcrypt.hash(newPassword, 12);
    }

    const user = await User.findByIdAndUpdate(req.payload._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.delete("/profile", isAuthenticated, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.payload._id);
    res.status(204).end();
  } catch (error) {
    
    
    next(error);
  }
});

module.exports = router;
