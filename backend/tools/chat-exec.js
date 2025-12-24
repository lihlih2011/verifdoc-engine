// FICHIER UNIQUE : C:\Users\chaou\Desktop\VerifDoc\backend\tools\ai-cockpit.js
// MODE : CHAT CLI + ACTIONS AUTOMATIQUES + AMD RYZEN OPTIMISÉ
// 1 COMMANDE = TU PARLES, L’IA RÉPOND ET AGIT

import readline from "readline";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL = "deepseek-coder:6.7b";
const OLLAMA_URL = "http://localhost:11434/api/generate";
const PROJECT_ROOT = path.resolve(__dirname, "../../");
const ANALYZE_FILE = path.resolve(PROJECT_ROOT, "backend/services/analyze.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("🚀 AI COCKPIT — Chat + Exécution automatique");
console.log("👉 Tape librement (exit pour quitter)\n");

async function callLLM(prompt) {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      options: { num_thread: 8, num_ctx: 2048 }
    })
  });
  const data = await res.json();
  return data.response.trim();
}

function loop() {
  rl.question("> ", async (input) => {
    if (input === "exit") {
      rl.close();
      return;
    }

    // commandes rapides intégrées
    if (input === "analyze") {
      const code = fs.readFileSync(ANALYZE_FILE, "utf-8");
      const out = await callLLM(
        "Explique clairement ce fichier Node.js :\n\n" + code
      );
      console.log("\n🤖", out, "\n");
      return loop();
    }

    if (input === "upgrade") {
      const code = fs.readFileSync(ANALYZE_FILE, "utf-8");
      const out = await callLLM(
        "Transforme ce fichier en MVP2 plus robuste. RENVOIE UNIQUEMENT le fichier complet :\n\n" +
          code
      );
      fs.copyFileSync(ANALYZE_FILE, ANALYZE_FILE + ".bak");
      fs.writeFileSync(ANALYZE_FILE, out);
      console.log("✅ analyze.js mis à jour (backup créé)");
      return loop();
    }

    // mode libre IA + exécution
    const response = await callLLM(`
Si une ACTION système est nécessaire, réponds STRICTEMENT:
EXECUTE:
<commande>

Sinon réponds normalement.

DEMANDE:
${input}
`);

    if (response.startsWith("EXECUTE:")) {
      const cmd = response.replace("EXECUTE:", "").trim();
      try {
        console.log("⚙️", cmd);
        console.log(execSync(cmd, { stdio: "pipe" }).toString());
      } catch (e) {
        console.error("❌", e.message);
      }
    } else {
      console.log("\n🤖", response, "\n");
    }

    loop();
  });