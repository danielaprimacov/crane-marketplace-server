const express = require("express");

const { isAuthenticated } = require("../middleware/jwt.middleware");
const validateRequest = require("../middleware/validateRequest.middleware");

const { signupSchema, loginSchema } = require("../validations/auth.validation");

const { signup, login, verify } = require("../controllers/auth.controller");

const router = express.Router();

// POST /auth/signup
router.post("/signup", validateRequest(signupSchema), signup);

// POST /auth/login
router.post("/login", validateRequest(loginSchema), login);

// GET /auth/verify
router.get("/verify", isAuthenticated, verify);

module.exports = router;
