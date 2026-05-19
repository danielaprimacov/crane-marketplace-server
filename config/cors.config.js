const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

function corsOptions(req, callback) {
  const origin = req.header("Origin");

  // Allow server-to-server tools, Postman, Supertest, curl.
  if (!origin) {
    return callback(null, {
      origin: true,
      credentials: true,
    });
  }

  if (allowedOrigins.includes(origin)) {
    return callback(null, {
      origin: true,
      credentials: true,
    });
  }

  return callback(null, {
    origin: false,
  });
}

module.exports = corsOptions;
