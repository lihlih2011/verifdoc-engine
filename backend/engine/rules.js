export function applyRules(data) {
  const findings = [];

  if (data.metadata?.inconsistent) {
    findings.push({
      type: 'METADATA',
      message: 'Incohérence détectée dans les métadonnées',
      critical: true
    });
  }

  if (data.integrity?.altered) {
    findings.push({
      type: 'INTEGRITY',
      message: 'Traces de modification détectées (copy/move/add)',
      critical: true
    });
  }

  if (data.ela?.suspicious) {
    findings.push({
      type: 'ELA',
      message: 'Analyse ELA anormale',
      critical: true
    });
  }

  if (data.ocr?.inconsistent) {
    findings.push({
      type: 'OCR',
      message: 'Incohérence OCR détectée',
      critical: true
    });
  }

  return findings;
}
