/**
 * Represents an operation with a defined input and output schema.
 */
export class ComposableOperation {
  /**
   * @param {string} name - The name of the operation.
   * @param {(input: any) => any} operation - The function to execute.
   * @param {string} inputSchema - The expected type of the input.
   * @param {string} outputSchema - The type of the output.
   */
  constructor(name, operation, inputSchema, outputSchema) {
    this.name = name;
    this.operation = operation;
    this.inputSchema = inputSchema;
    this.outputSchema = outputSchema;
  }

  /**
   * Executes the operation with schema validation.
   * @param {any} input - The input to the operation.
   * @returns {any} The result of the operation.
   */
  execute(input) {
    if (typeof input !== this.inputSchema) {
      throw new Error(
        `Invalid input type for ${this.name}: expected ${this.inputSchema}, got ${typeof input}`
      );
    }
    const result = this.operation(input);
    if (typeof result !== this.outputSchema) {
      throw new Error(
        `Invalid output type for ${this.name}: expected ${this.outputSchema}, got ${typeof result}`
      );
    }
    return result;
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

  // Verify that the schemas are compatible
  for (let i = 0; i < operations.length - 1; i++) {
    const op1 = operations[i];
    const op2 = operations[i + 1];
    if (op1.outputSchema !== op2.inputSchema) {
      throw new Error(
        `Incompatible schemas: ${op1.name} output (${op1.outputSchema}) does not match ${op2.name} input (${op2.inputSchema})`
      );
    }
  }

  return function (input) {
    return operations.reduce((acc, op) => op.execute(acc), input);
  };
}
