import XFetchCache from '../../shared/algorithms/self-modifying/XFetchCache.js';
import { jest } from '@jest/globals';

describe('XFetchCache', () => {
  let cache;

  beforeEach(() => {
    cache = new XFetchCache(200); // 200ms TTL
  });

  it('should fetch and cache a value on miss', async () => {
    const fetcher = jest.fn().mockResolvedValue('value1');
    const result = await cache.get('key1', fetcher);

    expect(result).toBe('value1');
    expect(fetcher).toHaveBeenCalledTimes(1);

    const result2 = await cache.get('key1', fetcher);
    expect(result2).toBe('value1');
    expect(fetcher).toHaveBeenCalledTimes(1); // Cached
  });

  it('should hard-expire values after TTL', async () => {
    const fetcher = jest.fn().mockResolvedValue('value1');
    await cache.get('key1', fetcher);

    // Wait for TTL
    await new Promise(resolve => setTimeout(resolve, 300));

    const result = await cache.get('key1', fetcher);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(result).toBe('value1');
  });

  it('should probabilistically refresh values before expiration', async () => {
    // Use very high beta to increase refresh probability for testing
    cache = new XFetchCache(1000, 1000.0);

    let callCount = 0;
    const fetcher = async () => {
        callCount++;
        // Simulate computation time
        await new Promise(resolve => setTimeout(resolve, 20));
        return `value_${callCount}`;
    };

    // First fetch to populate
    await cache.get('key1', fetcher);
    const firstCount = callCount;
    expect(firstCount).toBe(1);

    // Wait a bit to get closer to expiry but still well within TTL
    await new Promise(resolve => setTimeout(resolve, 100));

    // Multiple calls to trigger the probabilistic refresh
    let refreshed = false;
    for (let i = 0; i < 50; i++) {
        await cache.get('key1', fetcher);
        if (callCount > firstCount) {
            refreshed = true;
            break;
        }
        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 5));
    }

    expect(refreshed).toBe(true);
    expect(callCount).toBeGreaterThan(firstCount);
  });

  it('should handle background fetch failures gracefully', async () => {
    cache = new XFetchCache(1000, 1000.0); // High beta to trigger refresh

    let callCount = 0;
    const fetcher = async () => {
        callCount++;
        // Add delay to ensure delta > 0 for probabilistic refresh
        await new Promise(resolve => setTimeout(resolve, 20));
        if (callCount === 2) throw new Error('Refresh failed');
        return 'success';
    };

    await cache.get('key1', fetcher);
    expect(callCount).toBe(1);

    // Should trigger refresh but not throw (as it is in background)
    const result = await cache.get('key1', fetcher);
    expect(result).toBe('success');

    // Wait for background promise to settle
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(callCount).toBe(2);
  });
});
