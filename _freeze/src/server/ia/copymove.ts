import sharp from 'sharp';
import fs from 'fs/promises';

interface Block {
  x: number;
  y: number;
  descriptor: Float32Array;
}

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vec1: Float32Array, vec2: Float32Array): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

export async function runCopyMove(filePath: string) {
  try {
    const originalBuffer = await fs.readFile(filePath);
    const originalSharp = sharp(originalBuffer);
    const metadata = await originalSharp.metadata();

    if (!metadata.width || !metadata.height) {
      return {
        success: false,
        data: { error: "Invalid image metadata (missing width/height)." },
        heatmap: undefined,
        score: undefined,
      };
    }

    let { width, height } = metadata;

    // 1. Load image via sharp and convert to grayscale.
    // 2. Resize to max 800px width for performance.
    const resizedSharp = originalSharp.clone().grayscale();
    if (width > 800) {
      resizedSharp.resize(800);
      const resizedMetadata = await resizedSharp.metadata();
      width = resizedMetadata.width!;
      height = resizedMetadata.height!;
    }

    const grayscaleBuffer = await resizedSharp.raw().toBuffer();
    const grayscalePixels = new Uint8ClampedArray(grayscaleBuffer);

    const blockSize = 16;
    const stride = 8;
    const blocks: Block[] = [];

    // 3. Divide image into overlapping blocks
    for (let y = 0; y <= height - blockSize; y += stride) {
      for (let x = 0; x <= width - blockSize; x += stride) {
        const descriptor = new Float32Array(blockSize * blockSize);
        let idx = 0;
        for (let by = 0; by < blockSize; by++) {
          for (let bx = 0; bx < blockSize; bx++) {
            descriptor[idx++] = grayscalePixels[(y + by) * width + (x + bx)];
          }
        }
        blocks.push({ x, y, descriptor });
      }
    }

    const duplicatedBlockIndices = new Set<number>();
    const similarityThreshold = 0.95;
    const minDistance = blockSize * 3; // Blocks must be sufficiently far apart

    // 4. Compare all blocks using cosine similarity
    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        const block1 = blocks[i];
        const block2 = blocks[j];

        // Calculate distance between block centers
        const dist = Math.sqrt(
          Math.pow(block1.x - block2.x, 2) + Math.pow(block1.y - block2.y, 2)
        );

        if (dist > minDistance) { // Only compare blocks that are far apart
          const similarity = cosineSimilarity(block1.descriptor, block2.descriptor);
          if (similarity > similarityThreshold) {
            duplicatedBlockIndices.add(i);
            duplicatedBlockIndices.add(j);
          }
        }
      }
    }

    // 5. Build a similarity map (same size as image)
    const similarityMap = new Uint8ClampedArray(width * height).fill(0);
    let maxSimilarityValue = 0;

    duplicatedBlockIndices.forEach(idx => {
      const block = blocks[idx];
      for (let y = 0; y < blockSize; y++) {
        for (let x = 0; x < blockSize; x++) {
          const pixelX = block.x + x;
          const pixelY = block.y + y;
          if (pixelX < width && pixelY < height) {
            const mapIndex = pixelY * width + pixelX;
            similarityMap[mapIndex] = Math.min(255, similarityMap[mapIndex] + 50); // Increment value, cap at 255
            if (similarityMap[mapIndex] > maxSimilarityValue) {
              maxSimilarityValue = similarityMap[mapIndex];
            }
          }
        }
      }
    });

    // 6. Normalize and convert similarity map to a heatmap
    const heatmapBuffer = Buffer.alloc(width * height * 4); // RGBA
    let pixelIndex = 0;

    for (let i = 0; i < width * height; i++) {
      const value = similarityMap[i];
      const normalizedValue = maxSimilarityValue > 0 ? Math.round((value / maxSimilarityValue) * 255) : 0;

      let r = 0, g = 0, b = 0;

      // Color mapping: Blue (low) -> Yellow (medium) -> Red (strong anomaly)
      if (normalizedValue <= 127) { // Blue to Yellow transition
        r = Math.round(normalizedValue * 2); // 0 -> 254
        g = Math.round(normalizedValue * 2); // 0 -> 254
        b = 255 - Math.round(normalizedValue * 2); // 255 -> 1
      } else { // Yellow to Red transition
        r = 255;
        g = 255 - Math.round((normalizedValue - 127) * 2); // 255 -> 1
        b = 0;
      }

      heatmapBuffer[pixelIndex++] = r;
      heatmapBuffer[pixelIndex++] = g;
      heatmapBuffer[pixelIndex++] = b;
      heatmapBuffer[pixelIndex++] = 255; // Alpha
    }

    // Generate heatmap image
    const heatmapImageBuffer = await sharp(heatmapBuffer, {
      raw: {
        width: width,
        height: height,
        channels: 4,
      },
    })
      .png()
      .toBuffer();

    const heatmapBase64 = `data:image/png;base64,${heatmapImageBuffer.toString('base64')}`;

    // 7. Compute a duplication score
    const duplicatedBlocksCount = duplicatedBlockIndices.size;
    const totalBlocks = blocks.length;
    const score = totalBlocks > 0 ? parseFloat(((duplicatedBlocksCount / totalBlocks) * 100).toFixed(2)) : 0;

    return {
      success: true,
      data: {
        duplicatedBlocks: duplicatedBlocksCount,
        totalBlocks: totalBlocks,
      },
      heatmap: heatmapBase64,
      score,
    };
  } catch (error: any) {
    if (error.message && (error.message.includes("Input file contains unsupported image format") || error.message.includes("Input buffer contains unsupported image format"))) {
      return {
        success: false,
        data: { error: "Unsupported image format." },
        heatmap: undefined,
        score: undefined,
      };
    }
    return {
      success: false,
      data: { error: error.message || "An unknown error occurred during Copy-Move analysis." },
      heatmap: undefined,
      score: undefined,
    };
  }
}