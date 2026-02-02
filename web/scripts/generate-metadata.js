import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Build-Time Pre-computation Script
 *
 * This script demonstrates the "Build-Time" scope from PRECOMPUTATION_LOGIC.json.
 * It generates a static JSON asset containing algorithm metadata, which is used
 * by the frontend to display stats without having to calculate them at runtime.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const metadata = {
  algorithms: [
    {
      name: 'AnytimeQuicksort',
      complexity: 'O(N log N)',
      tradeoff: 'Time vs. Inversion Count',
      precomputed: true
    },
    {
      name: 'SecureHashMap',
      complexity: 'O(1) average',
      tradeoff: 'Security (Timing) vs. Raw Speed',
      precomputed: true
    },
    {
      name: 'ResourceAwareScheduler',
      complexity: 'O(N) greedy / O(Gen * Pop) genetic',
      tradeoff: 'Schedule Quality vs. Optimizer Overhead',
      precomputed: true
    },
    {
      name: 'XFetchCache',
      complexity: 'O(1)',
      tradeoff: 'Probabilistic Consistency vs. Availability',
      precomputed: true
    }
  ],
  generatedAt: new Date().toISOString(),
  scope: 'Build-Time (SSG/AOT)'
};

const outputPath = path.resolve(__dirname, '../src/algorithm-metadata.json');

// Ensure directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));

console.log(`Pre-computed algorithm metadata saved to ${outputPath}`);
