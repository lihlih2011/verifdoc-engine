import crypto from "crypto";
import { applyRules } from "./rules.js";
import { computeScore } from "./score.js";

// 🔌 Import des modules CPU avancés
import { detectCopyMove } from "../services/copyMove.service.js";
import { detectNoiseInconsistency } from "../services/noise.service.js";
import { detectResampling } from "../services/resampling.service.js";

export async function analyzeDocument(data) {
  const findings = [];
  
  // 📌 RUN DES MODULES CPU (analyse binaire + métriques)
  const cm = await detectCopyMove(data.buffer);
  const noise = await detectNoiseInconsistency(data.buffer);
  const rs = await detectResampling(data.buffer);

  if (cm.suspicious) {
    findings.push({
      type: "COPY_MOVE",
      message: "Suspicion de duplication locale (copy-move)",
      metric: cm.metric,
      critical: true
    });
  }

  if (noise.suspicious) {
    findings.push({
      type: "NOISE_INCONSISTENCY",
      message: "Rupture locale de bruit → possible splicing",
      metric: noise.metric,
      critical: true
    });
  }

  if (rs.suspicious) {
    findings.push({
      type: "RESAMPLING",
      message: "Anomalie d'interpolation → modification géométrique probable",
      metric: rs.metric,
      critical: true
    });
  }

  // 📌 règles supplémentaires (OCR, metadata, integrity…)
  const ruleFindings = applyRules(data);
  findings.push(...ruleFindings);

  // 📌 scoring
  const score = computeScore(findings);

  // 📌 verdict forensic
  const verdict = findings.some(f => f.critical === true)
    ? "DOCUMENT SUSPECT"
    : "DOCUMENT VALIDE";

  // 📌 hash de preuve
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify({ findings, score }))
    .digest("hex");

  return {
    meta: {
      engine: "VerifDoc CPU PRO",
      version: "1.1",
      generated_at: new Date().toISOString()
    },
    verdict,
    score,
    findings,
    integrity_proof: {
      algorithm: "SHA-256",
      hash
    }
  };
}
