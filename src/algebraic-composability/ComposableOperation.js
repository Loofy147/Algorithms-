import { z } from 'zod';
import { logger } from '../logger.js';
import { TransactionError, ValidationError } from '../errors.js';

/**
 * Represents a composable operation with schema validation and rollback logic.
 */
export class ComposableOperation {
  constructor(name, operation, inputSchema, outputSchema, rollback) {
    this.name = name;
    this.operation = operation;
    this.inputSchema = inputSchema;
    this.outputSchema = outputSchema;
    this.rollback = rollback;
  }

  execute(input) {
    try {
      const parsedInput = this.inputSchema.parse(input);
      const result = this.operation(parsedInput);
      return this.outputSchema.parse(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(`Schema validation failed for operation "${this.name}"`, error.errors);
      }
      throw error;
    }
  }
}

/**
 * Composes multiple operations into a single pipeline.
 */
export function compose(...operations) {
  for (let i = 0; i < operations.length - 1; i++) {
    const op1 = operations[i];
    const op2 = operations[i + 1];
    if (op1.outputSchema !== op2.inputSchema) {
      logger.warn(
        { op1: op1.name, op2: op2.name },
        'Potentially incompatible schemas detected in composition'
      );
    }
  }

  return function (input) {
    return operations.reduce((acc, op) => op.execute(acc), input);
  };
}

/**
 * Composes operations into a transactional saga.
 */
export function composeWithTransaction(...operations) {
  return function (input) {
    const successfulOps = [];
    const values = [input];

    try {
      for (const op of operations) {
        const result = op.execute(values[values.length - 1]);
        values.push(result);
        successfulOps.push(op);
      }
      logger.debug('Transaction completed successfully');
      return values[values.length - 1];
    } catch (error) {
      const failedOpName = operations[successfulOps.length]?.name || 'unknown';
      logger.error({ err: error.message, failedOp: failedOpName }, 'Transaction failed, starting rollback');

      const rollbackErrors = [];
      for (let i = successfulOps.length - 1; i >= 0; i--) {
        const op = successfulOps[i];
        try {
          if (op.rollback) {
            logger.info(`Rolling back operation: ${op.name}`);
            op.rollback(values[i + 1], values[i]);
          }
        } catch (rbError) {
          logger.fatal({ err: rbError.message, op: op.name }, 'Rollback failed, system may be in an inconsistent state');
          rollbackErrors.push({ op: op.name, error: rbError.message });
        }
      }

      if (rollbackErrors.length > 0) {
        throw new TransactionError('Transaction failed and one or more rollbacks also failed', {
          originalError: error,
          rollbackErrors
        });
      }
      throw error;
    }
  };
}
