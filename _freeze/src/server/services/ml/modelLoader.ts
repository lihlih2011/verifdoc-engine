import * as ort from 'onnxruntime-node';
import path from 'path';

interface ONNXModels {
  [key: string]: ort.InferenceSession;
}

const models: ONNXModels = {};
const MODEL_DIR = path.join(__dirname, '..', '..', 'ml_models'); // Assuming models are in src/server/ml_models

// Placeholder model names and paths. You will need to provide the actual .onnx files.
const MODEL_CONFIG = {
  efficientnet: { path: path.join(MODEL_DIR, 'efficientnet_b0.onnx') },
  resnet: { path: path.join(MODEL_DIR, 'resnet50.onnx') },
  vit: { path: path.join(MODEL_DIR, 'vit_b16.onnx') },
};

export async function loadModels() {
  console.log("Loading ONNX models...");
  for (const modelName in MODEL_CONFIG) {
    try {
      const modelPath = MODEL_CONFIG[modelName].path;
      // Check if model file exists (optional, but good for debugging)
      // await fs.promises.access(modelPath, fs.constants.F_OK); 
      models[modelName] = await ort.InferenceSession.create(modelPath);
      console.log(`Model ${modelName} loaded successfully from ${modelPath}`);
    } catch (error) {
      console.error(`Failed to load model ${modelName} from ${MODEL_CONFIG[modelName].path}:`, error);
      // Fallback to a dummy session or handle error appropriately
      // For now, we'll just log and continue, meaning models[modelName] might be undefined
    }
  }
  console.log("All specified ONNX models attempted to load.");
}

export function getModel(name: string): ort.InferenceSession | undefined {
  return models[name];
}

// Call loadModels on startup (if this module is imported by a Node.js server)
// loadModels(); // This would be called by your server's entry point