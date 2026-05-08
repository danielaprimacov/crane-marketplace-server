const ROLES = require("../constants/roles");

function getIdString(value) {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  if (value._id) {
    return value._id.toString();
  }

  if (typeof value.toString === "function") {
    return value.toString();
  }

  return null;
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
  isAdmin,
  isSameUser,
  canManageOwnedResource,
  canAccessAdminArea,
};
