import express from "express";
import cors from "cors";
import multer from "multer";

// 🔥 MOTEUR PRO : c’est CE fichier qui doit être utilisé
import { analyzeDocument } from "../engine/analyzer.js";

const app = express();
app.use(cors());
const upload = multer();

app.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }

    const buffer = req.file.buffer;

    const result = await analyzeDocument({
      buffer,
      metadata: {},
      integrity: {},
      ela: {},
      ocr: {}
    });

    return res.json(result);

  } catch (err) {
    console.error("Erreur analyse:", err);
    return res.status(500).json({
      error: "Erreur interne",
      details: err.message
    });
  }
});

app.listen(3001, () => {
  console.log("🚀 VerifDoc CPU PRO API active sur http://localhost:3001/analyze");
});
