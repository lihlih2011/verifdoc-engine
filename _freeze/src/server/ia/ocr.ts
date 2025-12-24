import { createWorker } from 'tesseract.js';
import fs from 'fs/promises';

interface OCRResult {
  success: boolean;
  data: {
    rawText: string;
    dates: string[];
    numbers: string[];
    names: string[];
    anomalies: string[];
  };
  score: number;
}

export async function runOCR(filePath: string): Promise<OCRResult> {
  const worker = await createWorker('eng+fra');
  let score = 100;
  const anomalies: string[] = [];
  const detectedDates: string[] = [];
  const detectedNumbers: string[] = [];
  const detectedNames: string[] = [];

  try {
    // 1. Run basic OCR on the document
    const { data: { text, words } } = await worker.recognize(filePath, {
      lang: 'eng+fra',
      // Tesseract.js doesn't directly support 'single column' mode via options in createWorker,
      // but it's often the default for document-like images.
      // For more control, page segmentation mode (psm) can be set, e.g., psm: 3 for default.
    });

    // 2. Clean and normalize extracted text
    const rawText = text.replace(/\s+/g, ' ').trim();
    const lowercasedText = rawText.toLowerCase();

    // 3. Split text into sections (simple regex-based extraction)
    // Dates: DD/MM/YYYY, MM-DD-YYYY, YYYY-MM-DD, DD Mon YYYY, etc.
    const dateRegex = /\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b/gi;
    let match;
    while ((match = dateRegex.exec(rawText)) !== null) {
      detectedDates.push(match[0]);
    }

    // Numbers/Codes: sequences of digits, possibly with spaces or hyphens
    const numberRegex = /\b\d[\d\s-]*\d\b/g;
    while ((match = numberRegex.exec(rawText)) !== null) {
      detectedNumbers.push(match[0]);
    }

    // Names: simple heuristic for capitalized words followed by other capitalized words
    const nameRegex = /\b[A-Z][a-z]+(?: [A-Z][a-z]+){1,}\b/g; // e.g., "John Doe"
    while ((match = nameRegex.exec(rawText)) !== null) {
      detectedNames.push(match[0]);
    }

    // 4. Apply simple forensic logic
    // Detect multiple formats of dates
    if (detectedDates.length > 1) {
      const formats = new Set<string>();
      detectedDates.forEach(d => {
        if (d.match(/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/)) formats.add('DD/MM/YYYY');
        else if (d.match(/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/)) formats.add('YYYY-MM-DD');
        else if (d.match(/^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}$/i)) formats.add('Month DD, YYYY');
      });
      if (formats.size > 1) {
        anomalies.push(`Multiple date formats detected: ${Array.from(formats).join(', ')}`);
        score -= 10;
      }
    }

    // Detect segments with abnormal character confidence
    const lowConfidenceThreshold = 70; // Tesseract confidence is 0-100
    const lowConfidenceWords = words.filter(word => word.confidence < lowConfidenceThreshold);
    if (lowConfidenceWords.length > 0) {
      anomalies.push(`Detected ${lowConfidenceWords.length} words with low OCR confidence (below ${lowConfidenceThreshold}%).`);
      score -= (lowConfidenceWords.length * 2); // More words, more deduction
    }

    // Detect repeated names with different spellings (simple check)
    const uniqueNames = new Set(detectedNames.map(name => name.toLowerCase()));
    if (detectedNames.length > uniqueNames.size) {
      anomalies.push("Potential inconsistencies in repeated names/entities detected.");
      score -= 10;
    }

    // 6. Compute a logic score (0–100)
    score = Math.max(0, score); // Ensure score doesn't go below 0

    return {
      success: true,
      data: {
        rawText,
        dates: detectedDates,
        numbers: detectedNumbers,
        names: detectedNames,
        anomalies,
      },
      score,
    };
  } catch (error: any) {
    console.error("OCR analysis failed:", error);
    return {
      success: false,
      data: {
        rawText: "",
        dates: [],
        numbers: [],
        names: [],
        anomalies: [`OCR failed: ${error.message}`],
      },
      score: 0,
    };
  } finally {
    await worker.terminate();
  }
}