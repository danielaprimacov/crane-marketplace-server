const AppError = require("../utils/AppError");

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.payload?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return next(
        new AppError(
          403,
          "You do not have permission to access this resource",
          "FORBIDDEN_ROLE"
        )
      );
    }

    next();
  };
}

module.exports = requireRole;
