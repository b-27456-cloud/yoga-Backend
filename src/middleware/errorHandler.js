/**
 * Global Error Handler Middleware
 * Catches all errors and returns a consistent JSON response.
 * Must be registered LAST in the middleware chain.
 */

const logger = require('./logging');

/**
 * Custom application error class.
 * Use this to throw errors with a specific HTTP status code.
 *
 * @example throw new AppError('Pose not found', 404);
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;  // distinguishes expected errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Express error-handling middleware (4 arguments required).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Default to 500 if no status code is set
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Log the error
  if (statusCode >= 500) {
    logger.error('Unhandled server error', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  } else {
    logger.warn(`Client error ${statusCode}: ${err.message}`, {
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Build the response
  const response = {
    status: 'error',
    message: isOperational ? err.message : 'Internal server error',
    errors: [],
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose / Joi validation errors
    response.message = 'Validation failed';
    response.errors = Object.values(err.errors || {}).map((e) => e.message);
    return res.status(400).json(response);
  }

  if (err.name === 'CastError') {
    response.message = `Invalid ${err.path}: ${err.value}`;
    return res.status(400).json(response);
  }

  if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyValue || {})[0];
    response.message = `Duplicate value for field: ${field}`;
    return res.status(409).json(response);
  }

  return res.status(statusCode).json(response);
}

module.exports = { errorHandler, AppError };
