import { v4 as uuidv4 } from 'uuid';

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

async function runELAAnalysis(fileBuffer: Buffer, filename: string): Promise<AnalysisResult> {
  console.log(`[ELA] Analyzing ${filename}...`);
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    success: true,
    data: { message: "ELA analysis complete (placeholder)" },
    heatmap: DUMMY_HEATMAP_BASE64,
    score: parseFloat((Math.random() * 100).toFixed(2)),
  };
}

async function runNoisePrint(fileBuffer: Buffer, filename: string): Promise<AnalysisResult> {
  console.log(`[NoisePrint] Analyzing ${filename}...`);
  await new Promise(resolve => setTimeout(resolve, 600));
  return {
    success: true,
    data: { message: "NoisePrint analysis complete (placeholder)" },
    heatmap: DUMMY_HEATMAP_BASE64,
    score: parseFloat((Math.random() * 100).toFixed(2)),
  };
}

async function runCopyMove(fileBuffer: Buffer, filename: string): Promise<AnalysisResult> {
  console.log(`[CopyMove] Analyzing ${filename}...`);
  await new Promise(resolve => setTimeout(resolve, 700));
  return {
    success: true,
    data: { message: "Copy-Move analysis complete (placeholder)" },
    heatmap: DUMMY_HEATMAP_BASE64,
    score: parseFloat((Math.random() * 100).toFixed(2)),
  };
}

async function runOCR(fileBuffer: Buffer, filename: string): Promise<AnalysisResult> {
  console.log(`[OCR] Analyzing ${filename}...`);
  await new Promise(resolve => setTimeout(resolve, 400));
  return {
    success: true,
    data: { text: "Extracted text (placeholder)", layout: [] },
    score: parseFloat((Math.random() * 100).toFixed(2)), // OCR confidence score
  };
}

async function runFusionEngine(moduleResults: { [key: string]: AnalysisResult }): Promise<AnalysisResult> {
  console.log("[Fusion] Fusing results...");
  await new Promise(resolve => setTimeout(resolve, 300));

  const scores: number[] = [];
  for (const key in moduleResults) {
    if (moduleResults[key].success && typeof moduleResults[key].score === 'number') {
      scores.push(moduleResults[key].score!);
    }
  }

  const globalScore = scores.length > 0
    ? parseFloat((scores.reduce((sum, current) => sum + current, 0) / scores.length).toFixed(2))
    : 0;

  const indicators = [
    globalScore > 70 ? "High risk of forgery" : "Low risk of forgery",
    moduleResults.ela?.score && moduleResults.ela.score > 50 ? "Compression anomalies detected" : "Normal compression",
    moduleResults.noiseprint?.score && moduleResults.noiseprint.score > 50 ? "AI noise signature found" : "No AI noise signature",
  ];

  const summary = globalScore > 60
    ? "The document shows multiple signs of potential manipulation across various forensic modules."
    : "The document appears largely authentic with no significant signs of forgery detected.";

  return {
    success: true,
    data: {
      summary,
      indicators,
    },
    score: globalScore,
  };
}

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

    const moduleResults = {
      ela: elaResult,
      noiseprint: noiseprintResult,
      copymove: copymoveResult,
      ocr: ocrResult,
    };

    // Run fusion engine
    const fusionResult = await runFusionEngine(moduleResults);

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
      fusion: fusionResult.data,
      globalScore: fusionResult.score,
      indicators: fusionResult.data.indicators,
      summary: fusionResult.data.summary,
      heatmaps: {
        ela: elaResult.heatmap,
        noiseprint: noiseprintResult.heatmap,
        copymove: copymoveResult.heatmap,
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