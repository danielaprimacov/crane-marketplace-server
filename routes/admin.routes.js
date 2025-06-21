const express = require("express");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { isAdmin } = require("../middleware/role.middleware");

const router = express.Router();

router.get("/dashboard", isAuthenticated, isAdmin, (req, res, next) => {
  res.json({ message: "Admin data" });
});

module.exports = router;
