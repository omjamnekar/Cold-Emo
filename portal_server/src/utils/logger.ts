import { config, isDev } from "../config/index.js";
import { ILogger } from "../types/index.js";

type LogLevel = "info" | "error" | "warn" | "debug";

/**
 * Structured logging service
 * Supports console and file logging
 */
export class Logger implements ILogger {
  private name: string;
  private level: LogLevel;

  constructor(name: string) {
    this.name = name;
    this.level = (config.LOG_LEVEL as LogLevel) || "info";
  }

  info(message: string, meta?: Record<string, any>): void {
    this.log("info", message, meta);
  }

  error(message: string, error?: Error, meta?: Record<string, any>): void {
    this.log("error", message, {
      ...meta,
      error: error?.message,
      stack: isDev ? error?.stack : undefined,
    });
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.log("warn", message, meta);
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (isDev) {
      this.log("debug", message, meta);
    }
  }

  private log(
    level: LogLevel,
    message: string,
    meta?: Record<string, any>,
  ): void {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      level: level.toUpperCase(),
      service: this.name,
      message,
      ...meta,
    };

    const formatted =
      config.LOG_FORMAT === "json"
        ? JSON.stringify(entry)
        : `[${entry.timestamp}] [${entry.level}] [${entry.service}] ${message}`;

    if (level === "error") {
      console.error(formatted);
    } else if (level === "warn") {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }
}

export const createLogger = (name: string): Logger => new Logger(name);
