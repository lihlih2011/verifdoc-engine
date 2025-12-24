import Jimp from "jimp";

/**
 * Resampling Detection
 * Détection d'interpolations suspectes (bicubic/bilinear),
 * caractéristiques de retouches ou redimensionnements locaux.
 */
export async function detectResampling(buffer) {
  try {
    const img = await Jimp.read(buffer);
    img.resize(256, 256); // optimisation CPU

    const w = img.bitmap.width;
    const h = img.bitmap.height;

    let gradientSum = 0;
    let count = 0;

    for (let y = 0; y < h - 1; y++) {
      for (let x = 0; x < w - 1; x++) {
        const p1 = img.getPixelColor(x, y);
        const p2 = img.getPixelColor(x + 1, y);
        const p3 = img.getPixelColor(x, y + 1);

        const g1 = Math.abs(p1 - p2);
        const g2 = Math.abs(p1 - p3);

        gradientSum += g1 + g2;
        count += 2;
      }
    }

    const avgGradient = gradientSum / count;

    return {
      suspicious: avgGradient < 50 || avgGradient > 420, 
      metric: avgGradient
    };

  } catch (err) {
    return {
      suspicious: false,
      metric: 0,
      error: err.message
    };
  }
}
