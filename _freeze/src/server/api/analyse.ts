import { v4 as uuidv4 } from 'uuid';
import { runELAAnalysis } from '../ia/ela';
import { runNoisePrint } from '../ia/noiseprint';
import { runCopyMove } from '../ia/copymove';
import { runOCR } from '../ia/ocr';
import { runFusionEngine } from '../ia/fusion';
import { analyseForgery } from './ml'; // Import the new ML analysis function

// Placeholder for a 1x1 transparent PNG base64 string
const DUMMY_HEATMAP_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

// --- Placeholder AI Module Functions ---
// These functions simulate the behavior of actual AI analysis modules.
// In a real application, these would involve complex AI model inference.

interface AnalysisResult {
  success: boolean;
  data: any;
  heatmap?: string; // Base64 encoded image
  score?: number;   // A score from 0 to 100
}

// The existing runELAAnalysis, runNoisePrint, runCopyMove, runOCR are already defined in src/server/ia/
// I will assume these are the functions to be called.

// --- Main API Handler ---

export async function analyseDocument(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const fileEntry = formData.get('file');

    if (!fileEntry || typeof fileEntry === 'string') {
      return new Response(JSON.stringify({ error: "No file uploaded or invalid file entry." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const file = fileEntry as File;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    if (!fileBuffer || fileBuffer.length === 0) {
      return new Response(JSON.stringify({ error: "Uploaded file is empty." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Received file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);

    // Run individual AI modules
    const elaResult = await runELAAnalysis(fileBuffer, file.name);
    const noiseprintResult = await runNoisePrint(fileBuffer, file.name);
    const copymoveResult = await runCopyMove(fileBuffer, file.name);
    const ocrResult = await runOCR(fileBuffer, file.name);
    
    // NEW: Run ML Forgery Analysis
    const mlForgeryAnalysisResult = await analyseForgery(fileBuffer);

    const moduleResults = {
      ela: elaResult,
      noiseprint: noiseprintResult,
      copymove: copymoveResult,
      ocr: ocrResult,
      mlAnalysis: mlForgeryAnalysisResult, // NEW: Include ML analysis results
    };

    // Run fusion engine (you might need to update runFusionEngine to accept mlAnalysis)
    const fusionResult = runFusionEngine(moduleResults); // Assuming fusion engine is updated to handle new module

    // Build unified result object
    const unifiedResult = {
      id: uuidv4(),
      filename: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      ela: elaResult,
      noiseprint: noiseprintResult,
      copymove: copymoveResult,
      ocr: ocrResult,
      mlAnalysis: mlForgeryAnalysisResult, // NEW: Add ML analysis to the final result
      fusion: fusionResult.data, // Assuming fusionResult has a 'data' field
      globalScore: fusionResult.score, // Assuming fusionResult has a 'score' field
      indicators: fusionResult.data.indicators, // Assuming fusionResult.data has 'indicators'
      summary: fusionResult.data.summary, // Assuming fusionResult.data has 'summary'
      heatmaps: {
        ela: elaResult.heatmap,
        noiseprint: noiseprintResult.heatmap,
        copymove: copymoveResult.heatmap,
        mlForgery: mlForgeryAnalysisResult.heatmap, // NEW: Add ML forgery heatmap
      }
    };

    return new Response(JSON.stringify(unifiedResult), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Analysis API error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}