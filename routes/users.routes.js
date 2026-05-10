const express = require("express");

const { isAuthenticated } = require("../middleware/jwt.middleware");
const validateRequest = require("../middleware/validateRequest.middleware");

const { updateProfileSchema } = require("../validations/user.validation");

const {
  getProfile,
  updateProfile,
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

router.delete("/profile", isAuthenticated, deleteProfile);

module.exports = router;
