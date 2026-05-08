function errorHandler(error, req, res, next) {
  console.error("Global error handler: ", error);

  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || error.status || 500;

  res.status(statusCode).json({
    message: error.message || "Internal server error",
    code: error.code || "INTERNAL_SERVER_ERROR",
    details: error.details || null,
  });
}

module.exports = errorHandler;
