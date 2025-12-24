/**
 * Content-level fraud detection engine for VerifDoc.
 *
 * Responsibilities:
 * - Extract textual content from PDF documents (OCR hook for future use).
 * - Identify sensitive fields: names, dates, identifiers.
 * - Perform content-consistency checks (metadata vs content, internal consistency).
 * - Detect logical COPY / MOVE / ADD patterns at text-block level.
 *
 * NOTE:
 * - This module is intentionally lightweight and self-contained.
 * - It reuses the existing `pdf-parse` dependency and Node.js stdlib only.
 * - OCR for non-PDF documents is left as a clearly marked extension point.
 */

const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

/**
 * High-level entry point for content analysis.
 *
 * @param {object} file - Multer file object (with `path`, `originalname`, etc.)
 * @returns {Promise<{anomalies: Array, scorePenalty: number, extracted: object}>}
 */
async function analyzeDocumentContent(file) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  let rawText = "";
  let metadata = {};

  // 1) Content extraction
  if (ext === ".pdf") {
    const buffer = fs.readFileSync(file.path);
    try {
      const pdfData = await pdfParse(buffer);
      rawText = (pdfData.text || "").toString();
      metadata = pdfData.info || {};
    } catch (err) {
      // If PDF parsing fails, we fail gracefully and report a soft anomaly.
      return {
        anomalies: [
          {
            type: "CONTENT_EXTRACTION_ERROR",
            reason: "Impossible d'extraire le texte du PDF (erreur d'analyse).",
          },
        ],
        scorePenalty: 10,
        extracted: {
          textPreview: "",
          metadata,
        },
      };
    }
  } else {
    // Hook for future OCR integration on image formats.
    // For now, we keep behavior lightweight and non-blocking.
    // You can plug a lightweight OCR library here if needed.
    return {
      anomalies: [],
      scorePenalty: 0,
      extracted: {
        textPreview: "",
        metadata: {},
      },
    };
  }

  if (!rawText || !rawText.trim()) {
    return {
      anomalies: [
        {
          type: "NO_TEXT_CONTENT",
          reason: "Aucun contenu textuel significatif n'a été trouvé dans le document.",
        },
      ],
      scorePenalty: 5,
      extracted: {
        textPreview: "",
        metadata,
      },
    };
  }

  const normalizedText = normalizeText(rawText);

  // 2) Sensitive field extraction (names, dates, identifiers)
  const sensitiveFields = extractSensitiveFields(normalizedText);

  // 3) Content consistency checks (metadata vs content, internal consistency)
  const consistencyFindings = detectContentConsistencyIssues(
    sensitiveFields,
    metadata
  );

  // 4) Logical COPY / MOVE / ADD detection at text-block level
  const layoutFindings = detectLogicalCopyMoveAdd(normalizedText);

  const allFindings = [...consistencyFindings, ...layoutFindings];

  // Scoring heuristic: each anomaly category contributes a small penalty.
  let scorePenalty = 0;
  allFindings.forEach((finding) => {
    switch (finding.severity) {
      case "HIGH":
        scorePenalty += 15;
        break;
      case "MEDIUM":
        scorePenalty += 8;
        break;
      case "LOW":
      default:
        scorePenalty += 4;
        break;
    }
  });

  return {
    anomalies: allFindings,
    scorePenalty,
    extracted: {
      textPreview: rawText.slice(0, 500), // small preview for debugging / future use
      metadata,
      sensitiveFields,
    },
  };
}

/**
 * Normalize text for downstream analysis.
 * - Collapses whitespace
 * - Normalizes line breaks
 * - Lowercases the content
 */
function normalizeText(text) {
  return text.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
}

/**
 * Extract core sensitive fields (names, dates, identifiers) using
 * lightweight regex-based heuristics.
 */
function extractSensitiveFields(text) {
  const dates = [];
  const identifiers = [];
  const names = [];

  // Dates in various common formats (DD/MM/YYYY, YYYY-MM-DD, etc.)
  const dateRegex =
    /\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2},? \d{4})\b/gi;
  let match;
  while ((match = dateRegex.exec(text)) !== null) {
    dates.push(match[0]);
  }

  // Identifiers: sequences of digits / alphanumerics that look like IDs
  const idRegex = /\b[A-Z0-9]{5,}[-/]?[A-Z0-9]{3,}\b/gi;
  while ((match = idRegex.exec(text)) !== null) {
    identifiers.push(match[0]);
  }

  // Names: simple heuristic for capitalized words followed by other capitalized words
  const nameRegex = /\b[A-Z][a-z]+(?: [A-Z][a-z]+){1,3}\b/g;
  while ((match = nameRegex.exec(text)) !== null) {
    names.push(match[0]);
  }

  return {
    dates: Array.from(new Set(dates)),
    identifiers: Array.from(new Set(identifiers)),
    names: Array.from(new Set(names)),
  };
}

/**
 * Detect content consistency issues based on:
 * - internal date inconsistencies
 * - metadata vs content inconsistencies (creation / modification dates, author)
 */
function detectContentConsistencyIssues(sensitiveFields, metadata) {
  const findings = [];

  const { dates, names } = sensitiveFields;

  // INTERNAL DATE CONSISTENCY: if dates span very different years, flag as suspicious.
  const years = dates
    .map((d) => extractYear(d))
    .filter((y) => y !== null)
    .sort();

  if (years.length > 1) {
    const minYear = years[0];
    const maxYear = years[years.length - 1];
    if (maxYear - minYear > 10) {
      findings.push({
        type: "CONTENT_DATE_INCONSISTENCY",
        severity: "MEDIUM",
        reason:
          "Plusieurs années très différentes détectées dans les dates du contenu (écart > 10 ans).",
        details: { years },
      });
    }
  }

  // METADATA vs CONTENT: simple year-based checks when CreationDate / ModDate exist.
  const metaYears = [];
  if (metadata.CreationDate) {
    const y = extractYear(metadata.CreationDate.toString());
    if (y) metaYears.push(y);
  }
  if (metadata.ModDate) {
    const y = extractYear(metadata.ModDate.toString());
    if (y) metaYears.push(y);
  }

  if (metaYears.length && years.length) {
    const metaYear = metaYears[metaYears.length - 1]; // use latest metadata year
    const closestDateYear = years.reduce((prev, curr) => {
      return Math.abs(curr - metaYear) < Math.abs(prev - metaYear)
        ? curr
        : prev;
    }, years[0]);

    if (Math.abs(closestDateYear - metaYear) > 5) {
      findings.push({
        type: "METADATA_DATE_MISMATCH",
        severity: "HIGH",
        reason:
          "Les dates présentes dans le contenu sont fortement incohérentes avec les dates de métadonnées (CreationDate / ModDate).",
        details: {
          metadataYears: metaYears,
          contentYears: years,
        },
      });
    }
  }

  // NAME vs METADATA AUTHOR:
  if (metadata.Author && names.length) {
    const author = metadata.Author.toString();
    const authorFoundInContent = names.some((n) =>
      author.toLowerCase().includes(n.toLowerCase())
    );
    if (!authorFoundInContent) {
      findings.push({
        type: "AUTHOR_NOT_FOUND_IN_CONTENT",
        severity: "LOW",
        reason:
          "Le nom d'auteur présent dans les métadonnées n'a pas été retrouvé clairement dans le contenu.",
        details: {
          author,
          detectedNames: names.slice(0, 10),
        },
      });
    }
  }

  // RULE: date fields changed without matching metadata update
  // Heuristic: many distinct content years but very old CreationDate.
  if (metaYears.length && years.length > 1) {
    const metaYear = metaYears[0];
    const distinctYears = Array.from(new Set(years));
    const hasYearAfterMetadata = distinctYears.some((y) => y > metaYear + 5);
    if (hasYearAfterMetadata) {
      findings.push({
        type: "DATE_CHANGED_WITHOUT_METADATA_UPDATE",
        severity: "HIGH",
        reason:
          "Des dates récentes dans le contenu ne correspondent pas à l'année de création indiquée dans les métadonnées (soupçon de modification sans mise à jour des métadonnées).",
        details: {
          metadataYears: metaYears,
          contentYears: distinctYears,
        },
      });
    }
  }

  return findings;
}

/**
 * Extract a plausible 4-digit year from a date-like string.
 */
function extractYear(dateStr) {
  const match = dateStr.match(/(19|20)\d{2}/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Detect logical COPY / MOVE / ADD at the text-block level using
 * paragraph-level heuristics.
 *
 * - COPY: duplicated text blocks (same paragraph content appearing multiple times)
 * - MOVE: same paragraph appearing far apart in the document
 * - ADD: very short unique blocks containing sensitive tokens
 */
function detectLogicalCopyMoveAdd(normalizedText) {
  const findings = [];

  // Split into rough paragraphs
  const paragraphs = normalizedText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length === 0) return findings;

  const paragraphMap = new Map();

  paragraphs.forEach((p, index) => {
    const key = p.toLowerCase();
    if (!paragraphMap.has(key)) {
      paragraphMap.set(key, []);
    }
    paragraphMap.get(key).push(index);
  });

  const totalParagraphs = paragraphs.length;

  paragraphMap.forEach((indices, key) => {
    if (indices.length > 1 && key.length > 80) {
      // COPY: duplicated substantial paragraph
      findings.push({
        type: "CONTENT_COPY_DETECTED",
        severity: "MEDIUM",
        reason:
          "Même bloc de texte substantiel détecté à plusieurs endroits du document (soupçon de copie interne).",
        details: {
          occurrences: indices.length,
          positions: indices,
        },
      });

      // MOVE: if occurrences are far apart (e.g., first vs last quartile)
      const first = indices[0];
      const last = indices[indices.length - 1];
      if (last - first > Math.max(2, Math.floor(totalParagraphs / 3))) {
        findings.push({
          type: "CONTENT_MOVE_SUSPECTED",
          severity: "LOW",
          reason:
            "Un bloc de texte identique apparaît à des positions très éloignées dans le document (soupçon de déplacement logique).",
          details: {
            firstIndex: first,
            lastIndex: last,
            totalParagraphs,
          },
        });
      }
    }
  });

  // ADD: very short unique paragraphs containing sensitive tokens
  const sensitiveKeywordRegex =
    /\b(confidentiel|secret|annexe modifiée|avenant|rectificatif)\b/i;
  paragraphs.forEach((p, index) => {
    if (p.length < 120 && sensitiveKeywordRegex.test(p)) {
      const key = p.toLowerCase();
      if (paragraphMap.get(key)?.length === 1) {
        findings.push({
          type: "CONTENT_ADD_SUSPECTED",
          severity: "MEDIUM",
          reason:
            "Un court bloc de texte sensible apparaît une seule fois sans autre support structurel (soupçon d'ajout tardif).",
          details: {
            index,
            textPreview: p.slice(0, 200),
          },
        });
      }
    }
  });

  return findings;
}

module.exports = {
  analyzeDocumentContent,
};





