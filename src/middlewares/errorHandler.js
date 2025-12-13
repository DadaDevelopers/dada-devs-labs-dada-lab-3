import config from "../config/config.js";

// 404 handler
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Centralized error handler
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  console.error(err); // log full error for debugging

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    ok: false,
    message: err.message || "Internal Server Error",
    stack: config.NODE_ENV === "production" ? null : err.stack,
  });
};
