import sharp from 'sharp';
import fs from 'fs/promises';

export async function runNoisePrint(filePath: string) {
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

    const { width, height } = metadata;

    // 1. Load image and convert to grayscale
    const grayscaleBuffer = await originalSharp.clone().grayscale().raw().toBuffer();
    const grayscalePixels = new Uint8ClampedArray(grayscaleBuffer);

    // 2. Apply a high-pass filter (HPF) kernel
    const kernel = [
      [-1, -1, -1],
      [-1, 8, -1],
      [-1, -1, -1],
    ];
    const kernelSize = 3;
    const noiseResidualMap = new Float32Array(width * height);

    let minNoise = Infinity;
    let maxNoise = -Infinity;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const pixelX = x + kx - 1;
            const pixelY = y + ky - 1;
            sum += grayscalePixels[pixelY * width + pixelX] * kernel[ky][kx];
          }
        }
        noiseResidualMap[y * width + x] = sum;
        if (sum < minNoise) minNoise = sum;
        if (sum > maxNoise) maxNoise = sum;
      }
    }

    // 3. Normalize noise between 0 and 255
    const normalizedNoiseMap = new Uint8ClampedArray(width * height);
    let totalNormalizedNoise = 0;
    const noiseRange = maxNoise - minNoise;

    for (let i = 0; i < width * height; i++) {
      const normalizedValue = noiseRange > 0
        ? Math.round(((noiseResidualMap[i] - minNoise) / noiseRange) * 255)
        : 127; // Default to mid-gray if no variation
      normalizedNoiseMap[i] = normalizedValue;
      totalNormalizedNoise += normalizedValue;
    }

    // 4. Perform block-wise energy analysis and compute suspicion score
    const blockSize = 32;
    let blockCount = 0;
    let totalBlockVariance = 0;

    for (let by = 0; by < height; by += blockSize) {
      for (let bx = 0; bx < width; bx += blockSize) {
        blockCount++;
        let blockSum = 0;
        let blockPixelCount = 0;
        const blockValues: number[] = [];

        for (let y = by; y < Math.min(by + blockSize, height); y++) {
          for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
            blockSum += normalizedNoiseMap[y * width + x];
            blockValues.push(normalizedNoiseMap[y * width + x]);
            blockPixelCount++;
          }
        }

        if (blockPixelCount > 0) {
          const blockMean = blockSum / blockPixelCount;
          let variance = 0;
          for (const val of blockValues) {
            variance += Math.pow(val - blockMean, 2);
          }
          totalBlockVariance += variance / blockPixelCount;
        }
      }
    }

    const meanBlockVariance = blockCount > 0 ? totalBlockVariance / blockCount : 0;
    // Normalize meanBlockVariance to a 0-100 score. Max possible variance for 0-255 range is (255-0)^2 / 4 = 16256.25
    const maxPossibleVariance = Math.pow(255, 2) / 4; // Variance of a uniform distribution from 0 to 255
    const score = Math.min(100, Math.max(0, parseFloat(((meanBlockVariance / maxPossibleVariance) * 100).toFixed(2))));

    // 5. Generate a heatmap image
    const heatmapBuffer = Buffer.alloc(width * height * 4); // RGBA
    for (let i = 0; i < width * height; i++) {
      const value = normalizedNoiseMap[i];
      let r = 0, g = 0, b = 0;

      // Color mapping: Blue (low) -> Yellow (medium) -> Red (strong anomaly)
      if (value <= 127) { // Blue to Yellow transition
        r = Math.round(value * 2); // 0 -> 254
        g = Math.round(value * 2); // 0 -> 254
        b = 255 - Math.round(value * 2); // 255 -> 1
      } else { // Yellow to Red transition
        r = 255;
        g = 255 - Math.round((value - 127) * 2); // 255 -> 1
        b = 0;
      }

      heatmapBuffer[i * 4 + 0] = r;
      heatmapBuffer[i * 4 + 1] = g;
      heatmapBuffer[i * 4 + 2] = b;
      heatmapBuffer[i * 4 + 3] = 255; // Alpha
    }

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

    return {
      success: true,
      data: {
        width,
        height,
        blockCount,
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
      data: { error: error.message || "An unknown error occurred during NoisePrint analysis." },
      heatmap: undefined,
      score: undefined,
    };
  }
}