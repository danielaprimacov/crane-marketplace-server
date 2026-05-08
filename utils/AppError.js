class AppError extends Error {
  constructor(statusCode, message, code = "APP_ERROR", details = null) {
    super(message);

    this.statusCode = statusCode;
    this.stauts = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this.this.constructor);
  }
}

module.exports = AppError;
