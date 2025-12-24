/**
 * Configuration des agents d'analyse VerifDoc
 * Définit 2 agents avec leurs paramètres spécifiques
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const apiKeysConfig = require("./api-keys.config");

module.exports = {
  agents: [
    {
      id: "agent-1",
      name: "Agent Principal",
      description: "Agent principal pour l'analyse approfondie des documents",
      enabled: true,
      priority: 1,
      config: {
        // Paramètres d'analyse
        deepAnalysis: true,
        checkMetadata: true,
        checkCompression: true,
        checkStructure: true,
        // Seuils de détection
        confidenceThreshold: 70,
        anomalyThreshold: 3,
        // Poids pour le scoring
        metadataWeight: 0.3,
        compressionWeight: 0.3,
        structureWeight: 0.4
      },
      endpoints: {
        // Si vous utilisez des endpoints externes pour cet agent
        baseUrl: process.env.AGENT_1_BASE_URL || "https://api.openai.com",
        timeout: 30000
      },
      apiKeys: apiKeysConfig.agents["agent-1"]
    },
    {
      id: "agent-2",
      name: "Agent Secondaire",
      description: "Agent secondaire pour validation et vérification croisée",
      enabled: true,
      priority: 2,
      config: {
        // Paramètres d'analyse
        deepAnalysis: false,
        checkMetadata: true,
        checkCompression: false,
        checkStructure: true,
        // Seuils de détection (plus stricts)
        confidenceThreshold: 75,
        anomalyThreshold: 2,
        // Poids pour le scoring
        metadataWeight: 0.4,
        compressionWeight: 0.2,
        structureWeight: 0.4
      },
      endpoints: {
        baseUrl: process.env.AGENT_2_BASE_URL || "https://generativelanguage.googleapis.com",
        timeout: 20000
      },
      apiKeys: apiKeysConfig.agents["agent-2"]
    }
  ],
  
  // Configuration globale
  global: {
    // Mode d'exécution: "parallel" ou "sequential"
    executionMode: "parallel",
    // Timeout global en ms
    globalTimeout: 60000,
    // Fusion des résultats: "average", "weighted", "consensus"
    fusionMode: "weighted",
    // Poids pour la fusion (agent-1, agent-2)
    fusionWeights: {
      "agent-1": 0.6,
      "agent-2": 0.4
    }
  }
};

