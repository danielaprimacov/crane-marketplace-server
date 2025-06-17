require("dotenv/config");
require("./db");
const express = require("express");

const { isAuthenticated } = require("./middleware/jwt.middleware");

const app = express();
require("./config")(app);

const homeRoute = require("./routes/index");
app.use("/", homeRoute);

const authRouter = require("./routes/auth.routes");
app.use("/auth", authRouter);

module.exports = app;
