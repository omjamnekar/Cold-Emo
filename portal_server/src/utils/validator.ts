import { createError } from "./errors.js";

/**
 * Schema-based validation
 * Extensible to support Zod, Joi, etc.
 */
export interface ValidationSchema {
  [key: string]: {
    required?: boolean;
    type?: string;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | Promise<boolean>;
  };
}

export class Validator {
  static validate(
    data: any,
    schema: ValidationSchema,
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      // Required check
      if (
        rules.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value === undefined || value === null) {
        continue;
      }

      // Type check
      if (rules.type) {
        const actualType = Array.isArray(value) ? "array" : typeof value;
        if (actualType !== rules.type) {
          errors.push(
            `${field} must be of type ${rules.type}, got ${actualType}`,
          );
          continue;
        }
      }

      // String validations
      if (typeof value === "string") {
        if (rules.min && value.length < rules.min) {
          errors.push(`${field} must be at least ${rules.min} characters`);
        }
        if (rules.max && value.length > rules.max) {
          errors.push(`${field} must be at most ${rules.max} characters`);
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
      }

      // Number validations
      if (typeof value === "number") {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${field} must be at most ${rules.max}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static throwIfInvalid(
    data: any,
    schema: ValidationSchema,
    resource = "Input",
  ): void {
    const { valid, errors } = this.validate(data, schema);
    if (!valid) {
      throw createError.validation(`${resource} validation failed`, { errors });
    }
  }
}

/**
 * Pre-built validation schemas for common DTOs
 */
export const schemas = {
  email: {
    required: true,
    type: "string",
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  password: {
    required: true,
    type: "string",
    min: 8,
  },

  projectName: {
    required: true,
    type: "string",
    min: 1,
    max: 255,
  },

  uuid: {
    required: true,
    type: "string",
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  },

  pagination: {
    limit: { type: "number", min: 1, max: 100 },
    offset: { type: "number", min: 0 },
  },
};
