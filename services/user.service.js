const bcrypt = require("bcryptjs");

const User = require("../models/User.model");
const AppError = require("../utils/AppError");

async function getUserProfile(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  return user;
}

async function updateUserProfile(userId, input) {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  const updates = {};

  if (input.name !== undefined) {
    updates.name = input.name;
  }

  if (input.email !== undefined) {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      throw new AppError(
        409,
        "A user with this email already exists",
        "EMAIL_ALREADY_EXISTS"
      );
    }

    updates.email = normalizedEmail;
  }

  if (input.currentPassword && input.newPassword) {
    const passwordIsValid = await bcrypt.compare(
      input.currentPassword,
      user.password
    );

    if (!passwordIsValid) {
      throw new AppError(
        400,
        "Current password is wrong",
        "CURRENT_PASSWORD_INVALID"
      );
    }

    updates.password = await bcrypt.hash(input.newPassword, 12);
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  return updatedUser;
}

async function deleteUserProfile(userId) {
  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  return deletedUser;
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
