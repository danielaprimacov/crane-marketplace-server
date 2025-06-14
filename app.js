require("./db");
const express = require("express");

const app = express();
require("./config")(app);

const homeRoute = require("./routes/index");
app.use("/", homeRoute);

module.exports = app;
