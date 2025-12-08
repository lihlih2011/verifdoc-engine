import { runInference } from '../services/ml/inference';
import { generateGradCAMHeatmap } from '../services/ml/gradcam';
import { loadModels } from '../services/ml/modelLoader'; // Import loadModels

// Load models once when this module is imported
loadModels();

export async function analyseForgery(imageBuffer: Buffer) {
  try {
    const efficientnetResult = await runInference('efficientnet', imageBuffer);
    const resnetResult = await runInference('resnet', imageBuffer);
    const vitResult = await runInference('vit', imageBuffer);
    const heatmap = await generateGradCAMHeatmap(imageBuffer);

    return {
      efficientnet: efficientnetResult,
      resnet: resnetResult,
      vit: vitResult,
      heatmap: heatmap,
    };
  } catch (error: any) {
    console.error("ML Forgery analysis failed:", error);
    throw new Error(`ML Forgery analysis failed: ${error.message}`);
  }
}