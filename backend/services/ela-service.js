/**
 * Error Level Analysis (ELA) Service
 * Detects image modifications by analyzing compression error levels
 * 
 * ELA works by:
 * 1. Recompressing the image at a controlled quality level
 * 2. Computing pixel-level differences between original and recompressed
 * 3. Identifying regions with abnormal error levels (indicating modifications)
 */

const fs = require('fs');
const path = require('path');

// Try to use jimp if available, otherwise fallback to basic implementation
let Jimp = null;
try {
  Jimp = require('jimp');
} catch (e) {
  console.warn('⚠️  Jimp not available. ELA will use basic implementation.');
}

class ELAService {
  constructor(qualityLevel = 95) {
    /**
     * Quality level for recompression (default: 95)
     * Lower quality = more compression artifacts = better detection
     */
    this.qualityLevel = qualityLevel;
    this.hasJimp = Jimp !== null;
  }

  /**
   * Analyze an image file using ELA
   * @param {string} filePath - Path to the image file
   * @param {string} mimeType - MIME type of the file
   * @returns {Promise<Object>} ELA analysis results
   */
  async analyzeImage(filePath, mimeType = 'image/jpeg') {
    // Only process image files (skip PDFs for now, they need conversion first)
    if (!mimeType.startsWith('image/')) {
      return {
        success: false,
        elaAnomalies: [],
        elaScore: 0,
        message: 'ELA analysis only supports image files'
      };
    }

    try {
      if (this.hasJimp) {
        return await this._analyzeWithJimp(filePath, mimeType);
      } else {
        return await this._analyzeBasic(filePath, mimeType);
      }
    } catch (error) {
      console.error('❌ Error in ELA analysis:', error);
      return {
        success: false,
        elaAnomalies: [],
        elaScore: 0,
        error: error.message
      };
    }
  }

  /**
   * Analyze using Jimp library (full implementation)
   */
  async _analyzeWithJimp(filePath, mimeType) {
    // Read and load image
    const image = await Jimp.read(filePath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Clone image for recompression
    const recompressed = image.clone();

    // Recompress at controlled quality level
    // Save to buffer, then reload to get compression artifacts
    const buffer = await recompressed.quality(this.qualityLevel).getBufferAsync(Jimp.MIME_JPEG);
    const recompressedImage = await Jimp.read(buffer);

    // Ensure same dimensions
    if (recompressedImage.bitmap.width !== width || recompressedImage.bitmap.height !== height) {
      recompressedImage.resize(width, height);
    }

    // Compute pixel-level differences
    const diffMap = [];
    const errorLevels = [];
    let maxError = 0;
    let totalError = 0;

    // Process each pixel
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        // Get pixel colors
        const origColor = Jimp.intToRGBA(image.getPixelColor(x, y));
        const recompColor = Jimp.intToRGBA(recompressedImage.getPixelColor(x, y));

        // Compute error level (Euclidean distance in RGB space)
        const error = Math.sqrt(
          Math.pow(origColor.r - recompColor.r, 2) +
          Math.pow(origColor.g - recompColor.g, 2) +
          Math.pow(origColor.b - recompColor.b, 2)
        );

        row.push(error);
        errorLevels.push(error);
        totalError += error;
        maxError = Math.max(maxError, error);
      }
      diffMap.push(row);
    }

    // Calculate statistics
    const avgError = totalError / (width * height);
    const threshold = avgError * 2.5; // Threshold for suspicious regions

    // Detect anomalies
    const anomalies = this._detectAnomalies(diffMap, threshold, width, height);

    // Calculate ELA score (0-100, higher = more suspicious)
    const elaScore = Math.min(100, Math.round((maxError / 255) * 100));

    return {
      success: true,
      elaAnomalies: anomalies,
      elaScore: elaScore,
      statistics: {
        maxError: Math.round(maxError),
        avgError: Math.round(avgError),
        threshold: Math.round(threshold)
      },
      diffMap: diffMap // Can be used for visualization
    };
  }

  /**
   * Basic ELA implementation without Jimp (fallback)
   * Uses file size comparison as a simple heuristic
   */
  async _analyzeBasic(filePath, mimeType) {
    // Basic implementation: analyze file characteristics
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Simple heuristic: very small files might be suspicious
    // This is a placeholder - full ELA requires image processing
    const anomalies = [];
    let elaScore = 0;

    if (fileSize < 10000) {
      anomalies.push({
        type: 'unknown',
        description: 'File size unusually small',
        confidence: 30,
        region: 'entire document'
      });
      elaScore = 20;
    }

    return {
      success: true,
      elaAnomalies: anomalies,
      elaScore: elaScore,
      message: 'Basic ELA analysis (install jimp for full analysis)',
      statistics: {
        fileSize: fileSize
      }
    };
  }

  /**
   * Detect anomalies in error level map
   * Identifies COPY, MOVE, ADD operations based on error patterns
   */
  _detectAnomalies(diffMap, threshold, width, height) {
    const anomalies = [];
    const visited = Array(height).fill(null).map(() => Array(width).fill(false));
    const blockSize = Math.max(8, Math.floor(Math.min(width, height) / 50)); // Adaptive block size

    // Find suspicious regions
    for (let y = 0; y < height - blockSize; y += blockSize) {
      for (let x = 0; x < width - blockSize; x += blockSize) {
        if (visited[y][x]) continue;

        // Calculate average error in this block
        let blockError = 0;
        let pixelCount = 0;

        for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
          for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
            blockError += diffMap[y + dy][x + dx];
            pixelCount++;
          }
        }

        const avgBlockError = blockError / pixelCount;

        // If block exceeds threshold, mark as suspicious
        if (avgBlockError > threshold) {
          // Mark block as visited
          for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
            for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
              visited[y + dy][x + dx] = true;
            }
          }

          // Determine anomaly type based on error pattern
          const anomalyType = this._classifyAnomaly(diffMap, x, y, blockSize, width, height, threshold);

          anomalies.push({
            type: anomalyType.type,
            description: anomalyType.description,
            confidence: Math.min(100, Math.round((avgBlockError / threshold) * 50)),
            region: {
              x: x,
              y: y,
              width: blockSize,
              height: blockSize
            },
            errorLevel: Math.round(avgBlockError)
          });
        }
      }
    }

    return anomalies;
  }

  /**
   * Classify anomaly type based on error pattern
   * COPY: Similar error patterns in multiple locations
   * MOVE: High error in one location, low in another
   * ADD: Isolated high error region
   */
  _classifyAnomaly(diffMap, x, y, blockSize, width, height, threshold) {
    // Check for COPY: look for similar patterns elsewhere
    const currentPattern = this._extractPattern(diffMap, x, y, blockSize, width, height);
    
    // Search for similar patterns (simplified - full implementation would use more sophisticated matching)
    let similarCount = 0;
    const searchStep = blockSize * 2;

    for (let sy = 0; sy < height - blockSize; sy += searchStep) {
      for (let sx = 0; sx < width - blockSize; sx += searchStep) {
        if (sx === x && sy === y) continue; // Skip current block

        const otherPattern = this._extractPattern(diffMap, sx, sy, blockSize, width, height);
        const similarity = this._comparePatterns(currentPattern, otherPattern);

        if (similarity > 0.7) {
          similarCount++;
        }
      }
    }

    if (similarCount > 0) {
      return {
        type: 'copy',
        description: `Duplicated content detected (${similarCount} similar regions found)`
      };
    }

    // Check for ADD: isolated high error region
    const surroundingError = this._getSurroundingError(diffMap, x, y, blockSize, width, height);
    if (surroundingError < threshold * 0.5) {
      return {
        type: 'add',
        description: 'New content added without matching compression artifacts'
      };
    }

    // Check for MOVE: high error with low error elsewhere (simplified)
    // This would require tracking original positions, which is complex
    // For now, classify as unknown if not clearly COPY or ADD
    return {
      type: 'unknown',
      description: 'Suspicious compression pattern detected'
    };
  }

  /**
   * Extract error pattern from a block
   */
  _extractPattern(diffMap, x, y, blockSize, width, height) {
    const pattern = [];
    for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
      for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
        pattern.push(diffMap[y + dy][x + dx]);
      }
    }
    return pattern;
  }

  /**
   * Compare two patterns for similarity
   */
  _comparePatterns(pattern1, pattern2) {
    if (pattern1.length !== pattern2.length) return 0;

    let sumSquaredDiff = 0;
    let sumSquared1 = 0;

    for (let i = 0; i < pattern1.length; i++) {
      const diff = pattern1[i] - pattern2[i];
      sumSquaredDiff += diff * diff;
      sumSquared1 += pattern1[i] * pattern1[i];
    }

    if (sumSquared1 === 0) return 0;
    return 1 - (sumSquaredDiff / sumSquared1);
  }

  /**
   * Get average error level in surrounding area
   */
  _getSurroundingError(diffMap, x, y, blockSize, width, height) {
    const margin = blockSize;
    let totalError = 0;
    let count = 0;

    for (let sy = Math.max(0, y - margin); sy < Math.min(height, y + blockSize + margin); sy++) {
      for (let sx = Math.max(0, x - margin); sx < Math.min(width, x + blockSize + margin); sx++) {
        // Skip the block itself
        if (sx >= x && sx < x + blockSize && sy >= y && sy < y + blockSize) {
          continue;
        }
        totalError += diffMap[sy][sx];
        count++;
      }
    }

    return count > 0 ? totalError / count : 0;
  }
}

module.exports = ELAService;




