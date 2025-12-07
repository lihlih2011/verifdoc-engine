import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface GenerateReportData {
  filename: string;
  globalScore: number;
  summary: string;
  indicators: string[];
  heatmaps: {
    ela?: string;
    noiseprint?: string;
    copymove?: string;
  };
  ocr?: {
    rawText?: string;
    anomalies?: string[];
    dates?: string[];
    numbers?: string[];
  };
  uploadedAt: string;
}

// Helper for file size formatting
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export async function generateVerifDocReport(data: GenerateReportData) {
  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    let y = height - 50;
    const margin = 50;
    const sectionSpacing = 25;
    const lineHeight = 12;

    const drawText = (text: string, x: number, yPos: number, size: number, color = rgb(0, 0, 0), fontToUse = font) => {
      page.drawText(text, { x, y: yPos, font: fontToUse, size, color });
    };

    const addSectionTitle = (title: string) => {
      y -= sectionSpacing;
      if (y < margin + 20) {
        page = pdfDoc.addPage();
        y = height - margin;
      }
      drawText(title, margin, y, 16, rgb(0.1, 0.2, 0.4), fontBold);
      y -= lineHeight * 2;
    };

    // 1. Header
    drawText('VerifDoc™', margin, y, 24, rgb(0.23, 0.51, 0.96), fontBold); // Primary blue
    y -= 30;
    drawText('Rapport Forensic Documentaire', margin, y, 20, rgb(0.1, 0.2, 0.4), fontBold);
    y -= 20;
    drawText('Analyse IA & Forensic avancée', margin, y, 14, rgb(0.3, 0.3, 0.3));
    y -= 20;
    drawText(`Date du rapport: ${new Date().toLocaleDateString('fr-FR')}`, margin, y, 10, rgb(0.5, 0.5, 0.5));
    y -= sectionSpacing * 2;

    // 2. Document Information
    addSectionTitle('Informations sur le Document');
    drawText(`Nom du fichier: ${data.filename}`, margin, y, 12);
    y -= lineHeight * 1.5;
    // Assuming file size is not directly in data, but can be added if needed.
    // For now, using a placeholder or omitting if not available.
    // If data.size is available: drawText(`Taille: ${formatBytes(data.size)}`, margin, y, 12);
    drawText(`Type: ${data.ocr?.rawText ? 'PDF/Image' : 'Inconnu'}`, margin, y, 12); // Placeholder for type
    y -= lineHeight * 1.5;
    drawText(`Horodatage d'upload: ${new Date(data.uploadedAt).toLocaleString('fr-FR')}`, margin, y, 12);
    y -= sectionSpacing;

    // 3. Global Score
    addSectionTitle('Score Global VerifDoc™');
    drawText(`Score VerifDoc™ : ${data.globalScore}%`, margin, y, 14, rgb(0.23, 0.51, 0.96), fontBold);
    y -= lineHeight * 2;

    const scoreBarWidth = width - 2 * margin;
    const scoreBarHeight = 10;
    page.drawRectangle({
      x: margin,
      y: y,
      width: scoreBarWidth,
      height: scoreBarHeight,
      color: rgb(0.9, 0.9, 0.9), // Light gray background
      borderColor: rgb(0.7, 0.7, 0.7),
      borderWidth: 1,
    });
    page.drawRectangle({
      x: margin,
      y: y,
      width: (data.globalScore / 100) * scoreBarWidth,
      height: scoreBarHeight,
      color: rgb(0.23, 0.51, 0.96), // Primary blue fill
    });
    y -= scoreBarHeight + sectionSpacing;

    // 4. Indicators
    addSectionTitle('Indicateurs Clés');
    if (data.indicators && data.indicators.length > 0) {
      data.indicators.forEach(indicator => {
        if (y < margin + lineHeight) {
          page = pdfDoc.addPage();
          y = height - margin;
        }
        drawText(`• ${indicator}`, margin + 10, y, 12);
        y -= lineHeight * 1.5;
      });
    } else {
      drawText('Aucun indicateur spécifique détecté.', margin, y, 12, rgb(0.5, 0.5, 0.5));
      y -= lineHeight * 1.5;
    }
    y -= sectionSpacing;

    // 5. AI Summary
    addSectionTitle('Résumé de l’Analyse IA');
    if (y < margin + lineHeight * 3) {
      page = pdfDoc.addPage();
      y = height - margin;
    }
    const summaryText = data.summary || 'Aucun résumé disponible.';
    const summaryLines = page.drawText(summaryText, {
      x: margin,
      y: y,
      font: font,
      size: 12,
      color: rgb(0.2, 0.2, 0.2),
      maxWidth: width - 2 * margin,
      lineHeight: lineHeight * 1.5,
    });
    y -= summaryLines.height + lineHeight;
    y -= sectionSpacing;

    // 6. Heatmaps
    addSectionTitle('Heatmaps Forensic');
    const heatmapTitles: { [key: string]: string } = {
      ela: 'ELA Heatmap',
      noiseprint: 'NoisePrint Heatmap',
      copymove: 'Copy-Move Heatmap',
    };

    for (const key of ['ela', 'noiseprint', 'copymove']) {
      const heatmapBase64 = data.heatmaps[key as keyof typeof data.heatmaps];
      if (heatmapBase64) {
        if (y < margin + 150) { // Check if enough space for image + title
          page = pdfDoc.addPage();
          y = height - margin;
        }
        drawText(heatmapTitles[key], margin, y, 12, rgb(0.1, 0.2, 0.4), fontBold);
        y -= lineHeight * 1.5;

        const imageBytes = Buffer.from(heatmapBase64.split(',')[1], 'base64');
        const image = await pdfDoc.embedPng(imageBytes);
        const imageDims = image.scaleToFit(width - 2 * margin, 150); // Max width, max height

        page.drawImage(image, {
          x: margin,
          y: y - imageDims.height,
          width: imageDims.width,
          height: imageDims.height,
        });
        y -= imageDims.height + sectionSpacing;
      }
    }
    y -= sectionSpacing;

    // 7. OCR Information
    addSectionTitle('Informations OCR');
    if (data.ocr) {
      if (y < margin + lineHeight * 5) {
        page = pdfDoc.addPage();
        y = height - margin;
      }
      drawText('Texte extrait:', margin, y, 12, rgb(0.1, 0.2, 0.4), fontBold);
      y -= lineHeight * 1.5;
      const ocrText = data.ocr.rawText ? data.ocr.rawText.substring(0, 500) + (data.ocr.rawText.length > 500 ? '...' : '') : 'Aucun texte extrait.';
      const ocrTextLines = page.drawText(ocrText, {
        x: margin,
        y: y,
        font: font,
        size: 10,
        color: rgb(0.3, 0.3, 0.3),
        maxWidth: width - 2 * margin,
        lineHeight: lineHeight * 1.2,
      });
      y -= ocrTextLines.height + lineHeight;

      if (data.ocr.dates && data.ocr.dates.length > 0) {
        if (y < margin + lineHeight * 2) {
          page = pdfDoc.addPage();
          y = height - margin;
        }
        drawText('Dates détectées:', margin, y, 12, rgb(0.1, 0.2, 0.4), fontBold);
        y -= lineHeight * 1.5;
        drawText(data.ocr.dates.join(', '), margin, y, 10, rgb(0.3, 0.3, 0.3));
        y -= lineHeight * 1.5;
      }

      if (data.ocr.numbers && data.ocr.numbers.length > 0) {
        if (y < margin + lineHeight * 2) {
          page = pdfDoc.addPage();
          y = height - margin;
        }
        drawText('Numéros détectés:', margin, y, 12, rgb(0.1, 0.2, 0.4), fontBold);
        y -= lineHeight * 1.5;
        drawText(data.ocr.numbers.join(', '), margin, y, 10, rgb(0.3, 0.3, 0.3));
        y -= lineHeight * 1.5;
      }

      if (data.ocr.anomalies && data.ocr.anomalies.length > 0) {
        if (y < margin + lineHeight * 2) {
          page = pdfDoc.addPage();
          y = height - margin;
        }
        drawText('Anomalies OCR:', margin, y, 12, rgb(0.8, 0.2, 0.2), fontBold);
        y -= lineHeight * 1.5;
        data.ocr.anomalies.forEach(anomaly => {
          if (y < margin + lineHeight) {
            page = pdfDoc.addPage();
            y = height - margin;
          }
          drawText(`• ${anomaly}`, margin + 10, y, 10, rgb(0.8, 0.2, 0.2));
          y -= lineHeight * 1.2;
        });
      }
    } else {
      drawText('Aucune information OCR disponible.', margin, y, 12, rgb(0.5, 0.5, 0.5));
      y -= lineHeight * 1.5;
    }
    y -= sectionSpacing;

    // 8. Footer
    if (y < margin + 50) { // Ensure footer has space
      page = pdfDoc.addPage();
      y = height - margin;
    }
    y = margin + 40; // Position footer near bottom
    page.drawLine({
      start: { x: margin, y: y + 10 },
      end: { x: width - margin, y: y + 10 },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    drawText('Rapport généré automatiquement par VerifDoc™', margin, y, 10, rgb(0.5, 0.5, 0.5));
    y -= lineHeight * 1.5;
    drawText('Cachet d’intégrité numérique', margin, y, 10, rgb(0.5, 0.5, 0.5));
    page.drawRectangle({
      x: width - margin - 100,
      y: y - 5,
      width: 100,
      height: 30,
      borderColor: rgb(0.23, 0.51, 0.96),
      borderWidth: 1,
      color: rgb(0.95, 0.97, 0.99),
    });
    drawText('Sceau VerifDoc', width - margin - 90, y + 10, 8, rgb(0.23, 0.51, 0.96), fontBold);


    const pdfBytes = await pdfDoc.save();
    return { success: true, pdfBase64: Buffer.from(pdfBytes).toString('base64') };

  } catch (error: any) {
    console.error("PDF generation failed:", error);
    return { success: false, error: error.message || "PDF generation failed" };
  }
}