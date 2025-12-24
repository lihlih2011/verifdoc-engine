async function analyze(file) {
  // Résultat de base
  let result = {
    document: file.originalname,
    verdict: "DOCUMENT VALIDE",
    confidenceScore: 85,
    anomalies: [],
    criticalInconsistency: false,
    criticalReasons: [],
    analyzedAt: new Date().toISOString()
  };

  // ===============================
  // CRITICAL INCONSISTENCY FLAGS
  // ===============================
  let criticalInconsistency = false;
  let criticalReasons = [];

  // ===============================
  // EXTRACTION TEXTE (MVP SIMPLE)
  // ===============================
  let extractedText = "";
  try {
    if (file.buffer) {
      extractedText = file.buffer.toString("utf8").toLowerCase();
    }
  } catch (e) {
    // Ignore extraction errors (MVP)
  }

  // ===============================
  // RÈGLES FORENSIC BLOQUANTES
  // ===============================

  // 1) Détection dates multiples (modification suspecte)
  const datePattern = /\b(19|20)\d{2}\b/g;
  const datesFound = extractedText.match(datePattern);
  if (datesFound && datesFound.length > 2) {
    criticalInconsistency = true;
    criticalReasons.push("Multiple date values detected in document content");
  }

  // 2) Indices explicites de modification
  if (
    extractedText.includes("modified") ||
    extractedText.includes("edited") ||
    extractedText.includes("update")
  ) {
    criticalInconsistency = true;
    criticalReasons.push("Document content indicates possible manual modification");
  }

  // ===============================
  // APPLICATION DE LA RÈGLE FORENSIC
  // ===============================
  if (criticalInconsistency === true) {
    result.verdict = "DOCUMENT SUSPECT";
    result.confidenceScore = 40;
    result.criticalInconsistency = true;
    result.criticalReasons = criticalReasons;
    result.anomalies.push("Critical content inconsistency detected");
  }

  // ===============================
  // RETOUR FINAL
  // ===============================
  return result;
}
