export function computeScore(findings) {
  let score = 100;

  findings.forEach(f => {
    if (f.critical) score -= 40;
  });

  if (score < 0) score = 0;
  return score;
}
