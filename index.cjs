const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

console.log("🚀 VerifDoc index.cjs LANCÉ");

const app = express();
const PORT = 3001;

// -------- Upload
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 }
});

// -------- UI
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.end(`
<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>VerifDoc</title></head>
<body>
<h2>VerifDoc – Analyse</h2>
<form action="/api/verify" method="post" enctype="multipart/form-data">
<input type="file" name="document" required />
<br><br><button type="submit">Analyser</button>
</form>
</body></html>
`);
});

// -------- Fingerprint
function createDocumentFingerprint(file) {
  const buffer = fs.readFileSync(file.path);
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");

  const fingerprint = {
    document_id: crypto.randomUUID(),
    filename: file.originalname,
    hash_sha256: hash,
    mime_type: file.mimetype,
    size_bytes: file.size,
    received_at: new Date().toISOString(),
    engine_version: "verifdoc-mvp-0.1"
  };

  const dir = path.join(__dirname, "fingerprints");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  fs.writeFileSync(
    path.join(dir, `${fingerprint.document_id}.json`),
    JSON.stringify(fingerprint, null, 2),
    "utf-8"
  );
  return fingerprint;
}

// -------- PDFID → IPA™
function runPdfIdAndIPA(filePath) {
  const raw = execSync(`python -m pdfid "${filePath}"`, { encoding: "utf-8" });

  const get = (label) => {
    const r = new RegExp(`${label}\\s+(\\d+)`, "i");
    const m = raw.match(r);
    return m ? parseInt(m[1], 10) : 0;
  };

  const indicators = {
    encrypted: get("/Chiffrer"),
    objstm: get("/ObjStm"),
    javascript: get("/JavaScript") + get("/JS"),
    openaction: get("/OpenAction"),
    aa: get("/AA"),
    embedded: get("/EmbeddedFile"),
    xfa: get("/XFA")
  };

  let ipa = 0;
  if (indicators.javascript > 0) ipa += 30;
  if (indicators.objstm > 0) ipa += 20;
  if (indicators.openaction > 0) ipa += 15;
  if (indicators.aa > 0) ipa += 15;
  if (indicators.embedded > 0) ipa += 10;
  if (indicators.encrypted > 0) ipa += 10;
  if (ipa > 100) ipa = 100;

  return {
    indicators,
    ipa,
    level: ipa >= 60 ? "ALTÉRATION PROBABLE" : "FAIBLE PROBABILITÉ",
    raw
  };
}

// -------- API
app.post("/api/verify", upload.single("document"), (req, res) => {
  if (!req.file) return res.status(400).send("Aucun fichier");

  const fingerprint = createDocumentFingerprint(req.file);
  const pdf = runPdfIdAndIPA(req.file.path);

  res.json({
    status: "OK",
    fingerprint,
    ipa: pdf.ipa,
    level: pdf.level,
    indicators: pdf.indicators
  });
});

// -------- Start
app.listen(PORT, () => {
  console.log(`✅ Serveur actif sur http://localhost:${PORT}`);
});
