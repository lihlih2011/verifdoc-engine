import sharp from 'sharp';
import fs from 'fs/promises';

export async function runELAAnalysis(filePath: string) {
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

    // Ensure original image is in RGB format for consistent comparison
    const originalRgbBuffer = await originalSharp.clone().toColorspace('srgb').raw().toBuffer();

    // Recompress the original RGB image to JPEG quality 90
    const recompressedBuffer = await originalSharp.clone()
      .jpeg({ quality: 90 })
      .toBuffer();
    
    // Get raw RGB buffer of the recompressed image
    const recompressedRgbBuffer = await sharp(recompressedBuffer).toColorspace('srgb').raw().toBuffer();

    // Both buffers should now be 3-channel RGB
    const numPixels = width * height;
    const pixelDataLength = numPixels * 3; // 3 channels (RGB)

    if (originalRgbBuffer.length !== pixelDataLength || recompressedRgbBuffer.length !== pixelDataLength) {
        return {
            success: false,
            data: { error: "Mismatched pixel buffer lengths after conversion to RGB." },
            heatmap: undefined,
            score: undefined,
        };
    }

    let maxDiff = 0;
    const diffValues: number[] = new Array(numPixels); // Store average diff for each pixel

    for (let i = 0; i < pixelDataLength; i += 3) {
      const r1 = originalRgbBuffer[i];
      const g1 = originalRgbBuffer[i + 1];
      const b1 = originalRgbBuffer[i + 2];

      const r2 = recompressedRgbBuffer[i];
      const g2 = recompressedRgbBuffer[i + 1];
      const b2 = recompressedRgbBuffer[i + 2];

      const diffR = Math.abs(r1 - r2);
      const diffG = Math.abs(g1 - g2);
      const diffB = Math.abs(b1 - b2);

      const avgDiff = (diffR + diffG + diffB) / 3;
      diffValues[i / 3] = avgDiff; // Store average diff for this pixel

      if (avgDiff > maxDiff) {
        maxDiff = avgDiff;
      }
    }

    // Create heatmap pixel data (RGBA)
    const heatmapBuffer = Buffer.alloc(width * height * 4);
    let pixelIndex = 0;
    let scoreSum = 0;

    for (let i = 0; i < numPixels; i++) {
      const avgDiff = diffValues[i];

      // Normalize difference to 0-255 for color mapping
      const normalizedDiff = maxDiff > 0 ? Math.min(255, Math.round((avgDiff / maxDiff) * 255)) : 0;
      scoreSum += normalizedDiff;

      // Color mapping (blue -> yellow -> red)
      let r = 0, g = 0, b = 0;
      if (normalizedDiff <= 127) { // Blue to Yellow transition
        r = Math.round(normalizedDiff * 2); // 0 -> 254
        g = Math.round(normalizedDiff * 2); // 0 -> 254
        b = 255 - Math.round(normalizedDiff * 2); // 255 -> 1
      } else { // Yellow to Red transition
        r = 255;
        g = 255 - Math.round((normalizedDiff - 127) * 2); // 255 -> 1
        b = 0;
      }

      heatmapBuffer[pixelIndex++] = r;
      heatmapBuffer[pixelIndex++] = g;
      heatmapBuffer[pixelIndex++] = b;
      heatmapBuffer[pixelIndex++] = 255; // Alpha channel
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

    // Compute suspicion score (average normalized difference over all pixels)
    const score = Math.min(100, Math.max(0, parseFloat(((scoreSum / numPixels) / 255 * 100).toFixed(2))));

    return {
      success: true,
      data: {
        width,
        height,
      },
      heatmap: heatmapBase64,
      score,
    };
  } catch (error: any) {
    // Check for specific sharp errors for unsupported formats
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
      data: { error: error.message || "An unknown error occurred during ELA analysis." },
      heatmap: undefined,
      score: undefined,
    };
  }
}