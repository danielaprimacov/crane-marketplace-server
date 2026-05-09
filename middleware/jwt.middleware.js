const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const TOKEN_SECRET = process.env.TOKEN_SECRET;

// Instantiate the JWT token validation middleware
const isAuthenticated = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        401,
        "Missing or invalid authorization header",
        "AUTH_HEADER_MISSING"
      );
    }

    const token = authHeader.split(" ")[1]; // get the token from headers "Bearer 123XYZ..."
    const payload = jwt.verify(token, TOKEN_SECRET); // the verify method decodes/validates the token and returns the payload

    req.payload = {
      _id: payload._id || payload.id || payload.userId,
      email: payload.email,
      role: payload.role,
    };

    if (!req.payload._id) {
      throw new AppError(
        401,
        "Invalid authentication token payload",
        "INVALID_AUTH_PAYLOAD"
      );
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError(401, "Token expired", "TOKEN_EXPIRED"));
    }

    if (error.name === "JsonWebTokenError") {
      return next(new AppError(401, "Invalid token", "INVALID_TOKEN"));
    }

    next(error);
  }
};

// Export the middleware so that we can use it to create protected routes
module.exports = {
  isAuthenticated,
};
