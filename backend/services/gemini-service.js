/**
 * Service d'intégration avec Google Gemini API
 * Utilisé par les agents pour l'analyse de documents avec IA
 */

const apiKeysConfig = require("../config/api-keys.config");

class GeminiService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || apiKeysConfig.gemini.apiKey;
    this.model = apiKeysConfig.gemini.model;
    this.apiUrl = apiKeysConfig.gemini.apiUrl;
    
    if (!this.apiKey) {
      console.warn("⚠️  Clé API Gemini non configurée");
    }
  }

  /**
   * Analyse un document avec Gemini Vision
   * @param {Buffer} imageBuffer - Buffer de l'image à analyser
   * @param {string} mimeType - Type MIME de l'image (image/jpeg, image/png, etc.)
   * @param {string} prompt - Prompt personnalisé pour l'analyse
   * @returns {Promise<Object>} Résultat de l'analyse
   */
  async analyzeDocument(imageBuffer, mimeType = "image/jpeg", prompt = null) {
    if (!this.apiKey) {
      throw new Error("Clé API Gemini non configurée");
    }

    const defaultPrompt = `Analyse ce document et détecte toute anomalie ou falsification potentielle. 
    Vérifie:
    1. La cohérence des métadonnées
    2. Les signes de manipulation ou retouche
    3. La structure et l'intégrité du document
    4. Les incohérences dans le texte ou les éléments visuels
    
    Réponds en JSON avec:
    - verdict: "VALIDE", "SUSPECT", ou "FALSIFIÉ"
    - confidenceScore: score de 0 à 100
    - anomalies: liste des anomalies détectées
    - details: détails de l'analyse`;

    const analysisPrompt = prompt || defaultPrompt;

    try {
      // Convertir l'image en base64
      const base64Image = imageBuffer.toString('base64');

      // Construire la requête pour Gemini API
      const requestBody = {
        contents: [{
          parts: [
            { text: analysisPrompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image
              }
            }
          ]
        }]
      };

      // Appel à l'API Gemini
      const url = `${this.apiUrl}/${this.model}:generateContent?key=${this.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erreur API Gemini: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      
      // Extraire la réponse textuelle
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Essayer de parser la réponse JSON si possible
      let parsedResult = null;
      try {
        // Chercher un bloc JSON dans la réponse
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // Si le parsing échoue, utiliser la réponse textuelle brute
        console.warn("Impossible de parser la réponse JSON de Gemini, utilisation de la réponse textuelle");
      }

      return {
        success: true,
        rawResponse: textResponse,
        parsedResult: parsedResult || {
          verdict: this._extractVerdict(textResponse),
          confidenceScore: this._extractScore(textResponse),
          anomalies: this._extractAnomalies(textResponse),
          details: textResponse
        },
        model: this.model,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error("❌ Erreur lors de l'appel à Gemini API:", error);
      throw error;
    }
  }

  /**
   * Extrait le verdict de la réponse textuelle
   */
  _extractVerdict(text) {
    const upperText = text.toUpperCase();
    if (upperText.includes("FALSIFIÉ") || upperText.includes("FAKE")) {
      return "DOCUMENT FALSIFIÉ";
    } else if (upperText.includes("SUSPECT") || upperText.includes("SUSPICIOUS")) {
      return "DOCUMENT SUSPECT";
    } else if (upperText.includes("VALIDE") || upperText.includes("VALID")) {
      return "DOCUMENT VALIDE";
    }
    return "DOCUMENT SUSPECT"; // Par défaut
  }

  /**
   * Extrait le score de confiance de la réponse
   */
  _extractScore(text) {
    const scoreMatch = text.match(/(?:score|confidence)[:\s]*(\d+)/i);
    if (scoreMatch) {
      return parseInt(scoreMatch[1]);
    }
    // Score par défaut basé sur les mots-clés
    if (text.toUpperCase().includes("FALSIFIÉ")) return 30;
    if (text.toUpperCase().includes("SUSPECT")) return 60;
    return 80;
  }

  /**
   * Extrait les anomalies de la réponse
   */
  _extractAnomalies(text) {
    const anomalies = [];
    const anomalyKeywords = [
      "métadonnées incohérentes",
      "manipulation",
      "retouche",
      "structure altérée",
      "compression anormale",
      "incohérence",
      "anomalie"
    ];

    anomalyKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        anomalies.push(keyword);
      }
    });

    return anomalies.length > 0 ? anomalies : ["Aucune anomalie majeure détectée"];
  }

  /**
   * Vérifie si le service est configuré et disponible
   */
  isConfigured() {
    return !!this.apiKey;
  }
}

module.exports = GeminiService;





