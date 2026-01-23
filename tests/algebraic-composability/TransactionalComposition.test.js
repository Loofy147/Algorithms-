import { ComposableOperation, composeWithTransaction } from '../../shared/algorithms/algebraic-composability/ComposableOperation.js';
import { z } from 'zod';

describe('Transactional Composability', () => {
  it('should roll back completed operations if a subsequent one fails', async () => {
    let a = 0;
    let b = 0;

    const op1 = new ComposableOperation(
      'op1',
      (x) => {
        a = x;
        return x;
      },
      z.number(),
      z.number(),
      () => {
        a = 0;
      }
    );

    const op2 = new ComposableOperation(
      'op2',
      (x) => {
        b = x;
        return x;
      },
      z.number(),
      z.number(),
      () => {
        b = 0;
      }
    );

    const op3 = new ComposableOperation(
      'op3',
      () => {
        throw new Error('op3 failed');
      },
      z.number(),
      z.number()
    );

    const pipeline = composeWithTransaction(op1, op2, op3);

    await expect(pipeline(1)).rejects.toThrow('op3 failed');

    expect(a).toBe(0);
    expect(b).toBe(0);
  });
});
