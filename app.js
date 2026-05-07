const express = require("express");

const app = express();

require("./config")(app);

const routes = require("./routes");

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "kranhub-api" });
});

app.use("/", routes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);

  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

module.exports = app;
