import Jimp from "jimp";

/**
 * Copy-Move Detection (CPU simple version)
 * Détecte des similarités locales → suspicion de duplication.
 */
export async function detectCopyMove(buffer) {
  try {
    const image = await Jimp.read(buffer);

    // réduction pour accélération
    image.resize(256, 256);

    // extraction data
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    let score = 0;

    // analyse simple zones adjacentes
    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        const p1 = image.getPixelColor(x, y);
        const p2 = image.getPixelColor(x + 1, y);
        if (p1 === p2) score++;
      }
    }

    const normalized = score / (width * height);

    return {
      suspicious: normalized > 0.15,
      metric: normalized
    };

  } catch (err) {
    return {
      suspicious: false,
      metric: 0,
      error: err.message
    };
  }
}
