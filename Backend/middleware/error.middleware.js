import { ApiError } from "../utils/ApiError.js";

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Mongoose: bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `A record with this ${field} already exists.`;
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((err) => err.message)
      .join(", ");
  }

  if (process.env.NODE_ENV !== "production" && statusCode === 500) {
    console.log("ERROR: ", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && statusCode === 500
      ? { stack: err.stack }
      : {}),
  });
};
