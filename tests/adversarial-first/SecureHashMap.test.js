const SecureHashMap = require('../../src/adversarial-first/SecureHashMap');

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
});
