import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "../utils/errors.js";

/**
 * Catches errors from async route handlers
 * Prevents "unhandled promise rejection" errors
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * Global error handler middleware
 * Must be registered last in middleware chain
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  ErrorHandler.handle(err, req, res);
};

/**
 * 404 handler
 * Must be registered after all routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: "NOT_FOUND",
    code: "404",
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};
