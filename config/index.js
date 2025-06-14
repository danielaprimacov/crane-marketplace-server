const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Middleware configuration
module.exports = (app) => {
  app.set("trust proxy", 1);

  app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));

  // In development environment the app logs
  app.use(logger("dev"));

  // To have acces to `body` property in the request
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
};
