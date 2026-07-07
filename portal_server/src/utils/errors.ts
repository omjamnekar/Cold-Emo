import { Response } from "express";
import { AppError, ErrorResponse } from "../types/index.js";
import { ERROR_CODES, HTTP_STATUS } from "../constants/index.js";
import { isDev } from "../config/index.js";

/**
 * Global error handling utility
 * Converts any error to standardized response
 */
export class ErrorHandler {
  static async handle(error: any, req: any, res: Response): Promise<void> {
    const appError = this.normalize(error);
    const statusCode = appError.statusCode;

    const response: ErrorResponse = {
      error: appError.code,
      code: appError.statusCode.toString(),
      message: appError.message,
      timestamp: new Date().toISOString(),
      path: req.originalUrl || req.baseUrl || "/",
      ...(isDev && { details: appError.details }),
      ...(isDev && { stack: appError.stack }),
    };

    res.status(statusCode).json(response);

    // Log error for monitoring
    if (statusCode >= 500) {
      console.error("[ERROR]", {
        path: req.originalUrl || "/",
        method: req.method,
        error: appError,
      });
    }
  }

  private static normalize(error: any): AppError {
    // Already an AppError
    if (error instanceof AppError) {
      return error;
    }

    // Express validation error
    if (error.statusCode && error.message) {
      return new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        error.statusCode,
        error.message,
        error.details,
      );
    }

    // Database error
    if (error.code === "P2025") {
      return new AppError(
        ERROR_CODES.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
        "Resource not found",
      );
    }

    if (error.code === "P2002") {
      return new AppError(
        ERROR_CODES.ALREADY_EXISTS,
        HTTP_STATUS.CONFLICT,
        `Resource already exists: ${error.meta?.target}`,
      );
    }

    // JWT error
    if (error.name === "JsonWebTokenError") {
      return new AppError(
        ERROR_CODES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid token",
      );
    }

    if (error.name === "TokenExpiredError") {
      return new AppError(
        ERROR_CODES.TOKEN_EXPIRED,
        HTTP_STATUS.UNAUTHORIZED,
        "Token expired",
      );
    }

    // Generic error
    return new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_ERROR,
      isDev ? error.message : "Internal server error",
      isDev ? { originalError: error.toString() } : undefined,
    );
  }
}

/**
 * Helper to throw typed errors in controllers
 */
export const createError = {
  unauthorized: (message = "Unauthorized") =>
    new AppError(ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED, message),

  forbidden: (message = "Forbidden") =>
    new AppError(ERROR_CODES.FORBIDDEN, HTTP_STATUS.FORBIDDEN, message),

  notFound: (resource = "Resource") =>
    new AppError(
      ERROR_CODES.NOT_FOUND,
      HTTP_STATUS.NOT_FOUND,
      `${resource} not found`,
    ),

  conflict: (message = "Conflict") =>
    new AppError(ERROR_CODES.CONFLICT, HTTP_STATUS.CONFLICT, message),

  validation: (message: string, details?: Record<string, any>) =>
    new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      HTTP_STATUS.BAD_REQUEST,
      message,
      details,
    ),

  rateLimited: (retryAfter?: number) =>
    new AppError(
      ERROR_CODES.RATE_LIMITED,
      HTTP_STATUS.RATE_LIMITED,
      "Too many requests. Please try again later.",
      retryAfter ? { retryAfter } : undefined,
    ),

  internal: (
    message = "Internal server error",
    details?: Record<string, any>,
  ) =>
    new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_ERROR,
      message,
      details,
    ),
};
