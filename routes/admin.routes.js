const express = require("express");

const { isAuthenticated } = require("../middleware/jwt.middleware");
const requireRole = require("../middleware/requireRole.middleware");
const ROLES = require("../constants/roles");

const { getAdminCranes } = require("../controllers/crane.controller");

const router = express.Router();

// Admin test route
router.get("/", isAuthenticated, requireRole(ROLES.ADMIN), (req, res) => {
  res.status(200).json({
    message: "Admin data",
  });
});

// Admin crane list
router.get(
  "/cranes",
  isAuthenticated,
  requireRole(ROLES.ADMIN),
  getAdminCranes
);

module.exports = router;
