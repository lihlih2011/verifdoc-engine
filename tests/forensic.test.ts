import { runELAAnalysis } from '@/server/ia/ela';
import { runNoisePrint } from '@/server/ia/noiseprint';
import { runCopyMove } from '@/server/ia/copymove';
import { runOCR } from '@/server/ia/ocr';
import { runFusionEngine } from '@/server/ia/fusion';
import { Buffer } from 'buffer';
import path from 'path';
import fs from 'fs/promises';

// --- Dummy Data for Tests ---
// A tiny 1x1 transparent PNG image buffer
const dummyPngBuffer = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

// A slightly larger dummy image for more realistic processing
// This is a base64 encoded 8x8 red PNG
const smallRedPngBuffer = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFUlEQVR42mP8z8BQz0AEYBxwAAFGAAf4g/1fAAAAAElFTkSuQmCC",
  "base64"
);

// Mock tesseract.js worker to avoid heavy external dependency and actual OCR processing
jest.mock('tesseract.js', () => ({
  createWorker: jest.fn(() => ({
    recognize: jest.fn(() => Promise.resolve({
      data: {
        text: 'Sample text with a date 01/01/2023 and a number 12345.',
        words: [{ confidence: 95, text: 'Sample' }],
      },
    })),
    terminate: jest.fn(() => Promise.resolve()),
  })),
}));

describe('Forensic Analysis Modules (src/server/ia/)', () => {

  // --- ELA Analysis (ela.ts) ---
  it('runELAAnalysis should not throw an exception and return valid format', async () => {
    const result = await runELAAnalysis(smallRedPngBuffer, 'test.png');
    expect(result.success).toBe(true);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('heatmap');
    expect(typeof result.heatmap).toBe('string');
    expect(result.heatmap).toMatch(/^data:image\/png;base64,/);
    expect(result).toHaveProperty('score');
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('runELAAnalysis should handle unsupported image format gracefully', async () => {
    const invalidBuffer = Buffer.from('not an image');
    const result = await runELAAnalysis(invalidBuffer, 'invalid.txt');
    expect(result.success).toBe(false);
    expect(result.data).toHaveProperty('error');
  });

  // --- NoisePrint Analysis (noiseprint.ts) ---
  it('runNoisePrint should not throw an exception and return valid format', async () => {
    const result = await runNoisePrint(smallRedPngBuffer, 'test.png');
    expect(result.success).toBe(true);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('heatmap');
    expect(typeof result.heatmap).toBe('string');
    expect(result.heatmap).toMatch(/^data:image\/png;base64,/);
    expect(result).toHaveProperty('score');
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('runNoisePrint should handle unsupported image format gracefully', async () => {
    const invalidBuffer = Buffer.from('not an image');
    const result = await runNoisePrint(invalidBuffer, 'invalid.txt');
    expect(result.success).toBe(false);
    expect(result.data).toHaveProperty('error');
  });

  // --- Copy-Move Analysis (copymove.ts) ---
  it('runCopyMove should not throw an exception and return valid format', async () => {
    const result = await runCopyMove(smallRedPngBuffer, 'test.png');
    expect(result.success).toBe(true);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('heatmap');
    expect(typeof result.heatmap).toBe('string');
    expect(result.heatmap).toMatch(/^data:image\/png;base64,/);
    expect(result).toHaveProperty('score');
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('runCopyMove should handle unsupported image format gracefully', async () => {
    const invalidBuffer = Buffer.from('not an image');
    const result = await runCopyMove(invalidBuffer, 'invalid.txt');
    expect(result.success).toBe(false);
    expect(result.data).toHaveProperty('error');
  });

  // --- OCR Analysis (ocr.ts) ---
  it('runOCR should not throw an exception and return valid format', async () => {
    const result = await runOCR(smallRedPngBuffer, 'test.png'); // Pass buffer, filename is ignored by mock
    expect(result.success).toBe(true);
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('rawText');
    expect(result.data).toHaveProperty('dates');
    expect(result.data).toHaveProperty('numbers');
    expect(result.data).toHaveProperty('names');
    expect(result.data).toHaveProperty('anomalies');
    expect(result).toHaveProperty('score');
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  // --- Fusion Engine (fusion.ts) ---
  it('runFusionEngine should combine scores and return a global score and summary', () => {
    const mockResults = {
      ela: { score: 70, heatmap: 'data:image/png;base64,...' },
      noiseprint: { score: 60, heatmap: 'data:image/png;base64,...' },
      copymove: { score: 30, heatmap: 'data:image/png;base64,...' },
      ocr: { score: 80, anomalies: [], text: '...' },
      mlAnalysis: { // Mock ML analysis results
        efficientnet: { score: 0.1, isForgery: false },
        resnet: { score: 0.05, isForgery: false },
        vit: { score: 0.15, isForgery: false },
        heatmap: 'data:image/png;base64,...',
      },
    };

    const fusionResult = runFusionEngine(mockResults);

    expect(fusionResult).toHaveProperty('data');
    expect(fusionResult.data).toHaveProperty('forgery_score');
    expect(typeof fusionResult.data.forgery_score).toBe('number');
    expect(fusionResult.data).toHaveProperty('risk_level');
    expect(fusionResult.data).toHaveProperty('explanation');
    expect(fusionResult.data.explanation).toHaveProperty('summary');
    expect(fusionResult).toHaveProperty('score'); // Global score from fusion
    expect(typeof fusionResult.score).toBe('number');
  });
});