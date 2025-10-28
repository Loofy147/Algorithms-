import { ComposableOperation, compose } from '../../src/algebraic-composability/ComposableOperation.js';
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

  it('should compose two compatible operations', () => {
    const addOneAndToString = compose(addOne, numberToString);
    expect(addOneAndToString(1)).toBe('2');
  });

  it('should compose multiple compatible operations', () => {
    const pipeline = compose(addOne, numberToString, stringToLength);
    expect(pipeline(1)).toBe(1);
  });

  it('should throw an error for invalid input to the pipeline', () => {
    const pipeline = compose(addOne, numberToString);
    expect(() => {
      pipeline('not a number');
    }).toThrow();
  });

  it('should throw an error for an operation with invalid output', () => {
    const invalidOperation = new ComposableOperation(
      'invalid',
      () => 'not a number',
      numberSchema,
      numberSchema
    );
    const pipeline = compose(addOne, invalidOperation);
    expect(() => {
      pipeline(1);
    }).toThrow();
  });

  it('should throw a runtime error when executing with incompatible schemas', () => {
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
    expect(() => {
      pipeline(1);
    }).toThrow(); // Zod will throw ZodError during parsing
  });
});
