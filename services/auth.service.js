const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User.model");
const AppError = require("../utils/AppError");

const TOKEN_SECRET = process.env.TOKEN_SECRET;

if (!TOKEN_SECRET) {
  throw new Erro("Missing TOKEN_SECRET environment variable");
}

function createJwtPayload(user) {
  return {
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
}

function signAuthToken(user) {
  const payload = createJwtPayload(user);

  return jwt.sign(payload, TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
}

async function signupUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new AppError(
      409,
      "A user with this email already exists",
      "EMAIL_ALREADY_EXISTS"
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: passwordHash,
    role: "user",
  });

  const token = signAuthToken(user);

  return { user, token };
}

async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const passwordIsValid = await bcrypt.compare(password, user.password);

  if (!passwordIsValid) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const token = signAuthToken(user);

  return { user, token };
}

async function getAuthenticatedUser(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  return user;
}

module.exports = {
  signupUser,
  loginUser,
  getAuthenticatedUser,
  createJwtPayload,
  signAuthToken,
};
