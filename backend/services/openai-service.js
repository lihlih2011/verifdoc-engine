/**
 * Service d'intégration avec OpenAI API (GPT-4 / GPT-4o)
 * Utilisé par les agents pour l'analyse de documents avec IA
 */

const apiKeysConfig = require("../config/api-keys.config");

class OpenAIService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || apiKeysConfig.openai.apiKey;
    this.model = apiKeysConfig.openai.model || "gpt-4o";
    this.apiUrl = apiKeysConfig.openai.apiUrl || "https://api.openai.com/v1/chat/completions";
    
    if (!this.apiKey) {
      console.warn("⚠️  Clé API OpenAI non configurée");
    }
  }

  /**
   * Analyse un document avec GPT-4 Vision
   * @param {Buffer} imageBuffer - Buffer de l'image à analyser
   * @param {string} mimeType - Type MIME de l'image (image/jpeg, image/png, etc.)
   * @param {string} prompt - Prompt personnalisé pour l'analyse
   * @returns {Promise<Object>} Résultat de l'analyse
   */
  async analyzeDocument(imageBuffer, mimeType = "image/jpeg", prompt = null) {
    if (!this.apiKey) {
      throw new Error("Clé API OpenAI non configurée");
    }

    const defaultPrompt = `Tu es un expert en analyse forensique de documents. Analyse ce document et détecte toute anomalie ou falsification potentielle.

Vérifie:
1. La cohérence des métadonnées
2. Les signes de manipulation ou retouche
3. La structure et l'intégrité du document
4. Les incohérences dans le texte ou les éléments visuels

Réponds UNIQUEMENT en JSON valide avec cette structure exacte:
{
  "verdict": "DOCUMENT VALIDE" | "DOCUMENT SUSPECT" | "DOCUMENT FALSIFIÉ",
  "confidenceScore": nombre entre 0 et 100,
  "anomalies": ["liste", "des", "anomalies", "détectées"],
  "details": "description détaillée de l'analyse"
}`;

    const analysisPrompt = prompt || defaultPrompt;

    try {
      // Convertir l'image en base64
      const base64Image = imageBuffer.toString('base64');

      // Construire la requête pour OpenAI API
      const requestBody = {
        model: this.model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: analysisPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3 // Plus bas pour des réponses plus précises
      };

      // Appel à l'API OpenAI
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erreur API OpenAI: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      
      // Extraire la réponse textuelle
      const textResponse = data.choices?.[0]?.message?.content || "";
      
      // Essayer de parser la réponse JSON
      let parsedResult = null;
      try {
        // Chercher un bloc JSON dans la réponse
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          // Si pas de JSON trouvé, essayer de parser toute la réponse
          parsedResult = JSON.parse(textResponse);
        }
      } catch (e) {
        // Si le parsing échoue, utiliser la réponse textuelle brute
        console.warn("Impossible de parser la réponse JSON d'OpenAI, utilisation de la réponse textuelle");
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
        timestamp: new Date().toISOString(),
        usage: data.usage || null
      };

    } catch (error) {
      console.error("❌ Erreur lors de l'appel à OpenAI API:", error);
      throw error;
    }
  }

  /**
   * Extrait le verdict de la réponse textuelle
   */
  _extractVerdict(text) {
    const upperText = text.toUpperCase();
    if (upperText.includes("FALSIFIÉ") || upperText.includes("FAKE") || upperText.includes("FALSIFIED")) {
      return "DOCUMENT FALSIFIÉ";
    } else if (upperText.includes("SUSPECT") || upperText.includes("SUSPICIOUS")) {
      return "DOCUMENT SUSPECT";
    } else if (upperText.includes("VALIDE") || upperText.includes("VALID") || upperText.includes("AUTHENTIC")) {
      return "DOCUMENT VALIDE";
    }
    return "DOCUMENT SUSPECT"; // Par défaut
  }

  /**
   * Extrait le score de confiance de la réponse
   */
  _extractScore(text) {
    const scoreMatch = text.match(/(?:score|confidence|confidenceScore)[:\s]*(\d+)/i);
    if (scoreMatch) {
      return parseInt(scoreMatch[1]);
    }
    // Score par défaut basé sur les mots-clés
    if (text.toUpperCase().includes("FALSIFIÉ") || text.toUpperCase().includes("FAKE")) return 30;
    if (text.toUpperCase().includes("SUSPECT") || text.toUpperCase().includes("SUSPICIOUS")) return 60;
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
      "anomalie",
      "inconsistent metadata",
      "manipulation detected",
      "structure altered"
    ];

    anomalyKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        anomalies.push(keyword);
      }
    });

    // Essayer d'extraire une liste d'anomalies depuis un tableau JSON
    try {
      const jsonMatch = text.match(/"anomalies"\s*:\s*\[(.*?)\]/s);
      if (jsonMatch) {
        const anomaliesList = jsonMatch[1]
          .split(',')
          .map(a => a.trim().replace(/["\[\]]/g, ''))
          .filter(a => a.length > 0);
        if (anomaliesList.length > 0) {
          return anomaliesList;
        }
      }
    } catch (e) {
      // Ignorer les erreurs de parsing
    }

    return anomalies.length > 0 ? anomalies : ["Aucune anomalie majeure détectée"];
  }

  /**
   * Vérifie si le service est configuré et disponible
   */
  isConfigured() {
    return !!this.apiKey;
  }
}

module.exports = OpenAIService;





