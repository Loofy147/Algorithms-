import SecureHashMap from '../../src/adversarial-first/SecureHashMap.js';

describe('SecureHashMap', () => {
  it('should set and get values correctly', () => {
    const map = new SecureHashMap();
    map.set('key1', 'value1');
    map.set('key2', 'value2');
    expect(map.get('key1')).toBe('value1');
    expect(map.get('key2')).toBe('value2');
  });

  it('should resist collision attacks by rehashing', () => {
    const map = new SecureHashMap();
    // Force collisions by overriding the hash function
    map.hash = () => 0;
    for (let i = 0; i < 12; i++) {
      map.set(`key${i}`, `value${i}`);
    }
    expect(map.rehashCount).toBeGreaterThan(0);
  });

  it('should delete values correctly', () => {
    const map = new SecureHashMap();
    map.set('key1', 'value1');
    expect(map.delete('key1')).toBe(true);
    expect(map.get('key1')).toBeUndefined();
    expect(map.delete('key1')).toBe(false);
  });

  it('should not leak timing information in delete operation', () => {
    const map = new SecureHashMap();
    // Force all keys to hash to the same bucket
    map.hash = () => 0;

    const keyCount = 10;
    for (let i = 0; i < keyCount; i++) {
      map.set(`key${i}`, `value${i}`);
    }

    // Measure time to delete the first element
    const startTimeFirst = performance.now();
    map.delete('key0');
    const timeFirst = performance.now() - startTimeFirst;

    // Measure time to delete the last element
    // Re-add the first element to keep bucket size consistent for a fair comparison
    map.set('key0', 'value0');
    const startTimeLast = performance.now();
    map.delete(`key${keyCount - 1}`);
    const timeLast = performance.now() - startTimeLast;

    // In a constant-time implementation, the times should be very close.
    // We allow a small tolerance for system jitter.
    const tolerance = timeLast * 0.5; // Generous tolerance
    expect(timeFirst).toBeLessThan(timeLast + tolerance);
  });
});
