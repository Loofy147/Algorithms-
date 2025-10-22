import { ComposableOperation, compose } from '../../src/algebraic-composability/ComposableOperation.js';

describe('Algebraic Composability', () => {
  const addOne = new ComposableOperation(
    'addOne',
    (x) => x + 1,
    'number',
    'number'
  );

  const numberToString = new ComposableOperation(
    'numberToString',
    (x) => x.toString(),
    'number',
    'string'
  );

  const stringToLength = new ComposableOperation(
    'stringToLength',
    (s) => s.length,
    'string',
    'number'
  );

  it('should compose two compatible operations', () => {
    const addOneAndToString = compose(addOne, numberToString);
    expect(addOneAndToString(1)).toBe('2');
  });

  it('should compose multiple compatible operations', () => {
    const pipeline = compose(addOne, numberToString, stringToLength);
    expect(pipeline(1)).toBe(1);
  });

  it('should throw an error for incompatible schemas', () => {
    expect(() => {
      compose(addOne, stringToLength);
    }).toThrow('Incompatible schemas: addOne output (number) does not match stringToLength input (string)');
  });

  it('should execute a single operation', () => {
    const pipeline = compose(addOne);
    expect(pipeline(1)).toBe(2);
  });

  it('should return the input if no operations are composed', () => {
    const pipeline = compose();
    expect(pipeline(1)).toBe(1);
  });
});
