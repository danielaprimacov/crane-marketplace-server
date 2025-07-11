const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Middleware configuration
module.exports = (app) => {
  app.set("trust proxy", 1);

  const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    // production front-end TODO
  ];

  app.use(
    cors({
      origin: ALLOWED_ORIGINS,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      // credentials: true,  // if you ever use cookies
    })
  );

  // also handle preflight for every route
  app.options("*", cors());

  // In development environment the app logs
  app.use(logger("dev"));

  // To have acces to `body` property in the request
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
};
