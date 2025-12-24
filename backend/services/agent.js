/**
 * Service Agent - Logique d'analyse pour un agent individuel
 */

const GeminiService = require("./gemini-service");
const OpenAIService = require("./openai-service");
const ELAService = require("./ela-service");
const fs = require("fs");

class Agent {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.config = config.config;
    this.enabled = config.enabled;
    this.apiKeys = config.apiKeys || null;
    this.endpoints = config.endpoints || {};
    
    // Initialiser le service approprié selon le provider
    if (this.apiKeys && this.apiKeys.apiKey) {
      if (this.apiKeys.provider === "openai") {
        this.openaiService = new OpenAIService(this.apiKeys.apiKey);
        this.geminiService = null;
      } else if (this.apiKeys.provider === "gemini") {
        this.geminiService = new GeminiService(this.apiKeys.apiKey);
        this.openaiService = null;
      } else {
        this.openaiService = null;
        this.geminiService = null;
      }
    } else {
      this.openaiService = null;
      this.geminiService = null;
    }
  }

  /**
   * Analyse un fichier selon la configuration de l'agent
   */
  async analyze(file) {
    if (!this.enabled) {
      throw new Error(`Agent ${this.id} est désactivé`);
    }

    // Si OpenAI est configuré, l'utiliser pour l'analyse
    if (this.openaiService && this.openaiService.isConfigured()) {
      try {
        return await this._analyzeWithOpenAI(file);
      } catch (error) {
        console.error(`Erreur avec OpenAI pour ${this.id}, utilisation de l'analyse locale:`, error.message);
        // Fallback sur l'analyse locale en cas d'erreur
      }
    }

    // Si Gemini est configuré, l'utiliser pour l'analyse
    if (this.geminiService && this.geminiService.isConfigured()) {
      try {
        return await this._analyzeWithGemini(file);
      } catch (error) {
        console.error(`Erreur avec Gemini pour ${this.id}, utilisation de l'analyse locale:`, error.message);
        // Fallback sur l'analyse locale en cas d'erreur
      }
    }

    // Analyse locale (méthode originale)
    return await this._analyzeLocal(file);
  }

  /**
   * Analyse avec OpenAI GPT-4 API
   */
  async _analyzeWithOpenAI(file) {
    // Lire le fichier
    const fileBuffer = fs.readFileSync(file.path);
    const mimeType = this._getMimeType(file.originalname);

    // Créer un prompt personnalisé selon la configuration de l'agent
    const prompt = this._buildOpenAIPrompt();

    // Appeler OpenAI
    const openaiResult = await this.openaiService.analyzeDocument(fileBuffer, mimeType, prompt);

    // Adapter le résultat au format attendu
    const result = openaiResult.parsedResult || openaiResult.rawResponse;

    return {
      agentId: this.id,
      agentName: this.name,
      document: file.originalname,
      verdict: result.verdict || "DOCUMENT SUSPECT",
      confidenceScore: result.confidenceScore || 70,
      anomalies: result.anomalies || ["Analyse effectuée"],
      elaAnomalies: [], // ELA not performed for AI-based analysis (handled by AI models)
      analyzedAt: new Date().toISOString(),
      config: {
        deepAnalysis: this.config.deepAnalysis,
        thresholds: {
          confidence: this.config.confidenceThreshold,
          anomaly: this.config.anomalyThreshold
        }
      },
      openaiAnalysis: {
        used: true,
        model: this.openaiService.model,
        rawResponse: openaiResult.rawResponse,
        usage: openaiResult.usage
      }
    };
  }

  /**
   * Analyse avec Gemini API
   */
  async _analyzeWithGemini(file) {
    // Lire le fichier
    const fileBuffer = fs.readFileSync(file.path);
    const mimeType = this._getMimeType(file.originalname);

    // Créer un prompt personnalisé selon la configuration de l'agent
    const prompt = this._buildGeminiPrompt();

    // Appeler Gemini
    const geminiResult = await this.geminiService.analyzeDocument(fileBuffer, mimeType, prompt);

    // Adapter le résultat au format attendu
    const result = geminiResult.parsedResult || geminiResult.rawResponse;

    return {
      agentId: this.id,
      agentName: this.name,
      document: file.originalname,
      verdict: result.verdict || "DOCUMENT SUSPECT",
      confidenceScore: result.confidenceScore || 70,
      anomalies: result.anomalies || ["Analyse effectuée"],
      elaAnomalies: [], // ELA not performed for AI-based analysis (handled by AI models)
      analyzedAt: new Date().toISOString(),
      config: {
        deepAnalysis: this.config.deepAnalysis,
        thresholds: {
          confidence: this.config.confidenceThreshold,
          anomaly: this.config.anomalyThreshold
        }
      },
      geminiAnalysis: {
        used: true,
        model: this.geminiService.model,
        rawResponse: geminiResult.rawResponse
      }
    };
  }

  /**
   * Analyse locale (méthode originale)
   */
  async _analyzeLocal(file) {
    const anomalies = [];
    let confidenceScore = 100;
    const elaAnomalies = [];

    // Analyse des métadonnées
    if (this.config.checkMetadata) {
      const metadataResult = this._checkMetadata(file);
      if (metadataResult.hasAnomalies) {
        anomalies.push(...metadataResult.anomalies);
        confidenceScore -= metadataResult.scorePenalty * this.config.metadataWeight;
      }
    }

    // Analyse de la compression
    if (this.config.checkCompression) {
      const compressionResult = this._checkCompression(file);
      if (compressionResult.hasAnomalies) {
        anomalies.push(...compressionResult.anomalies);
        confidenceScore -= compressionResult.scorePenalty * this.config.compressionWeight;
      }
    }

    // Analyse de la structure
    if (this.config.checkStructure) {
      const structureResult = this._checkStructure(file);
      if (structureResult.hasAnomalies) {
        anomalies.push(...structureResult.anomalies);
        confidenceScore -= structureResult.scorePenalty * this.config.structureWeight;
      }
    }

    // Error Level Analysis (ELA) - NEW
    // Only for image-based documents (JPG, PNG, or PDF pages rendered as images)
    const mimeType = this._getMimeType(file.originalname);
    if (mimeType.startsWith('image/')) {
      try {
        const elaService = new ELAService(95); // Quality level 95
        const elaResult = await elaService.analyzeImage(file.path, mimeType);
        
        if (elaResult.success && elaResult.elaAnomalies.length > 0) {
          // Add ELA anomalies to the list
          elaAnomalies.push(...elaResult.elaAnomalies);
          
          // Incorporate ELA score into confidence (ELA score is 0-100, higher = more suspicious)
          // Reduce confidence based on ELA findings, but don't override other checks
          const elaPenalty = (elaResult.elaScore / 100) * 15; // Max 15 points penalty
          confidenceScore -= elaPenalty;
          
          // Add summary anomalies to main list
          if (elaResult.elaAnomalies.length > 0) {
            const copyCount = elaResult.elaAnomalies.filter(a => a.type === 'copy').length;
            const addCount = elaResult.elaAnomalies.filter(a => a.type === 'add').length;
            const moveCount = elaResult.elaAnomalies.filter(a => a.type === 'move').length;
            
            if (copyCount > 0) {
              anomalies.push(`ELA: ${copyCount} région(s) dupliquée(s) détectée(s)`);
            }
            if (addCount > 0) {
              anomalies.push(`ELA: ${addCount} région(s) ajoutée(s) détectée(s)`);
            }
            if (moveCount > 0) {
              anomalies.push(`ELA: ${moveCount} région(s) déplacée(s) détectée(s)`);
            }
            if (copyCount === 0 && addCount === 0 && moveCount === 0) {
              anomalies.push(`ELA: ${elaResult.elaAnomalies.length} anomalie(s) de compression détectée(s)`);
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️  ELA analysis failed for ${file.originalname}:`, error.message);
        // Continue without ELA - don't fail the entire analysis
      }
    }

    // Normaliser le score entre 0 et 100
    confidenceScore = Math.max(0, Math.min(100, Math.round(confidenceScore)));

    // Déterminer le verdict
    const verdict = this._determineVerdict(confidenceScore, anomalies.length);

    return {
      agentId: this.id,
      agentName: this.name,
      document: file.originalname,
      verdict,
      confidenceScore,
      anomalies: anomalies.slice(0, this.config.anomalyThreshold + 1),
      elaAnomalies: elaAnomalies, // NEW: ELA-specific anomalies
      analyzedAt: new Date().toISOString(),
      config: {
        deepAnalysis: this.config.deepAnalysis,
        thresholds: {
          confidence: this.config.confidenceThreshold,
          anomaly: this.config.anomalyThreshold
        }
      }
    };
  }

  /**
   * Vérifie les métadonnées du fichier
   */
  _checkMetadata(file) {
    const anomalies = [];
    let scorePenalty = 0;

    // Simulation de vérification des métadonnées
    // Dans un cas réel, vous analyseriez les métadonnées EXIF, etc.
    const randomCheck = Math.random();
    
    if (randomCheck < 0.3) {
      anomalies.push("Métadonnées incohérentes");
      scorePenalty = 15;
    }

    if (randomCheck < 0.2) {
      anomalies.push("Date de création suspecte");
      scorePenalty += 10;
    }

    return {
      hasAnomalies: anomalies.length > 0,
      anomalies,
      scorePenalty
    };
  }

  /**
   * Vérifie la compression du fichier
   */
  _checkCompression(file) {
    const anomalies = [];
    let scorePenalty = 0;

    // Simulation de vérification de compression
    const randomCheck = Math.random();
    
    if (randomCheck < 0.25) {
      anomalies.push("Compression anormale");
      scorePenalty = 12;
    }

    if (randomCheck < 0.15) {
      anomalies.push("Niveaux de compression multiples détectés");
      scorePenalty += 8;
    }

    return {
      hasAnomalies: anomalies.length > 0,
      anomalies,
      scorePenalty
    };
  }

  /**
   * Vérifie la structure du fichier
   */
  _checkStructure(file) {
    const anomalies = [];
    let scorePenalty = 0;

    // Simulation de vérification de structure
    const randomCheck = Math.random();
    
    if (randomCheck < 0.35) {
      anomalies.push("Structure du fichier altérée");
      scorePenalty = 18;
    }

    if (randomCheck < 0.2) {
      anomalies.push("Sections manquantes ou corrompues");
      scorePenalty += 12;
    }

    return {
      hasAnomalies: anomalies.length > 0,
      anomalies,
      scorePenalty
    };
  }

  /**
   * Détermine le verdict basé sur le score et le nombre d'anomalies
   */
  _determineVerdict(confidenceScore, anomalyCount) {
    if (confidenceScore >= this.config.confidenceThreshold && anomalyCount < this.config.anomalyThreshold) {
      return "DOCUMENT VALIDE";
    } else if (confidenceScore >= 50 && anomalyCount < this.config.anomalyThreshold + 1) {
      return "DOCUMENT SUSPECT";
    } else {
      return "DOCUMENT FALSIFIÉ";
    }
  }

  /**
   * Construit un prompt personnalisé pour OpenAI selon la config de l'agent
   */
  _buildOpenAIPrompt() {
    const checks = [];
    
    if (this.config.checkMetadata) {
      checks.push("Vérifier la cohérence des métadonnées du document");
    }
    if (this.config.checkCompression) {
      checks.push("Analyser les niveaux de compression et détecter des compressions anormales");
    }
    if (this.config.checkStructure) {
      checks.push("Examiner la structure du document pour détecter des altérations");
    }

    return `Tu es un expert en analyse forensique de documents. Analyse ce document et détecte toute anomalie ou falsification potentielle.

Points à vérifier:
${checks.map(c => `- ${c}`).join('\n')}

Réponds UNIQUEMENT en JSON valide avec cette structure exacte:
{
  "verdict": "DOCUMENT VALIDE" | "DOCUMENT SUSPECT" | "DOCUMENT FALSIFIÉ",
  "confidenceScore": nombre entre 0 et 100,
  "anomalies": ["liste", "des", "anomalies", "détectées"],
  "details": "description détaillée de l'analyse"
}`;
  }

  /**
   * Construit un prompt personnalisé pour Gemini selon la config de l'agent
   */
  _buildGeminiPrompt() {
    const checks = [];
    
    if (this.config.checkMetadata) {
      checks.push("Vérifier la cohérence des métadonnées du document");
    }
    if (this.config.checkCompression) {
      checks.push("Analyser les niveaux de compression et détecter des compressions anormales");
    }
    if (this.config.checkStructure) {
      checks.push("Examiner la structure du document pour détecter des altérations");
    }

    return `Tu es un expert en analyse forensique de documents. Analyse ce document et détecte toute anomalie ou falsification potentielle.

Points à vérifier:
${checks.map(c => `- ${c}`).join('\n')}

Réponds en JSON avec cette structure:
{
  "verdict": "DOCUMENT VALIDE" | "DOCUMENT SUSPECT" | "DOCUMENT FALSIFIÉ",
  "confidenceScore": nombre entre 0 et 100,
  "anomalies": ["liste", "des", "anomalies", "détectées"],
  "details": "description détaillée de l'analyse"
}`;
  }

  /**
   * Détermine le type MIME à partir du nom de fichier
   */
  _getMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }
}

module.exports = Agent;

