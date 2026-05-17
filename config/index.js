const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");

const { generalLimiter } = require("../middleware/rateLimit.middleware");

function getAllowedOrigins() {
  const defaultOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://kranhub.netlify.app",
  ];

  const envOrigins = process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(",").map((origin) => origin.trim())
    : [];

  const singleFrontendUrl = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL.trim()]
    : [];

  return Array.from(
    new Set([...defaultOrigins, ...singleFrontendUrl, ...envOrigins])
  ).filter(Boolean);
}

// Middleware configuration
module.exports = (app) => {
  app.set("trust proxy", 1);

  const allowedOrigins = getAllowedOrigins();

  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: "cross-origin",
      },
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        // Allow server-to-server tools, Postman, curl, Supertest.
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(null, false);
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: false,
    })
  );

  if (process.env.NODE_ENV !== "test") {
    app.use(logger("dev"));
  }

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use(cookieParser());

  app.use(generalLimiter);
};
