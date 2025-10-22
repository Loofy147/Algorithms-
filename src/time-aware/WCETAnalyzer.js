/**
 * WCET Analyzer - Probabilistic timing bounds
 *
 * Uses Extreme Value Theory to predict worst-case timing
 */
class WCETAnalyzer {
  constructor() {
    this.samples = [];
  }

  measure(fn, iterations = 1000) {
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      fn();
      times.push(performance.now() - start);
    }

    times.sort((a, b) => a - b);
    this.samples = times;

    // Statistical bounds
    const mean = times.reduce((a, b) => a + b) / times.length;
    const variance = times.reduce((sum, t) => sum + (t - mean) ** 2, 0) / times.length;
    const stddev = Math.sqrt(variance);

    return {
      mean: mean,
      stddev: stddev,
      min: times[0],
      max: times[times.length - 1],
      p50: times[Math.floor(times.length * 0.50)],
      p95: times[Math.floor(times.length * 0.95)],
      p99: times[Math.floor(times.length * 0.99)],
      p99_9: times[Math.floor(times.length * 0.999)],
      wcet_estimate: times[Math.floor(times.length * 0.999)] * 1.2, // 20% safety margin
      samples: times.length
    };
  }

  // Gumbel distribution fit for extreme values
  fitGumbel(times) {
    const n = times.length;
    const mean = times.reduce((a, b) => a + b) / n;
    const variance = times.reduce((sum, t) => sum + (t - mean) ** 2, 0) / n;

    // Gumbel parameters
    const beta = Math.sqrt(6 * variance) / Math.PI;
    const mu = mean - 0.5772 * beta; // Euler-Mascheroni constant

    return {
      location: mu,
      scale: beta,
      predictWCET: (probability) => mu - beta * Math.log(-Math.log(probability))
    };
  }
}

module.exports = WCETAnalyzer;
