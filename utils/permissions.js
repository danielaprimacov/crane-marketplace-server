const ROLES = require("../constants/roles");

function getIdString(value) {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  // MongoDB ObjectId
  if (typeof value.toHexString === "function") {
    return value.toHexString();
  }

  // Populated Mongoose document or plain object with _id
  if (value._id && value._id !== value) {
    return getIdString(value._id);
  }

  // Some objects may expose id
  if (value.id && value.id !== value) {
    return getIdString(value.id);
  }

  if (typeof value.toString === "function") {
    const stringValue = value.toString();

    if (stringValue && stringValue !== "[object Object]") {
      return stringValue;
    }
  }

  return null;
}

function getUserId(user) {
  if (!user) return null;

  return (
    getIdString(user._id) || getIdString(user.id) || getIdString(user.userId)
  );
}

function getOwnerId(owner) {
  if (!owner) return null;

  return getIdString(owner);
}

function isAdmin(user) {
  return user?.role === ROLES.ADMIN;
}

function isSameUser(user, targetUserId) {
  const userId = getIdString(user?._id);
  const targetId = getIdString(targetUserId);

  return Boolean(userId && targetId && userId === targetId);
}

function canManageOwnedResource(user, ownerId) {
  return isAdmin(user) || isSameUser(user, ownerId);
}

function canAccessAdminArea(user) {
  return isAdmin(user);
}

module.exports = {
  getIdString,
  getUserId,
  getOwnerId,
  isAdmin,
  isSameUser,
  canManageOwnedResource,
  canAccessAdminArea,
};
