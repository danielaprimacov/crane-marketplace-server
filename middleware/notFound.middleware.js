function notFound(req, res) {
  res.status(404).json({
    message: "Route not found",
    code: "ROUTE_NOT_FOUND",
    details: {
      method: req.method,
      path: req.originalUrl,
    },
  });
}

module.exports = notFound;
