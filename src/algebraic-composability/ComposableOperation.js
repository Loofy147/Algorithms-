import { z } from 'zod';

/**
 * Represents an operation with a defined input and output schema using Zod.
 */
export class ComposableOperation {
  /**
   * @param {string} name - The name of the operation.
   * @param {(input: any) => any} operation - The function to execute.
   * @param {z.ZodType<any, any>} inputSchema - The Zod schema for the input.
   * @param {z.ZodType<any, any>} outputSchema - The Zod schema for the output.
   */
  constructor(name, operation, inputSchema, outputSchema, rollback) {
    this.name = name;
    this.operation = operation;
    this.inputSchema = inputSchema;
    this.outputSchema = outputSchema;
    this.rollback = rollback;
  }

  /**
   * Executes the operation with schema validation.
   * @param {any} input - The input to the operation.
   * @returns {any} The result of the operation.
   */
  execute(input) {
    const parsedInput = this.inputSchema.parse(input);
    const result = this.operation(parsedInput);
    return this.outputSchema.parse(result);
  }
}

/**
 * Composes multiple operations into a single pipeline.
 * @param {...ComposableOperation} operations - The operations to compose.
 * @returns {(input: any) => any} A new function that executes the composed operations.
 */
export function compose(...operations) {
  if (operations.length === 0) {
    return (input) => input;
  }

  // A simple check for schema compatibility. For a more robust check,
  // one might need a way to verify if one Zod schema is a subtype of another.
  for (let i = 0; i < operations.length - 1; i++) {
    const op1 = operations[i];
    const op2 = operations[i + 1];
    if (op1.outputSchema !== op2.inputSchema) {
      console.warn(
        `Potentially incompatible schemas: ${op1.name} output and ${op2.name} input are not the same schema object.`
      );
    }
  }

  return function (input) {
    return operations.reduce((acc, op) => op.execute(acc), input);
  };
}

/**
 * Composes multiple operations into a single transactional pipeline.
 * @param {...ComposableOperation} operations - The operations to compose.
 * @returns {(input: any) => any} A new function that executes the composed operations as a transaction.
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
      return values[values.length - 1];
    } catch (error) {
      const rollbackErrors = [];
      for (let i = successfulOps.length - 1; i >= 0; i--) {
        try {
          if (successfulOps[i].rollback) {
            successfulOps[i].rollback(values[i + 1], values[i]);
          }
        } catch (rbError) {
          rollbackErrors.push({ op: successfulOps[i].name, error: rbError });
        }
      }

      if (rollbackErrors.length > 0) {
        throw new Error('Transaction failed and rollback had errors', { cause: { originalError: error, rollbackErrors } });
      }
      throw error;
    }
  };
}
