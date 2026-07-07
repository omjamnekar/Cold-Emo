/* ============================================
   BUSINESS CONSTANTS
   ============================================ */

export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
};

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MAX_PROJECT_NAME_LENGTH: 255,
  MAX_NOTES_LENGTH: 5000,
  MAX_SEARCH_PROVIDERS: 5,
};

export const JOB_TIMEOUTS = {
  SEARCH: 30 * 60 * 1000, // 30 minutes
  EMAIL_GENERATION: 5 * 60 * 1000, // 5 minutes
  BULK_EMAIL: 60 * 60 * 1000, // 1 hour
  EXPORT: 15 * 60 * 1000, // 15 minutes
};

export const RATE_LIMITS = {
  SEARCH: "5 per hour",
  EMAIL_GENERATION: "50 per hour",
  LOGIN: "10 per 15 minutes",
};

export const SEARCH_STEPS = [
  "PENDING",
  "STARTING",
  "SEARCHING_SOURCES",
  "COLLECTING_PROFILES",
  "REMOVING_DUPLICATES",
  "SAVING_EMPLOYEES",
  "COMPLETED",
] as const;

export const EVENTS = {
  // Project events
  PROJECT_CREATED: "project.created",
  PROJECT_UPDATED: "project.updated",
  PROJECT_DELETED: "project.deleted",

  // Search events
  SEARCH_STARTED: "search.started",
  SEARCH_PROGRESS: "search.progress",
  SEARCH_COMPLETED: "search.completed",
  SEARCH_FAILED: "search.failed",

  // Employee events
  EMPLOYEE_ADDED: "employee.added",
  EMPLOYEE_UPDATED: "employee.updated",
  EMPLOYEE_BATCH_ADDED: "employee.batch.added",

  // Email events
  EMAIL_GENERATED: "email.generated",
  EMAIL_SENT: "email.sent",
  EMAIL_FAILED: "email.failed",

  // Job events
  JOB_STARTED: "job.started",
  JOB_PROGRESS: "job.progress",
  JOB_COMPLETED: "job.completed",
  JOB_FAILED: "job.failed",

  // Auth events
  USER_CREATED: "user.created",
  USER_LOGIN: "user.login",
} as const;

export const ERROR_CODES = {
  // Auth errors
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  UNAUTHORIZED: "UNAUTHORIZED",

  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",

  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",

  // Permission errors
  FORBIDDEN: "FORBIDDEN",
  ACCESS_DENIED: "ACCESS_DENIED",

  // Rate limiting
  RATE_LIMITED: "RATE_LIMITED",

  // Server errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
