require("./db");
const express = require("express");note

const app = express();
require("./config")(app);

const homeRoute = require("./routes/index");
app.use("/", homeRoute);

module.exports = app;
