import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { AuthenticatedRequest, UUID } from "../types/index.js";
import { createError } from "../utils/errors.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("AuthMiddleware");

/**
 * Validates JWT token and enriches request with user data
 * Extracts token from Authorization header (Bearer scheme)
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      throw createError.unauthorized("Missing authorization header");
    }

    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw createError.unauthorized("Invalid authorization scheme");
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      id: UUID;
      email: string;
      iat: number;
      exp: number;
    };

    const authReq = req as any as AuthenticatedRequest;
    authReq.user = {
      id: decoded.id,
      email: decoded.email as any,
    };
    authReq.token = token;

    logger.debug("User authenticated", { userId: decoded.id });
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if token invalid
 * Useful for endpoints that work with or without auth
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const header = req.headers.authorization;
    if (header) {
      const [, token] = header.split(" ");
      if (token) {
        const decoded = jwt.verify(token, config.JWT_SECRET) as {
          id: UUID;
          email: string;
        };
        const authReq = req as any as AuthenticatedRequest;
        authReq.user = { id: decoded.id, email: decoded.email as any };
        authReq.token = token;
      }
    }
  } catch (error) {
    // Silently fail, don't attach user
  }
  next();
};

/**
 * Generates JWT token for user
 */
export const generateToken = (userId: UUID, email: string): string => {
  return jwt.sign({ id: userId, email }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Validates that authenticated user owns a resource
 * Relies on user-specific repository methods or ownership checks
 */
export const requireOwnership = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authReq = req as any as AuthenticatedRequest;

  if (!authReq.user) {
    throw createError.unauthorized();
  }

  // Additional ownership checks handled per resource
  // This middleware ensures user is authenticated
  next();
};
