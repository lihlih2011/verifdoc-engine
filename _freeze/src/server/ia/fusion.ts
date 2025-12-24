export function runFusionEngine(results: {
  ela?: { score: number, heatmap?: string },
  noiseprint?: { score: number, heatmap?: string },
  copymove?: { score: number, heatmap?: string },
  ocr?: { score: number, anomalies: string[], text: string }
}) {
  const validScores: number[] = [];
  const indicators: string[] = [];

  if (results.ela && typeof results.ela.score === 'number') {
    validScores.push(results.ela.score);
    if (results.ela.score > 60) {
      indicators.push("Zones à forte anomalie ELA");
    }
  }

  if (results.noiseprint && typeof results.noiseprint.score === 'number') {
    validScores.push(results.noiseprint.score);
    if (results.noiseprint.score > 50) {
      indicators.push("Incohérences PRNU détectées");
    }
  }

  if (results.copymove && typeof results.copymove.score === 'number') {
    validScores.push(results.copymove.score);
    if (results.copymove.score > 40) {
      indicators.push("Régions clonées / copiées");
    }
  }

  if (results.ocr && typeof results.ocr.score === 'number') {
    validScores.push(results.ocr.score);
    if (results.ocr.anomalies.length > 0) {
      indicators.push("Anomalies logiques OCR");
    }
  }

  const globalScore = validScores.length > 0
    ? parseFloat((validScores.reduce((sum, current) => sum + current, 0) / validScores.length).toFixed(2))
    : 0;

  let summary = "";
  if (globalScore > 75) {
    summary = "Document probablement authentique.";
  } else if (globalScore >= 40) {
    summary = "Document présentant des signes d’altération possibles.";
  } else {
    summary = "Document fortement suspect ou altéré.";
  }

  if (indicators.length > 0) {
    summary += " Les modules suivants ont détecté des anomalies : " + indicators.join(", ") + ".";
  }

  return {
    success: true,
    globalScore,
    indicators,
    summary,
    heatmaps: {
      ela: results.ela?.heatmap,
      noiseprint: results.noiseprint?.heatmap,
      copymove: results.copymove?.heatmap,
    },
    raw: results,
  };
}