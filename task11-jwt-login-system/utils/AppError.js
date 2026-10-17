// An error that carries an HTTP status code. The errorHandler (Step 6) reads it.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;