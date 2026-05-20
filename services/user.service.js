const bcrypt = require("bcryptjs");

const User = require("../models/User.model");
const Crane = require("../models/Crane.model");
const Inquiry = require("../models/Inquiry.model");
const Message = require("../models/Message.model");
const AppError = require("../utils/AppError");

async function getUserProfile(userId) {
  const user = await User.findById(userId);

  if (!user || user.isDeleted) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  return user;
}

async function updateUserProfile(userId, input) {
  const user = await User.findById(userId);

  if (!user || user.isDeleted) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  const updateData = {};

  if (input.name) {
    updateData.name = input.name.trim();
  }

  if (input.email) {
    updateData.email = input.email.trim().toLowerCase();
  }

  if (input.newPassword) {
    if (!input.currentPassword) {
      throw new AppError(
        400,
        "Current password is required",
        "CURRENT_PASSWORD_REQUIRED"
      );
    }

    const passwordIsValid = await bcrypt.compare(
      input.currentPassword,
      user.password
    );

    if (!passwordIsValid) {
      throw new AppError(
        401,
        "Current password is incorrect",
        "INVALID_CURRENT_PASSWORD"
      );
    }

    updateData.password = await bcrypt.hash(input.newPassword, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
}

async function exportUserData(userId) {
  const user = await User.findById(userId).select("-password -__v").lean();

  if (!user || user.isDeleted) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  const cranes = await Crane.find({ owner: userId }).select("-__v").lean();

  const inquiriesSubmittedByEmail = await Inquiry.find({
    email: user.email,
  })
    .select("-__v")
    .lean();

  const messagesSubmittedByEmail = await Message.find({
    email: user.email,
  })
    .select("-__v")
    .lean();

  return {
    exportedAt: new Date().toISOString(),
    user,
    cranes,
    inquiriesSubmittedByEmail,
    messagesSubmittedByEmail,
  };
}

async function anonymizeUserProfile(userId) {
  const user = await User.findById(userId);

  if (!user || user.isDeleted) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  const now = new Date();

  const anonymizedEmail = `deleted-user-${userId}@deleted.local`;
  const randomPasswordHash = await bcrypt.hash(
    `deleted-${userId}-${Date.now()}`,
    10
  );

  const anonymizedUser = await User.findByIdAndUpdate(
    userId,
    {
      name: "Deleted user",
      email: anonymizedEmail,
      password: randomPasswordHash,
      isDeleted: true,
      deletedAt: now,
      privacy: {
        ...user.privacy?.toObject?.(),
        marketingConsent: false,
        marketingConsentAt: null,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  await Crane.updateMany(
    { owner: userId },
    {
      $set: {
        ownerDeleted: true,
      },
    }
  );

  return anonymizedUser;
}

async function deleteUserProfile(userId) {
  return anonymizeUserProfile(userId);
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  exportUserData,
  anonymizeUserProfile,
  deleteUserProfile,
};
