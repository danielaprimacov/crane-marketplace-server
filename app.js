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

const adminRouter = require("./routes/admin.routes");
app.use("/admin", adminRouter);

const usersRouter = require("./routes/users.routes");
app.use("/users", usersRouter);

const craneRouter = require("./routes/crane.routes");
app.use("/", craneRouter);

const inquiryRouter = require("./routes/inquiry.routes");
app.use("/", inquiryRouter);

module.exports = app;
