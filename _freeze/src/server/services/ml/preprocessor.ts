import sharp from 'sharp';

const IMAGE_SIZE = 224; // Standard input size for EfficientNet, ResNet, ViT
const MEAN = [0.485, 0.456, 0.406]; // ImageNet means
const STD = [0.229, 0.224, 0.225]; // ImageNet standard deviations

export async function preprocessImage(imageBuffer: Buffer): Promise<Float32Array> {
  const { data, info } = await sharp(imageBuffer)
    .resize(IMAGE_SIZE, IMAGE_SIZE)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const float32Data = new Float32Array(IMAGE_SIZE * IMAGE_SIZE * 3);
  let pixelIndex = 0;

  for (let i = 0; i < data.length; i += info.channels) {
    // Normalize and apply ImageNet mean/std
    float32Data[pixelIndex++] = (data[i] / 255 - MEAN[0]) / STD[0];     // Red
    float32Data[pixelIndex++] = (data[i + 1] / 255 - MEAN[1]) / STD[1]; // Green
    float32Data[pixelIndex++] = (data[i + 2] / 255 - MEAN[2]) / STD[2]; // Blue
  }

  // ONNX models typically expect NCHW (Batch, Channels, Height, Width) layout
  // Convert HWC (Height, Width, Channels) to NCHW
  const inputTensor = new Float32Array(1 * 3 * IMAGE_SIZE * IMAGE_SIZE);
  let offset = 0;
  for (let c = 0; c < 3; c++) {
    for (let h = 0; h < IMAGE_SIZE; h++) {
      for (let w = 0; w < IMAGE_SIZE; w++) {
        inputTensor[offset++] = float32Data[h * IMAGE_SIZE * 3 + w * 3 + c];
      }
    }
  }

  return inputTensor;
}