require("dotenv/config");
require("./db");
const express = require("express");

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

const messagesRouter = require("./routes/message.routes");
app.use("/messages", messagesRouter);

const craneRouter = require("./routes/crane.routes");
app.use("/cranes", craneRouter);

const inquiryRouter = require("./routes/inquiry.routes");
app.use("/inquiries", inquiryRouter);

module.exports = app;
