import { analyseDocument } from '@/server/api/analyse';
import { analyseForgery } from '@/server/api/ml'; // Assuming this is the ML API endpoint
import { Buffer } from 'buffer';

// --- Dummy Data for Tests ---
// A tiny 1x1 transparent PNG image buffer
const dummyPngBuffer = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

// Placeholder for a dummy PDF buffer. For actual PDF analysis, this would need to be a real PDF.
const dummyPdfBuffer = Buffer.from("%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 0>>endobj xref\n0 3\n0000000000 65535 f\n0000000009 00000 n\n0000000054 00000 n\ntrailer<</Size 3/Root 1 0 R>>startxref\n106\n%%EOF", "utf8");


describe('Node.js API Endpoints (src/server/)', () => {

  // Mock the Request and File objects for direct function calls
  const createMockRequest = (fileBuffer: Buffer, filename: string, fileType: string): Request => {
    const file = new File([fileBuffer], filename, { type: fileType });
    const formData = new FormData();
    formData.append('file', file);

    // Simulate a Request object with formData
    return {
      method: 'POST',
      formData: async () => formData,
      headers: new Headers({ 'Content-Type': 'multipart/form-data' }),
      // Add other necessary Request properties if analyseDocument uses them
    } as Request;
  };

  // --- Test POST /api/analyze (Node.js) ---
  it('POST /api/analyze should return 200 and valid JSON for image upload', async () => {
    const mockRequest = createMockRequest(dummyPngBuffer, 'test-image.png', 'image/png');
    const response = await analyseDocument(mockRequest);
    const jsonResponse = await response.json();

    expect(response.status).toBe(200);
    expect(jsonResponse).toHaveProperty('id');
    expect(jsonResponse).toHaveProperty('filename', 'test-image.png');
    expect(jsonResponse).toHaveProperty('fusion');
    expect(jsonResponse.fusion).toHaveProperty('forgery_score');
    expect(jsonResponse.fusion).toHaveProperty('risk_level');
    expect(jsonResponse).toHaveProperty('heatmaps');
    expect(jsonResponse.heatmaps).toHaveProperty('ela');
    expect(jsonResponse.heatmaps).toHaveProperty('noiseprint');
    expect(jsonResponse.heatmaps).toHaveProperty('copymove');
    expect(jsonResponse.heatmaps).toHaveProperty('mlForgery');
  });

  it('POST /api/analyze should return 400 for no file uploaded', async () => {
    const mockRequest = {
      method: 'POST',
      formData: async () => new FormData(), // Empty form data
      headers: new Headers({ 'Content-Type': 'multipart/form-data' }),
    } as Request;

    const response = await analyseDocument(mockRequest);
    const jsonResponse = await response.json();

    expect(response.status).toBe(400);
    expect(jsonResponse).toHaveProperty('error', 'No file uploaded or invalid file entry.');
  });

  it('POST /api/analyze should return 400 for empty file', async () => {
    const mockRequest = createMockRequest(Buffer.from(''), 'empty.png', 'image/png');
    const response = await analyseDocument(mockRequest);
    const jsonResponse = await response.json();

    expect(response.status).toBe(400);
    expect(jsonResponse).toHaveProperty('error', 'Uploaded file is empty.');
  });

  // --- Test POST /api/ml/forgery (Node.js) ---
  // Note: analyseForgery is an internal function in src/server/api/ml.ts.
  // If it were exposed as a top-level API endpoint, it would need a similar wrapper.
  // For this test, we'll call the internal function directly as requested.
  it('POST /api/ml/forgery (internal call) should return valid ML analysis results', async () => {
    const result = await analyseForgery(dummyPngBuffer);

    expect(result).toHaveProperty('efficientnet');
    expect(result.efficientnet).toHaveProperty('score');
    expect(typeof result.efficientnet.score).toBe('number');
    expect(result.efficientnet).toHaveProperty('isForgery');
    expect(typeof result.efficientnet.isForgery).toBe('boolean');

    expect(result).toHaveProperty('resnet');
    expect(result).toHaveProperty('vit');
    expect(result).toHaveProperty('heatmap');
    expect(typeof result.heatmap).toBe('string');
    expect(result.heatmap).toMatch(/^data:image\/png;base64,/);
  });

  // --- Python Backend Endpoints (Cannot be tested with Jest/TypeScript) ---
  it.skip('POST /api/signature/analyze (Python) - Requires Python testing framework', () => {
    // This endpoint is part of the Python FastAPI backend.
    // It cannot be tested directly using Jest/TypeScript.
    // You would typically use a Python testing framework like pytest for this.
    console.warn('Skipping POST /api/signature/analyze test: This is a Python backend endpoint.');
  });

  it.skip('POST /api/embedded/scan (Python) - Requires Python testing framework', () => {
    // This endpoint is part of the Python FastAPI backend.
    // It cannot be tested directly using Jest/TypeScript.
    console.warn('Skipping POST /api/embedded/scan test: This is a Python backend endpoint.');
  });

  it.skip('GET /api/verify/:id (Python) - Requires Python testing framework', () => {
    // This endpoint is part of the Python FastAPI backend.
    // It cannot be tested directly using Jest/TypeScript.
    console.warn('Skipping GET /api/verify/:id test: This is a Python backend endpoint.');
  });

  it.skip('GET /api/health (Node.js) - Not explicitly exposed in src/server/api/analyse.ts', () => {
    // The prompt requested a /api/health endpoint test.
    // However, the provided src/server/api/analyse.ts does not expose a dedicated health endpoint.
    // If such an endpoint were added (e.g., in a main Express server file), it could be tested here.
    console.warn('Skipping GET /api/health test: No explicit health endpoint found in Node.js server files.');
  });
});