/**
 * Custom Error Types
 *
 * This module defines custom error classes for the application, allowing for
 * more specific and robust error handling.
 */

/**
 * Base class for all custom application errors.
 */
export class AppError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Thrown when a transaction fails and its rollback also fails,
 * leaving the system in an inconsistent state.
 */
export class TransactionError extends AppError {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
  }
}

/**
 * Thrown when a scheduling operation cannot be completed due to
 * resource constraints.
 */
export class InfeasibleScheduleError extends AppError {
  constructor(message, violations) {
    super(message);
    this.violations = violations;
  }
}

/**
 * Thrown when input data fails schema validation.
 */
export class ValidationError extends AppError {
  constructor(message, validationErrors) {
    super(message);
    this.validationErrors = validationErrors;
  }
}
