/**
 * Real-World Example: Progressive Image Loading for a Web App
 *
 * Problem: A web server needs to generate a thumbnail for a user-uploaded image.
 * To maintain a responsive UI, the server has a very strict deadline (e.g., 50ms)
 * to return at least a preview. If it has more time, it should provide a
 * higher-quality thumbnail.
 */
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import AnytimeImageResize from '../src/time-aware/AnytimeImageResize.js';
import { logger } from '../src/logger.js';

// Helper function to create a dummy image if one doesn't exist
async function createDummyImage(filePath) {
  if (!fs.existsSync(filePath)) {
    logger.info('Creating dummy image for example...');
    await sharp({
      create: {
        width: 1200,
        height: 800,
        channels: 3,
        background: { r: 100, g: 150, b: 200 },
      },
    })
      .jpeg()
      .toFile(filePath);
  }
}

async function runExample(deadline) {
  logger.info({ deadline }, `--- Running resize with a ${deadline}ms deadline ---`);

  const imagePath = path.join(process.cwd(), 'examples', 'assets', 'sample-image.jpg');
  await createDummyImage(imagePath);
  const imageBuffer = fs.readFileSync(imagePath);

  const resizer = new AnytimeImageResize(deadline);
  const result = await resizer.resize(imageBuffer, { width: 200, height: 200 });

  if (result.buffer) {
    const outputPath = path.join(process.cwd(), 'examples', 'output', `thumbnail-deadline-${deadline}ms.jpg`);
    fs.writeFileSync(outputPath, result.buffer);
    logger.info({
      kernel: result.kernel,
      quality: `${(result.quality * 100).toFixed(2)}%`,
      timeElapsed: `${result.timeElapsed.toFixed(2)}ms`,
      metDeadline: result.metDeadline,
      outputPath,
    }, 'Resizing complete.');
  } else {
    logger.warn('Could not complete any level of resizing within the deadline.');
  }
}

// Ensure output directory exists
const outputDir = path.join(process.cwd(), 'examples', 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}
// Ensure assets directory exists
const assetsDir = path.join(process.cwd(), 'examples', 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

(async () => {
  // Scenario 1: Strict deadline (e.g., mobile user on a slow network)
  // We expect a lower-quality result (e.g., 'nearest' or 'linear' kernel).
  await runExample(10);

  // Scenario 2: Generous deadline (e.g., desktop user on a fast network)
  // We expect the highest-quality result ('lanczos3' kernel).
  await runExample(200);
})();
