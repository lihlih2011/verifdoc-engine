/**
 * Configuration des clés API pour les agents VerifDoc
 * Les clés sont chargées depuis les variables d'environnement pour la sécurité
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

module.exports = {
  agents: {
    "agent-1": {
      apiKey: process.env.AGENT_1_API_KEY || process.env.OPENAI_API_KEY || null,
      apiSecret: process.env.AGENT_1_API_SECRET || null,
      // Autres paramètres d'authentification si nécessaire
      authType: process.env.AGENT_1_AUTH_TYPE || "bearer", // "api_key", "bearer", "oauth", etc.
      provider: process.env.AGENT_1_PROVIDER || "openai", // "openai", "gemini", "custom", etc.
      headers: {
        // Headers personnalisés si nécessaire
        "X-API-Version": process.env.AGENT_1_API_VERSION || "v1"
      }
    },
    "agent-2": {
      apiKey: process.env.AGENT_2_API_KEY || process.env.GEMINI_API_KEY || null,
      apiSecret: process.env.AGENT_2_API_SECRET || null,
      authType: process.env.AGENT_2_AUTH_TYPE || "api_key",
      provider: process.env.AGENT_2_PROVIDER || "gemini",
      headers: {
        "X-API-Version": process.env.AGENT_2_API_VERSION || "v1"
      }
    }
  },
  
  // Configuration OpenAI spécifique
  openai: {
    apiKey: process.env.OPENAI_API_KEY || process.env.AGENT_1_API_KEY || null,
    model: process.env.OPENAI_MODEL || "gpt-4o",
    apiUrl: process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions"
  },
  
  // Configuration Gemini spécifique
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || process.env.AGENT_2_API_KEY || null,
    model: process.env.GEMINI_MODEL || "gemini-pro-vision",
    apiUrl: process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta/models"
  },
  
  // Configuration globale pour les API
  global: {
    // Timeout par défaut pour les appels API
    defaultTimeout: parseInt(process.env.API_DEFAULT_TIMEOUT) || 30000,
    // Retry configuration
    retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(process.env.API_RETRY_DELAY) || 1000
  }
};

