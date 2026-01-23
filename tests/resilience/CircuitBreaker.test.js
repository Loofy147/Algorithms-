import { jest } from '@jest/globals';
import { CircuitBreaker } from '../../shared/algorithms/resilience/CircuitBreaker.js';

// Helper to wait for a specific time
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('CircuitBreaker', () => {
  let circuitBreaker;
  const failingFunction = jest.fn(() => Promise.reject(new Error('Failure')));
  const succeedingFunction = jest.fn(() => Promise.resolve('Success'));

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker({ failureThreshold: 2, resetTimeout: 100 });
    failingFunction.mockClear();
    succeedingFunction.mockClear();
  });

  it('should be in a CLOSED state initially', () => {
    expect(circuitBreaker.state).toBe('CLOSED');
  });

  it('should allow calls to pass through when CLOSED', async () => {
    await expect(circuitBreaker.execute(succeedingFunction)).resolves.toBe('Success');
    expect(succeedingFunction).toHaveBeenCalledTimes(1);
  });

  it('should trip to OPEN after the failure threshold is met', async () => {
    await expect(circuitBreaker.execute(failingFunction)).rejects.toThrow('Failure');
    await expect(circuitBreaker.execute(failingFunction)).rejects.toThrow('Failure');
    expect(circuitBreaker.state).toBe('OPEN');
  });

  it('should fail-fast (reject immediately) when OPEN', async () => {
    // Trip the circuit
    await expect(circuitBreaker.execute(failingFunction)).rejects.toThrow('Failure');
    await expect(circuitBreaker.execute(failingFunction)).rejects.toThrow('Failure');

    // Attempt to call again
    await expect(circuitBreaker.execute(succeedingFunction)).rejects.toThrow('Circuit breaker is open.');
    expect(succeedingFunction).not.toHaveBeenCalled();
  });

  it('should transition to HALF_OPEN after the reset timeout', async () => {
    // Trip the circuit
    await expect(circuitBreaker.execute(failingFunction)).rejects.toThrow('Failure');
    await expect(circuitBreaker.execute(failingFunction)).rejects.toThrow('Failure');

    // Wait for the reset timeout
    await wait(110);

    // Make a call, which should be allowed in the HALF_OPEN state
    await expect(circuitBreaker.execute(succeedingFunction)).resolves.toBe('Success');
  });

  it('should transition back to CLOSED after a successful call in the HALF_OPEN state', async () => {
    // Trip the circuit
    await expect(circuitBreaker.execute(failingFunction)).rejects.toThrow('Failure');
    await expect(circuitBreaker.execute(failingFunction)).rejects.toThrow('Failure');

    // Wait for the reset timeout
    await wait(110);

    // Make a successful call
    await expect(circuitBreaker.execute(succeedingFunction)).resolves.toBe('Success');
    expect(circuitBreaker.state).toBe('CLOSED');
  });

  it('should trip back to OPEN after a failed call in the HALF_OPEN state', async () => {
    // Trip the circuit
    await expect(circuitBreaker.execute(failingFunction)).rejects.toThrow('Failure');
    await expect(circuitBreaker.execute(failingFunction)).rejects.toThrow('Failure');

    // Wait for the reset timeout
    await wait(110);

    // Make a failing call
    await expect(circuitBreaker.execute(failingFunction)).rejects.toThrow('Failure');
    expect(circuitBreaker.state).toBe('OPEN');
  });

  it('BUG: should reset failure count after a timeout period without tripping', async () => {
    // Fail once
    await expect(circuitBreaker.execute(failingFunction)).rejects.toThrow('Failure');
    expect(circuitBreaker.failureCount).toBe(1);

    // Wait longer than the reset timeout
    await wait(110);

    // Fail again
    await expect(circuitBreaker.execute(failingFunction)).rejects.toThrow('Failure');

    // With the bug, failureCount will be 2, tripping the circuit.
    // The correct behavior is for the count to reset to 1.
    expect(circuitBreaker.failureCount).toBe(1);
    expect(circuitBreaker.state).toBe('CLOSED'); // Should not trip
  });
});
