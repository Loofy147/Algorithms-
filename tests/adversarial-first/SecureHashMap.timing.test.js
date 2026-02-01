import SecureHashMap from '../../shared/algorithms/adversarial-first/SecureHashMap.js';
import { performance } from 'perf_hooks';
import { tTestTwoSample, mean } from 'simple-statistics';

// This test is designed to detect timing side-channels. It operates by
// measuring the execution time of operations (get, set, delete) for two
// distinct cases: when a key is present in the map ("hit") and when it is
// not ("miss").
//
// A secure, constant-time implementation should show no statistically
// significant difference in the time it takes to handle a hit versus a miss.
//
// We use a two-sample t-test to compare the means of the two timing
// distributions (hits vs. misses). The null hypothesis is that the true
// means are equal. If the calculated p-value is high (e.g., > 0.05), we
// cannot reject the null hypothesis, which provides confidence that the
// implementation is constant-time. A low p-value would indicate a
// significant timing leak.

describe('SecureHashMap Timing Side-Channel Analysis', () => {
  const SAMPLES = 2000; // Number of measurements to take for each case
  const SIGNIFICANCE_LEVEL = 0.05; // Standard p-value threshold

  // Helper to precisely measure the execution time of a function
  const measureExecutionTime = (operation) => {
    const start = performance.now();
    operation();
    return performance.now() - start;
  };

  /**
   * A generic test runner for timing analysis.
   * @param {string} operationName - The name of the operation being tested (e.g., 'get', 'set').
   * @param {function} getOperations - A function that is called for each sample to get a fresh state
   *   and return an object with two properties: `hitOperation` and `missOperation`.
   */
  const runTimingTest = (operationName, getOperations) => {
    it(`should have no significant timing difference for ${operationName} operations`, () => {
      // Warm-up phase to allow the JIT compiler to stabilize.
      for (let i = 0; i < SAMPLES / 10; i++) {
        const { hitOperation, missOperation } = getOperations();
        hitOperation();
        missOperation();
      }

      // Measurement phase
      const hitTimings = [];
      const missTimings = [];
      for (let i = 0; i < SAMPLES; i++) {
        const { hitOperation } = getOperations();
        hitTimings.push(measureExecutionTime(hitOperation));

        const { missOperation } = getOperations();
        missTimings.push(measureExecutionTime(missOperation));
      }

      // Basic statistical analysis for logging and debugging
      mean(hitTimings);
      // Perform a two-sample t-test. The result is the p-value.
      const pValue = tTestTwoSample(hitTimings, missTimings);

      // A high p-value means we cannot reject the null hypothesis that the means are equal.
      // This is our success condition, indicating no detectable timing leak.
      expect(pValue).toBeGreaterThan(SIGNIFICANCE_LEVEL);
    });
  };

  // Test suite for the 'get' method.
  // The setup can be done once as 'get' does not mutate the map's state.
  runTimingTest('get', () => {
    const map = new SecureHashMap();
    const existingKey = 'existing-key-for-get';
    const missingKey = 'missing-key-for-get';
    map.set(existingKey, 'some value');
    return {
      hitOperation: () => map.get(existingKey),
      missOperation: () => map.get(missingKey),
    };
  });

  // Test suite for the 'set' method (update vs. insert).
  runTimingTest('set (update vs. insert)', () => {
    const existingKey = 'key-to-update';
    const newKey = 'key-to-insert';

    // For a "hit" (update), we create a map and add the key. The timed operation is a second `set`.
    const mapForHit = new SecureHashMap();
    mapForHit.set(existingKey, 'initial value');

    // For a "miss" (insert), we use an empty map.
    const mapForMiss = new SecureHashMap();

    return {
      hitOperation: () => mapForHit.set(existingKey, 'new value'),
      missOperation: () => mapForMiss.set(newKey, 'some value'),
    };
  });

  // Test suite for the 'delete' method.
  // This setup function is called for each of the 2000 samples to ensure a fresh state,
  // which is critical because 'delete' is a stateful, mutating operation.
  runTimingTest('delete', () => {
    const existingKey = 'key-to-delete';
    const missingKey = 'key-that-is-missing';

    // A fresh map is created with the key already in it.
    const map = new SecureHashMap();
    map.set(existingKey, 'value');

    return {
      // The "hit" operation is deleting the key that we know exists.
      hitOperation: () => map.delete(existingKey),
      // The "miss" operation is attempting to delete a key that does not exist.
      missOperation: () => map.delete(missingKey),
    };
  });
});
