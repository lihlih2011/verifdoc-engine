import { generateVerifDocReport } from '@/server/pdf/generateReport';
import { Buffer } from 'buffer';
import fs from 'fs/promises';
import path from 'path';

// --- Dummy Data for Tests ---
const mockReportData = {
  id: 123,
  filename: "test_document.pdf",
  forensic_score: 55,
  risk_level: "Modéré",
  created_at: new Date().toISOString(),
  full_result: {
    forgery_score: 55,
    risk_level: "Modéré",
    module_scores: {
      ocr: 0.6,
      frdetr: 0.5,
      diffusion: 0.7,
      noiseprint: 0.4,
      ela: 0.55,
      copymove: 0.3,
      signature: 0.8, // Invalid signature
      embedded_objects: 0.2, // Some suspicious objects
    },
    explanation: {
      ocr: "Some OCR anomalies detected.",
      visual: "Minor visual alterations.",
      inpainting: "Possible AI generated content.",
      ai_noise: "Inconsistent noise patterns.",
      compression: "Compression artifacts found.",
      duplication: "No significant copy-move detected.",
      signature: "Digital signature present but invalid.",
      embedded_objects: "Some suspicious embedded objects detected.",
      summary: "Document shows moderate signs of alteration.",
    },
    mlAnalysis: {
      efficientnet: { score: 0.6, isForgery: true },
      resnet: { score: 0.55, isForgery: true },
      vit: { score: 0.4, isForgery: false },
      heatmap: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==", // Tiny red heatmap
    },
    raw_output: "mock-raw-output",
    record_id: 123,
  },
  heatmaps: {
    ela: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==", // Tiny red heatmap
    gan: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==", // Tiny red heatmap
    copymove: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==", // Tiny red heatmap
    diffusion: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==", // Tiny red heatmap
  },
  integrity_hash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
  signature_info: {
    hasSignature: true,
    signatureInfo: {
      subject: "CN=Test User, O=Test Org",
      issuer: "CN=Test CA",
      serialNumber: "1234567890ABCDEF",
      validity: {
        notBefore: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
        notAfter: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago (expired)
      },
      isValid: false,
      reason: "Expired",
      timestamp: new Date().toISOString(),
      tsaIssuer: "TSA Test Authority",
      tsaValidity: "Valid",
      ocspStatus: "Valid (simulated)",
    },
  },
  embedded_objects_info: {
    embeddedObjects: [
      { objectId: "1 0", type: "Stream", subtype: "/Image", suspicious: false, reason: null, preview: "...", entropy: 7.0 },
      { objectId: "2 0", type: "Dictionary", suspicious: true, reason: "Contains JavaScript action", preview: "...", entropy: null },
      { objectId: "3 0", type: "Stream", compression: "/FlateDecode", suspicious: true, reason: "High entropy stream (7.80)", preview: "...", entropy: 7.80 },
    ],
  },
};

describe('PDF Report Generation (src/server/pdf/generateReport.ts)', () => {
  const reportsDir = path.join(__dirname, '../../backend/reports'); // Adjust path to match backend's report directory

  beforeAll(async () => {
    // Ensure the reports directory exists for the test to write to
    await fs.mkdir(reportsDir, { recursive: true });
  });

  afterAll(async () => {
    // Clean up generated report files after tests
    const files = await fs.readdir(reportsDir);
    for (const file of files) {
      if (file.startsWith('rapport_verifdoc_')) {
        await fs.unlink(path.join(reportsDir, file));
      }
    }
  });

  it('generateVerifDocReport should produce a PDF buffer and save a file', async () => {
    const result = await generateVerifDocReport(mockReportData);

    expect(result.success).toBe(true);
    expect(result).toHaveProperty('pdfBase64');
    expect(typeof result.pdfBase64).toBe('string');
    expect(result.pdfBase64.length).toBeGreaterThan(0);
    expect(result).toHaveProperty('report_filepath');
    expect(typeof result.report_filepath).toBe('string');

    // Verify the file was actually created
    const filePath = path.join(__dirname, '../../', result.report_filepath!); // Adjust path for fs.access
    await expect(fs.access(filePath, fs.constants.F_OK)).resolves.toBeUndefined();
  });

  it('generateVerifDocReport should not throw an exception on valid input', async () => {
    await expect(generateVerifDocReport(mockReportData)).resolves.toHaveProperty('success', true);
  });

  it('generateVerifDocReport should handle missing optional data gracefully', async () => {
    const minimalData = {
      ...mockReportData,
      mlAnalysis: undefined,
      heatmaps: undefined,
      signature_info: undefined,
      embedded_objects_info: undefined,
      integrity_hash: undefined,
    };
    const result = await generateVerifDocReport(minimalData);
    expect(result.success).toBe(true);
    expect(result.pdfBase64.length).toBeGreaterThan(0);
  });
});