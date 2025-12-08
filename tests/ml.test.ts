import { loadModels, getModel } from '@/server/services/ml/modelLoader';
import { runInference } from '@/server/services/ml/inference';
import { generateGradCAMHeatmap } from '@/server/services/ml/gradcam';
import { preprocessImage } from '@/server/services/ml/preprocessor';
import { Buffer } from 'buffer';
import * as ort from 'onnxruntime-node';

// --- Dummy Data for Tests ---
// A tiny 1x1 transparent PNG image buffer
const dummyPngBuffer = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

describe('ML Services (src/server/services/ml/)', () => {
  // Mock onnxruntime-node to prevent actual model loading during tests
  // This is crucial as actual model files might not be present or are large.
  jest.mock('onnxruntime-node', () => ({
    InferenceSession: {
      create: jest.fn(() => Promise.resolve({
        inputNames: ['input'],
        outputNames: ['output'],
        run: jest.fn(() => Promise.resolve({
          output: { data: new Float32Array([0.2, 0.8]) } // Simulate a binary classification output
        }))
      }))
    },
    Tensor: jest.fn(() => ({})),
  }));

  beforeAll(async () => {
    // Attempt to load models, but they will be mocked
    await loadModels();
  });

  // --- modelLoader.ts tests ---
  it('loadModels should attempt to load models', async () => {
    expect(ort.InferenceSession.create).toHaveBeenCalledTimes(3); // efficientnet, resnet, vit
  });

  it('getModel should return a loaded model (mocked)', () => {
    const model = getModel('efficientnet');
    expect(model).toBeDefined();
  });

  // --- preprocessor.ts tests ---
  it('preprocessImage should return a Float32Array', async () => {
    const preprocessed = await preprocessImage(dummyPngBuffer);
    expect(preprocessed).toBeInstanceOf(Float32Array);
    expect(preprocessed.length).toBeGreaterThan(0);
  });

  // --- inference.ts tests ---
  it('runInference should return a valid InferenceResult for a loaded model', async () => {
    const result = await runInference('efficientnet', dummyPngBuffer);
    expect(result).toHaveProperty('score');
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result).toHaveProperty('isForgery');
    expect(typeof result.isForgery).toBe('boolean');
  });

  it('runInference should return a dummy result if model is not loaded', async () => {
    // Temporarily mock getModel to return undefined
    const originalGetModel = getModel;
    (getModel as jest.Mock).mockReturnValueOnce(undefined);

    const result = await runInference('nonExistentModel', dummyPngBuffer);
    expect(result).toHaveProperty('score');
    expect(typeof result.score).toBe('number');
    expect(result).toHaveProperty('isForgery');
    expect(typeof result.isForgery).toBe('boolean');

    // Restore original getModel
    (getModel as jest.Mock).mockImplementation(originalGetModel);
  });

  // --- gradcam.ts tests ---
  it('generateGradCAMHeatmap should return a base64 encoded PNG string', async () => {
    const heatmap = await generateGradCAMHeatmap(dummyPngBuffer);
    expect(typeof heatmap).toBe('string');
    expect(heatmap).toMatch(/^data:image\/png;base64,/);
  });
});