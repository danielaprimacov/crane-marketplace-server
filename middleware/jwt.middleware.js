const jwt = require("jsonwebtoken");

// Instantiate the JWT token validation middleware
const isAuthenticated = (req, res, next) => {
  try {
    console.log("→ auth header:", req.headers.authorization);
    const token = req.headers.authorization.split(" ")[1]; // get the token from headers "Bearer 123XYZ..."
    const payload = jwt.verify(token, process.env.TOKEN_SECRET); // the verify method decodes/validates the token and returns the payload
    console.log("→ extracted token:", token);
    console.log("→ secret:", process.env.TOKEN_SECRET);
    req.payload = payload; // this is to pass the decoded payload to the next route as req.payload
    next();
  } catch (error) {
    // the middleware will catch any error in the try and send 401 if:
    // 1. There is no token
    // 2. Token is invalid
    // 3. There is no headers or authorization in req (no token)
    console.error("​JWT error:", error.message);
    res.status(401).json("token not provided or not valid");
  }
};

// Export the middleware so that we can use it to create protected routes
module.exports = {
  isAuthenticated,
};
