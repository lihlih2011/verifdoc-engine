import * as ort from 'onnxruntime-node';
import { getModel } from './modelLoader';
import { preprocessImage } from './preprocessor';

interface InferenceResult {
  score: number; // Probability of being a forgery (0-1)
  isForgery: boolean;
}

function softmax(logits: Float32Array): Float32Array {
  const maxVal = Math.max(...logits);
  const exps = logits.map(x => Math.exp(x - maxVal));
  const sumExps = exps.reduce((a, b) => a + b);
  return new Float32Array(exps.map(x => x / sumExps));
}

export async function runInference(modelName: string, imageBuffer: Buffer): Promise<InferenceResult> {
  const session = getModel(modelName);
  if (!session) {
    console.warn(`Model ${modelName} not loaded. Returning dummy result.`);
    return { score: Math.random(), isForgery: Math.random() > 0.5 }; // Dummy result
  }

  const preprocessedImage = await preprocessImage(imageBuffer);

  // Assuming the model has a single input named 'input'
  const inputName = session.inputNames[0];
  const inputTensor = new ort.Tensor('float32', preprocessedImage, [1, 3, IMAGE_SIZE, IMAGE_SIZE]);

  const feeds: ort.InferenceSession.OnnxValueMap = { [inputName]: inputTensor };

  const results = await session.run(feeds);

  // Assuming the model outputs a single tensor, typically logits for classification
  const outputName = session.outputNames[0];
  const outputTensor = results[outputName].data as Float32Array;

  // Apply softmax to get probabilities
  const probabilities = softmax(outputTensor);

  // Assuming a binary classification: [prob_authentic, prob_forgery]
  // Or if it's a single output, it might be prob_forgery directly.
  // For simplicity, let's assume the second element is the probability of forgery.
  const forgeryProbability = probabilities.length > 1 ? probabilities[1] : probabilities[0];
  const FORGERY_THRESHOLD = 0.5; // Customizable threshold

  return {
    score: parseFloat(forgeryProbability.toFixed(4)),
    isForgery: forgeryProbability > FORGERY_THRESHOLD,
  };
}