import { Request, Response, NextFunction } from "express";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("RequestLogger");

/**
 * Logs HTTP requests with timing information
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const start = Date.now();

  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: (req as any).user?.id,
    });

    return originalSend.call(this, data);
  };

  next();
};
