import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';
import fs from 'fs/promises';
import sharp from 'sharp';

// Define the expected input structure based on the prompt and backend tasks
interface GenerateReportData {
  id: number;
  filename: string;
  forensic_score: number; // Overall score (0-100)
  risk_level: string;
  created_at: string; // ISO string
  full_result: {
    forgery_score: number; // Same as forensic_score
    risk_level: string;
    module_scores: {
      ocr: number;
      frdetr: number;
      diffusion: number;
      noiseprint: number;
      ela: number;
      copymove: number;
      signature: number;
      embedded_objects: number;
    };
    explanation: {
      ocr: string;
      visual: string;
      inpainting: string;
      ai_noise: string;
      compression: string;
      duplication: string;
      signature: string;
      embedded_objects: string;
      summary: string;
    };
    mlAnalysis?: { // NEW: ML analysis results (assuming it's saved in full_result)
      efficientnet: { score: number, isForgery: boolean };
      resnet: { score: number, isForgery: boolean };
      vit: { score: number, isForgery: boolean };
      heatmap: string; // Base64 heatmap for ML
    };
    raw_output: string;
    record_id: number;
  };
  heatmaps?: {
    ela?: string;
    gan?: string; // This is noiseprint heatmap in backend
    copymove?: string;
    diffusion?: string;
    mlForgery?: string; // NEW: ML forgery heatmap
  };
  integrity_hash?: string; // Full SHA-256 hash of the report itself
  report_file_path?: string;
  signature_info?: {
    hasSignature: boolean;
    signatureInfo?: {
      subject: string;
      issuer: string;
      serialNumber: string;
      validity: {
        notBefore: string;
        notAfter: string;
      };
      isValid: boolean;
      reason: string;
      timestamp: string;
      tsaIssuer: string;
      tsaValidity: string;
      ocspStatus: string;
    };
  };
  embedded_objects_info?: {
    embeddedObjects: Array<{
      objectId: string;
      type: string;
      subtype?: string;
      length?: number;
      compression?: string;
      suspicious: boolean;
      reason?: string;
      preview?: string;
      entropy?: number;
    }>;
  };
}

export async function generateVerifDocReport(data: GenerateReportData) {
  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const { width, height } = PageSizes.A4;
    const margin = 50;
    const sectionSpacing = 25;
    const lineHeight = 12;
    let currentPage = pdfDoc.addPage();
    let y = height - margin;

    // Load the SVG seal
    const sealSvgPath = "public/verifdoc-seal.svg";
    const sealSvg = await fs.readFile(sealSvgPath, "utf8");
    const sealPngBuffer = await sharp(Buffer.from(sealSvg)).png().toBuffer();
    const sealImage = await pdfDoc.embedPng(sealPngBuffer);
    const sealWidth = 80;
    const sealHeight = sealImage.height * (sealWidth / sealImage.width);

    const addPage = () => {
      currentPage = pdfDoc.addPage();
      y = height - margin;
    };

    const drawText = (text: string, x: number, yPos: number, size: number, color = rgb(0, 0, 0), fontToUse = font) => {
      currentPage.drawText(text, { x, y: yPos, font: fontToUse, size, color });
    };

    const addSectionTitle = (title: string, level: 1 | 2 = 1) => {
      y -= sectionSpacing;
      if (y < margin + (level === 1 ? 30 : 20)) { // Ensure enough space for title
        addPage();
      }
      drawText(title, margin, y, level === 1 ? 18 : 14, rgb(0.1, 0.2, 0.4), fontBold);
      y -= lineHeight * (level === 1 ? 2 : 1.5);
    };

    const checkPageBreak = (requiredSpace: number) => {
      if (y < margin + requiredSpace) {
        addPage();
      }
    };

    // --- Footer Function ---
    const drawFooter = async (page: any, pageNumber: number, totalPages: number) => {
      const footerY = margin / 2;
      const sealX = width - margin - sealWidth / 2; // Centered on right side
      const sealY = footerY + 5;

      // Horizontal rule
      page.drawLine({
        start: { x: margin, y: footerY + 20 },
        end: { x: width - margin, y: footerY + 20 },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
      });

      // VerifDoc Seal
      page.drawImage(sealImage, {
        x: margin,
        y: footerY,
        width: sealWidth / 2,
        height: sealHeight / 2,
      });

      // Footer text
      const footerText = "VerifDoc™ – Infrastructure d’analyse documentaire certifiée";
      const pageNumText = `Page ${pageNumber} / ${totalPages}`;
      
      page.drawText(footerText, {
        x: margin + sealWidth / 2 + 10, // Right of seal
        y: footerY + (sealHeight / 4) - (lineHeight / 2),
        font: font,
        size: 8,
        color: rgb(0.5, 0.5, 0.5),
      });

      page.drawText(pageNumText, {
        x: width - margin - font.widthOfTextAtSize(pageNumText, 8),
        y: footerY + (sealHeight / 4) - (lineHeight / 2),
        font: font,
        size: 8,
        color: rgb(0.5, 0.5, 0.5),
      });
    };

    // --- 1. Cover Page ---
    currentPage.drawRectangle({
      x: 0, y: 0, width, height,
      color: rgb(0.95, 0.97, 0.99), // Light blue background
    });

    const coverSealWidth = 150;
    const coverSealHeight = sealImage.height * (coverSealWidth / sealImage.width);
    currentPage.drawImage(sealImage, {
      x: (width - coverSealWidth) / 2,
      y: height - margin - coverSealHeight - 50,
      width: coverSealWidth,
      height: coverSealHeight,
    });

    y = height - margin - coverSealHeight - 100;
    drawText('VerifDoc™', (width - fontBold.widthOfTextAtSize('VerifDoc™', 48)) / 2, y, 48, rgb(0.23, 0.51, 0.96), fontBold);
    y -= 60;
    drawText('Rapport d’analyse documentaire', (width - fontBold.widthOfTextAtSize('Rapport d’analyse documentaire', 30)) / 2, y, 30, rgb(0.1, 0.2, 0.4), fontBold);
    y -= 30;
    drawText('Analyse hybride Forensic + Intelligence Artificielle', (width - font.widthOfTextAtSize('Analyse hybride Forensic + Intelligence Artificielle', 18)) / 2, y, 18, rgb(0.3, 0.3, 0.3));
    y -= 80;
    drawText(`ID du Rapport: ${data.id}`, (width - font.widthOfTextAtSize(`ID du Rapport: ${data.id}`, 12)) / 2, y, 12, rgb(0.5, 0.5, 0.5));
    y -= 20;
    drawText(`Date: ${new Date(data.created_at).toLocaleDateString('fr-FR')}`, (width - font.widthOfTextAtSize(`Date: ${new Date(data.created_at).toLocaleDateString('fr-FR')}`, 12)) / 2, y, 12, rgb(0.5, 0.5, 0.5));
    y -= 40;
    const shortHash = data.integrity_hash ? `${data.integrity_hash.substring(0, 16)}...${data.integrity_hash.substring(data.integrity_hash.length - 16)}` : 'N/A';
    drawText(`Sceau numérique SHA-256: ${shortHash}`, (width - font.widthOfTextAtSize(`Sceau numérique SHA-256: ${shortHash}`, 10)) / 2, y, 10, rgb(0.5, 0.5, 0.5), fontItalic);

    addPage(); // Start content on a new page

    // --- 2. Executive Summary ---
    addSectionTitle('1. Résumé Exécutif');
    checkPageBreak(lineHeight * 5);
    drawText(`Nom du fichier: ${data.filename}`, margin, y, 12); y -= lineHeight * 1.5;
    drawText(`Date d'analyse: ${new Date(data.created_at).toLocaleString('fr-FR')}`, margin, y, 12); y -= lineHeight * 1.5;
    drawText(`Verdict global: ${data.full_result.explanation.summary}`, margin, y, 12); y -= lineHeight * 1.5;
    drawText(`Niveau de suspicion: ${data.forensic_score}% (${data.risk_level})`, margin, y, 12); y -= lineHeight * 1.5;

    checkPageBreak(lineHeight * 4);
    drawText('Modèles IA utilisés:', margin, y, 12, rgb(0.1, 0.2, 0.4), fontBold); y -= lineHeight * 1.5;
    drawText('  • EfficientNet-B0, ResNet50, ViT-B16 (pour l\'analyse ML)', margin, y, 10); y -= lineHeight;
    drawText('  • Donut/Nougat (pour l\'OCR)', margin, y, 10); y -= lineHeight;
    drawText('  • FR-DETR (pour la localisation visuelle)', margin, y, 10); y -= lineHeight;
    drawText('  • Diffusion Forensics (pour les altérations génératives)', margin, y, 10); y -= lineHeight;
    drawText('  • NoisePrint++ (pour les empreintes GAN)', margin, y, 10); y -= lineHeight;
    drawText('  • ELA++ (pour les anomalies de compression)', margin, y, 10); y -= lineHeight;
    drawText('  • Copy-Move (pour les duplications internes)', margin, y, 10); y -= lineHeight * 1.5;

    checkPageBreak(lineHeight * 3);
    drawText('Validité cryptographique: ' + (data.signature_info?.hasSignature ? (data.signature_info.signatureInfo?.isValid ? 'Valide' : 'Invalide') : 'Non signée'), margin, y, 12); y -= lineHeight * 1.5;
    drawText('Intégrité du rapport: ' + (data.integrity_hash ? 'Vérifiable' : 'Non disponible'), margin, y, 12); y -= sectionSpacing;

    // --- 3. AI Analysis Section (ML Models) ---
    if (data.full_result.mlAnalysis) {
      addSectionTitle('2. Analyse par Intelligence Artificielle (ML)');
      checkPageBreak(lineHeight * 8 + 200); // Space for scores and heatmap

      const mlAnalysis = data.full_result.mlAnalysis;
      drawText('Verdict IA: ' + (mlAnalysis.efficientnet.isForgery || mlAnalysis.resnet.isForgery || mlAnalysis.vit.isForgery ? 'Suspect' : 'Authentique'), margin, y, 12, rgb(0.1, 0.2, 0.4), fontBold); y -= lineHeight * 1.5;
      drawText(`EfficientNet-B0 Score: ${(mlAnalysis.efficientnet.score * 100).toFixed(2)}% (Falsification: ${mlAnalysis.efficientnet.isForgery ? 'Oui' : 'Non'})`, margin, y, 12); y -= lineHeight * 1.5;
      drawText(`ResNet50 Score: ${(mlAnalysis.resnet.score * 100).toFixed(2)}% (Falsification: ${mlAnalysis.resnet.isForgery ? 'Oui' : 'Non'})`, margin, y, 12); y -= lineHeight * 1.5;
      drawText(`ViT-B16 Score: ${(mlAnalysis.vit.score * 100).toFixed(2)}% (Falsification: ${mlAnalysis.vit.isForgery ? 'Oui' : 'Non'})`, margin, y, 12); y -= sectionSpacing;

      if (mlAnalysis.heatmap) {
        drawText('Heatmap de Falsification ML:', margin, y, 12, rgb(0.1, 0.2, 0.4), fontBold); y -= lineHeight * 1.5;
        const imageBytes = Buffer.from(mlAnalysis.heatmap.split(',')[1], 'base64');
        const image = await pdfDoc.embedPng(imageBytes);
        const imageDims = image.scaleToFit(width - 2 * margin, 200);
        currentPage.drawImage(image, {
          x: margin,
          y: y - imageDims.height,
          width: imageDims.width,
          height: imageDims.height,
        });
        y -= imageDims.height + sectionSpacing;
      } else {
        drawText('Heatmap ML non disponible.', margin, y, 12, rgb(0.5, 0.5, 0.5)); y -= lineHeight * 1.5;
      }
    } else {
      addSectionTitle('2. Analyse par Intelligence Artificielle (ML)');
      drawText('Données d\'analyse ML non disponibles.', margin, y, 12, rgb(0.5, 0.5, 0.5)); y -= sectionSpacing;
    }

    // --- 4. Forensic Classical Section ---
    addSectionTitle('3. Analyse Forensic Classique');
    checkPageBreak(lineHeight * 10 + 150); // Space for descriptions and heatmaps

    const moduleScores = data.full_result.module_scores;
    const explanation = data.full_result.explanation;

    drawText(`ELA++ (Anomalies de Compression): ${(moduleScores.ela * 100).toFixed(1)}% - ${explanation.compression}`, margin, y, 12); y -= lineHeight * 1.5;
    if (data.heatmaps?.ela) {
      const imageBytes = Buffer.from(data.heatmaps.ela.split(',')[1], 'base64');
      const image = await pdfDoc.embedPng(imageBytes);
      const imageDims = image.scaleToFit(width - 2 * margin, 100);
      currentPage.drawImage(image, { x: margin + 20, y: y - imageDims.height, width: imageDims.width, height: imageDims.height });
      y -= imageDims.height + lineHeight;
    }
    drawText(`NoisePrint++ (Empreinte de bruit): ${(moduleScores.noiseprint * 100).toFixed(1)}% - ${explanation.ai_noise}`, margin, y, 12); y -= lineHeight * 1.5;
    if (data.heatmaps?.gan) { // 'gan' is used for noiseprint heatmap in backend
      const imageBytes = Buffer.from(data.heatmaps.gan.split(',')[1], 'base64');
      const image = await pdfDoc.embedPng(imageBytes);
      const imageDims = image.scaleToFit(width - 2 * margin, 100);
      currentPage.drawImage(image, { x: margin + 20, y: y - imageDims.height, width: imageDims.width, height: imageDims.height });
      y -= imageDims.height + lineHeight;
    }
    drawText(`Copy-Move Detection: ${(moduleScores.copymove * 100).toFixed(1)}% - ${explanation.duplication}`, margin, y, 12); y -= lineHeight * 1.5;
    if (data.heatmaps?.copymove) {
      const imageBytes = Buffer.from(data.heatmaps.copymove.split(',')[1], 'base64');
      const image = await pdfDoc.embedPng(imageBytes);
      const imageDims = image.scaleToFit(width - 2 * margin, 100);
      currentPage.drawImage(image, { x: margin + 20, y: y - imageDims.height, width: imageDims.width, height: imageDims.height });
      y -= imageDims.height + lineHeight;
    }
    drawText(`Diffusion Forensics (IA Générative): ${(moduleScores.diffusion * 100).toFixed(1)}% - ${explanation.inpainting}`, margin, y, 12); y -= lineHeight * 1.5;
    if (data.heatmaps?.diffusion) {
      const imageBytes = Buffer.from(data.heatmaps.diffusion.split(',')[1], 'base64');
      const image = await pdfDoc.embedPng(imageBytes);
      const imageDims = image.scaleToFit(width - 2 * margin, 100);
      currentPage.drawImage(image, { x: margin + 20, y: y - imageDims.height, width: imageDims.width, height: imageDims.height });
      y -= imageDims.height + lineHeight;
    }
    drawText(`FR-DETR (Localisation Visuelle): ${(moduleScores.frdetr * 100).toFixed(1)}% - ${explanation.visual}`, margin, y, 12); y -= lineHeight * 1.5;
    drawText(`OCR IA: ${(moduleScores.ocr * 100).toFixed(1)}% - ${explanation.ocr}`, margin, y, 12); y -= sectionSpacing;

    // --- 5. Cryptographic Section ---
    addSectionTitle('4. Analyse Cryptographique');
    checkPageBreak(lineHeight * 15);

    const signatureInfo = data.signature_info?.signatureInfo;
    if (data.signature_info?.hasSignature && signatureInfo) {
      drawText('Signature X.509:', margin, y, 12, rgb(0.1, 0.2, 0.4), fontBold); y -= lineHeight * 1.5;
      drawText(`  • Signataire: ${signatureInfo.subject}`, margin, y, 12); y -= lineHeight;
      drawText(`  • Émetteur: ${signatureInfo.issuer}`, margin, y, 12); y -= lineHeight;
      drawText(`  • Numéro de série: ${signatureInfo.serialNumber}`, margin, y, 12); y -= lineHeight;
      drawText(`  • Valide du: ${new Date(signatureInfo.validity.notBefore).toLocaleDateString('fr-FR')}`, margin, y, 12); y -= lineHeight;
      drawText(`  • Valide au: ${new Date(signatureInfo.validity.notAfter).toLocaleDateString('fr-FR')}`, margin, y, 12); y -= lineHeight;
      drawText(`  • Statut OCSP: ${signatureInfo.ocspStatus}`, margin, y, 12); y -= lineHeight * 1.5;

      drawText('Horodatage RFC3161:', margin, y, 12, rgb(0.1, 0.2, 0.4), fontBold); y -= lineHeight * 1.5;
      drawText(`  • Horodatage: ${signatureInfo.timestamp !== "Not detected (placeholder)" ? new Date(signatureInfo.timestamp).toLocaleString('fr-FR') : 'Non détecté'}`, margin, y, 12); y -= lineHeight;
      drawText(`  • Émetteur TSA: ${signatureInfo.tsaIssuer}`, margin, y, 12); y -= lineHeight;
      drawText(`  • Statut TSA: ${signatureInfo.tsaValidity}`, margin, y, 12); y -= lineHeight * 1.5;
    } else {
      drawText('Aucune signature numérique détectée.', margin, y, 12, rgb(0.5, 0.5, 0.5)); y -= lineHeight * 1.5;
    }

    drawText('Hash d\'intégrité du rapport (SHA-256):', margin, y, 12, rgb(0.1, 0.2, 0.4), fontBold); y -= lineHeight * 1.5;
    drawText(data.integrity_hash || 'Non disponible', margin, y, 10, rgb(0.3, 0.3, 0.3), fontItalic); y -= sectionSpacing;

    // --- 6. Structural Analysis (Embedded Objects) ---
    addSectionTitle('5. Analyse Structurelle (Objets Intégrés)');
    checkPageBreak(lineHeight * 15);

    const embeddedObjects = data.embedded_objects_info?.embeddedObjects;
    if (embeddedObjects && embeddedObjects.length > 0) {
      const suspiciousObjects = embeddedObjects.filter(obj => obj.suspicious);
      if (suspiciousObjects.length > 0) {
        drawText(`Objets suspects détectés (${suspiciousObjects.length}):`, margin, y, 12, rgb(0.8, 0.2, 0.2), fontBold); y -= lineHeight * 1.5;
        suspiciousObjects.forEach(obj => {
          checkPageBreak(lineHeight * 3);
          drawText(`  • ID: ${obj.objectId}, Type: ${obj.type}, Subtype: ${obj.subtype || 'N/A'}`, margin, y, 10); y -= lineHeight;
          drawText(`    Raison: ${obj.reason || 'Suspect'}`, margin, y, 10); y -= lineHeight;
          if (obj.entropy !== undefined) {
            drawText(`    Entropie: ${obj.entropy.toFixed(2)}`, margin, y, 10); y -= lineHeight;
          }
          if (obj.preview) {
            drawText(`    Preview: ${obj.preview.substring(0, 50)}...`, margin, y, 10); y -= lineHeight;
          }
          y -= lineHeight * 0.5;
        });
      } else {
        drawText('Aucun objet intégré suspect détecté.', margin, y, 12, rgb(0.5, 0.5, 0.5)); y -= lineHeight * 1.5;
      }
      drawText(`Total objets intégrés: ${embeddedObjects.length}`, margin, y, 12); y -= sectionSpacing;
    } else {
      drawText('Aucune information sur les objets intégrés disponible.', margin, y, 12, rgb(0.5, 0.5, 0.5)); y -= sectionSpacing;
    }

    // --- 7. Final Verdict ---
    addSectionTitle('6. Verdict Final');
    checkPageBreak(lineHeight * 8);

    let finalVerdictText = '';
    let confidenceLevel = 'Modérée'; // Default
    if (data.forensic_score < 40) {
      finalVerdictText = 'Authentique';
      confidenceLevel = 'Élevée';
    } else if (data.forensic_score >= 40 && data.forensic_score <= 70) {
      finalVerdictText = 'Suspect';
      confidenceLevel = 'Moyenne';
    } else {
      finalVerdictText = 'Falsifié';
      confidenceLevel = 'Élevée';
    }

    drawText(`Statut du document: ${finalVerdictText}`, margin, y, 14, rgb(0.1, 0.2, 0.4), fontBold); y -= lineHeight * 1.5;
    drawText(`Niveau de confiance: ${confidenceLevel}`, margin, y, 12); y -= lineHeight * 1.5;
    drawText('Notes du moteur:', margin, y, 12, rgb(0.1, 0.2, 0.4), fontBold); y -= lineHeight * 1.5;
    const notesText = data.full_result.explanation.summary || 'Aucune note spécifique.';
    const notesLines = currentPage.drawText(notesText, {
      x: margin,
      y: y,
      font: font,
      size: 12,
      color: rgb(0.2, 0.2, 0.2),
      maxWidth: width - 2 * margin,
      lineHeight: lineHeight * 1.5,
    });
    y -= notesLines.height + sectionSpacing;

    // Apply footer to all pages
    const totalPages = pdfDoc.getPages().length;
    for (let i = 0; i < pdfDoc.getPages().length; i++) {
      await drawFooter(pdfDoc.getPages()[i], i + 1, totalPages);
    }

    const pdfBytes = await pdfDoc.save();
    
    // Save the PDF to the file system
    const report_filepath = `backend/reports/rapport_verifdoc_${data.id}_${new Date().toISOString().replace(/[:.-]/g, '')}.pdf`;
    await fs.writeFile(report_filepath, pdfBytes);

    return { success: true, pdfBase64: Buffer.from(pdfBytes).toString('base64'), report_filepath };

  } catch (error: any) {
    console.error("PDF generation failed:", error);
    return { success: false, error: error.message || "PDF generation failed", pdfBase64: null, report_filepath: null };
  }
}