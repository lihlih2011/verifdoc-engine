import Jimp from "jimp";

/**
 * Noise Inconsistency Detector
 * Analyse le bruit local et détecte des ruptures caractéristiques d'un montage.
 */
export async function detectNoiseInconsistency(buffer) {
  try {
    const img = await Jimp.read(buffer);
    img.resize(256, 256); // optimisation CPU

    const w = img.bitmap.width;
    const h = img.bitmap.height;

    const noiseMap = [];
    let totalDeviation = 0;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const center = img.getPixelColor(x, y);
        const neighbors = [
          img.getPixelColor(x - 1, y),
          img.getPixelColor(x + 1, y),
          img.getPixelColor(x, y - 1),
          img.getPixelColor(x, y + 1)
        ];

        let deviation = 0;
        neighbors.forEach(n => {
          if (n !== center) deviation++;
        });

        noiseMap.push(deviation);
        totalDeviation += deviation;
      }
    }

    const avgNoise = totalDeviation / noiseMap.length;

    return {
      suspicious: avgNoise > 1.8,   // seuil empirique
      metric: avgNoise
    };

  } catch (err) {
    return {
      suspicious: false,
      metric: 0,
      error: err.message
    };
  }
}
