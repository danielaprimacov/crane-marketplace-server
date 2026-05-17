const express = require("express");

const { isAuthenticated } = require("../middleware/jwt.middleware");
const validateRequest = require("../middleware/validateRequest.middleware");
const { authLimiter } = require("../middleware/rateLimit.middleware");

const { signupSchema, loginSchema } = require("../validations/auth.validation");

const { signup, login, verify } = require("../controllers/auth.controller");

const router = express.Router();

// POST /auth/signup
router.post("/signup", authLimiter, validateRequest(signupSchema), signup);

// POST /auth/login
router.post("/login", authLimiter, validateRequest(loginSchema), login);

// GET /auth/verify
router.get("/verify", isAuthenticated, verify);

module.exports = router;
