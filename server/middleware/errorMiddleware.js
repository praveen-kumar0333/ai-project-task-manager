const AppError = require('../utils/appError');

/**
 * Centralized Error-Handling Middleware.
 * Express recognizes error-handling middleware when it has 4 arguments: (err, req, res, next)
 */
function errorHandler(err, req, res, next) {
  // If CORS or other middleware threw a message
  const isCorsError = err?.message && err.message.includes('CORS');
  const statusCode = isCorsError ? 403 : (err.statusCode || 500);
  const isOperational = Boolean(err.isOperational) || isCorsError;

  let message = err.message || 'Internal Server Error';

  // In production, or for unexpected 500/non-operational errors, never leak internal details
  if (statusCode === 500 || !isOperational) {
    message = 'Internal Server Error. Please try again later.';
  } else if (process.env.NODE_ENV === 'production') {
    // Strip any accidental internal paths, queries, or technical signatures
    if (/(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|\/|\\|node_modules|password|secret|key)/i.test(message)) {
      message = 'An error occurred while processing your request.';
    }
  }

  // Log unexpected internal errors on the server console only (never sent to client)
  if (statusCode === 500 && !isOperational) {
    console.error('[SERVER_ERROR]', err?.name || 'Error', err?.message || err);
  }

  res.status(statusCode).json({
    success: false,
    message
  });
}

/**
 * Catch-all handler for undefined routes (404 Not Found)
 */
function notFoundHandler(req, res, next) {
  next(new AppError(`Resource not found: ${req.method} ${req.originalUrl}`, 404));
}

module.exports = {
  errorHandler,
  notFoundHandler
};
