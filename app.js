const express = require("express");

const app = express();

require("./config")(app);

const routes = require("./routes");
const notFound = require("./middleware/notFound.middleware");
const errorHandler = require("./middleware/errorHandler.middleware");

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "kranhub-api" });
});

app.use("/", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
