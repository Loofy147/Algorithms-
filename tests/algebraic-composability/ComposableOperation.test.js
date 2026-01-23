import { ComposableOperation, compose } from '../../shared/algorithms/algebraic-composability/ComposableOperation.js';
import { z } from 'zod';

describe('Algebraic Composability with Zod', () => {
  const numberSchema = z.number();
  const stringSchema = z.string();

  const addOne = new ComposableOperation(
    'addOne',
    (x) => x + 1,
    numberSchema,
    numberSchema
  );

  const numberToString = new ComposableOperation(
    'numberToString',
    (x) => x.toString(),
    numberSchema,
    stringSchema
  );

  const stringToLength = new ComposableOperation(
    'stringToLength',
    (s) => s.length,
    stringSchema,
    numberSchema
  );

  it('should compose two compatible operations', async () => {
    const addOneAndToString = compose(addOne, numberToString);
    await expect(addOneAndToString(1)).resolves.toBe('2');
  });

  it('should compose multiple compatible operations', async () => {
    const pipeline = compose(addOne, numberToString, stringToLength);
    await expect(pipeline(1)).resolves.toBe(1);
  });

  it('should throw an error for invalid input to the pipeline', async () => {
    const pipeline = compose(addOne, numberToString);
    await expect(pipeline('not a number')).rejects.toThrow();
  });

  it('should throw an error for an operation with invalid output', async () => {
    const invalidOperation = new ComposableOperation(
      'invalid',
      () => 'not a number',
      numberSchema,
      numberSchema
    );
    const pipeline = compose(addOne, invalidOperation);
    await expect(pipeline(1)).rejects.toThrow();
  });

  it('should throw a runtime error when executing with incompatible schemas', async () => {
    const stringOp = new ComposableOperation(
      'stringOp',
      (s) => s.length,
      stringSchema,
      numberSchema
    );
    const numberOp = new ComposableOperation(
      'numberOp',
      (n) => n + 1,
      numberSchema,
      numberSchema
    );

    // The output of numberOp (number) is incompatible with the input of stringOp (string).
    const pipeline = compose(numberOp, stringOp);

    // The error should be thrown at runtime when the data is passed.
    await expect(pipeline(1)).rejects.toThrow(); // Zod will throw ZodError during parsing
  });
});
