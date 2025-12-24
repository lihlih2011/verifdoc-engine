module.exports = function generateReportHTML(data) {
  // Helper function to get color for ELA anomaly type
  function getELAColor(type) {
    switch(type) {
      case 'copy': return '#007bff';
      case 'move': return '#ffc107';
      case 'add': return '#dc3545';
      default: return '#6c757d';
    }
  }

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport VerifDoc</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #222;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 30px;
    }
    .header img {
      height: 70px;
    }
    h1 {
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-top: 0;
    }
    .section {
      margin-top: 25px;
    }
    .label {
      font-weight: bold;
    }
    .verdict {
      font-size: 20px;
      font-weight: bold;
      color: red;
    }
    .agent-results {
      margin-top: 20px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 5px;
    }
    .agent-item {
      margin: 10px 0;
      padding: 10px;
      background-color: white;
      border-left: 3px solid #007bff;
    }
    .agent-name {
      font-weight: bold;
      color: #007bff;
    }
    footer {
      margin-top: 50px;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #ccc;
      padding-top: 10px;
    }
  </style>
</head>
<body>

<div class="header">
  <img src="/logo.png" alt="AlgorIA">
  <div>
    <h1>Rapport d’analyse documentaire — VerifDoc</h1>
    <div>Propulsé par AlgorIA</div>
  </div>
</div>

<div class="section">
  <span class="label">Document analysé :</span> ${data.document}
</div>

<div class="section">
  <span class="label">Date d’analyse :</span> ${new Date(data.analyzedAt).toLocaleString()}
</div>

cd C:\Users\chaou\Desktop\VerifDoc\backend

@"
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
"@ | Set-Content services/copyMove.service.js -Encoding UTF8

  <span class="label">Verdict :</span>
  <div class="verdict">${data.verdict}</div>
</div>

<div class="section">
  <span class="label">Score de confiance :</span> ${data.confidenceScore} / 100
</div>

<div class="section">
  <span class="label">Anomalies détectées :</span>
  <ul>
    ${data.anomalies.map(a => `<li>${a}</li>`).join("")}
  </ul>
</div>

${data.elaAnomalies && data.elaAnomalies.length > 0 ? `
<div class="section">
  <span class="label" style="color: #dc3545; font-size: 1.2em;">🔍 Error Level Analysis (ELA) :</span>
  <div style="background-color: #fff3cd; padding: 20px; border-radius: 10px; margin-top: 15px; border-left: 5px solid #ffc107;">
    <p style="margin-bottom: 15px;"><strong>${data.elaAnomalies.length} anomalie(s) de compression détectée(s)</strong></p>
    <div style="display: grid; gap: 10px;">
      ${data.elaAnomalies.map(ela => `
        <div style="background: white; padding: 15px; border-radius: 5px; border-left: 3px solid ${getELAColor(ela.type)};">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <strong style="text-transform: uppercase; color: ${getELAColor(ela.type)};">
              ${ela.type === 'copy' ? '📋 COPY' : ela.type === 'move' ? '↔️ MOVE' : ela.type === 'add' ? '➕ ADD' : '⚠️ UNKNOWN'}
            </strong>
            <span style="background: #e9ecef; padding: 3px 10px; border-radius: 15px; font-size: 0.9em;">
              Confiance: ${ela.confidence}%
            </span>
          </div>
          <p style="margin: 5px 0; color: #495057;">${ela.description || 'Anomalie de compression détectée'}</p>
          ${ela.region ? `
            <p style="margin: 5px 0; font-size: 0.9em; color: #6c757d;">
              Région: x=${ela.region.x}, y=${ela.region.y}, largeur=${ela.region.width}, hauteur=${ela.region.height}
            </p>
          ` : ''}
          ${ela.errorLevel ? `
            <p style="margin: 5px 0; font-size: 0.9em; color: #6c757d;">
              Niveau d'erreur: ${ela.errorLevel}
            </p>
          ` : ''}
        </div>
      `).join("")}
    </div>
    <p style="margin-top: 15px; font-size: 0.9em; color: #856404;">
      <strong>Explication:</strong> L'analyse ELA détecte les modifications en comparant les niveaux d'erreur de compression. 
      Les régions modifiées présentent des niveaux d'erreur anormaux par rapport au reste du document.
    </p>
  </div>
</div>
` : ""}

${data.agentResults ? `
<div class="section">
  <span class="label">Résultats par agent :</span>
  <div class="agent-results">
    ${data.agentResults.map(agent => `
      <div class="agent-item">
        <div class="agent-name">${agent.agentName} (${agent.agentId})</div>
        <div>Verdict: ${agent.verdict}</div>
        <div>Score: ${agent.confidenceScore} / 100</div>
        <div>Anomalies détectées: ${agent.anomalyCount}</div>
      </div>
    `).join("")}
    <div style="margin-top: 15px; font-size: 12px; color: #666;">
      Mode de fusion: ${data.fusionMode || "N/A"} | Agents utilisés: ${data.agentsUsed || data.agentResults.length}
    </div>
  </div>
</div>
` : ""}

<footer>
  Rapport généré automatiquement par VerifDoc  
  <br>
  Technologie d’analyse documentaire assistée par intelligence artificielle
</footer>

</body>
</html>
`;
};
