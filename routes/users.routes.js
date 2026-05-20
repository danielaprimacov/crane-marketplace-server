const express = require("express");

const { isAuthenticated } = require("../middleware/jwt.middleware");
const validateRequest = require("../middleware/validateRequest.middleware");

const { updateProfileSchema } = require("../validations/user.validation");

const {
  getProfile,
  updateProfile,
  exportProfile,
  deleteProfile,
} = require("../controllers/user.controller");

const router = express.Router();

router.get("/profile", isAuthenticated, getProfile);

router.patch(
  "/profile",
  isAuthenticated,
  validateRequest(updateProfileSchema),
  updateProfile
);

router.get("/me/export", isAuthenticated, exportProfile);

router.delete("/me", isAuthenticated, deleteProfile);

router.delete("/profile", isAuthenticated, deleteProfile);

module.exports = router;
