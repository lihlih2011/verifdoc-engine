#!/usr/bin/env node

/**
 * Script pour créer le fichier .env avec les clés API OpenAI et Gemini
 */

const fs = require('fs');
const path = require('path');

const envContent = `# Configuration des clés API pour les agents VerifDoc
# Généré automatiquement

# ============================================
# Agent 1 - Agent Principal (OpenAI GPT-4o)
# ============================================
AGENT_1_API_KEY=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
AGENT_1_API_SECRET=
AGENT_1_AUTH_TYPE=bearer
AGENT_1_API_VERSION=v1
AGENT_1_BASE_URL=https://api.openai.com
AGENT_1_PROVIDER=openai

# ============================================
# Agent 2 - Agent Secondaire (Gemini)
# ============================================
AGENT_2_API_KEY=AIzaSyB-k7NdhgKwErZvI4epYRAUkyJuuedRQVQ
AGENT_2_API_SECRET=
AGENT_2_AUTH_TYPE=api_key
AGENT_2_API_VERSION=v1
AGENT_2_BASE_URL=https://generativelanguage.googleapis.com
AGENT_2_PROVIDER=gemini

# ============================================
# Configuration globale des API
# ============================================
API_DEFAULT_TIMEOUT=30000
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY=1000

# ============================================
# Configuration OpenAI spécifique
# ============================================
OPENAI_API_KEY=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
OPENAI_MODEL=gpt-4o
OPENAI_API_URL=https://api.openai.com/v1/chat/completions

# ============================================
# Configuration Gemini spécifique
# ============================================
GEMINI_API_KEY=AIzaSyB-k7NdhgKwErZvI4epYRAUkyJuuedRQVQ
GEMINI_MODEL=gemini-pro-vision
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models
`;

const envPath = path.join(__dirname, '..', '.env');

try {
  // Vérifier si le fichier existe déjà
  if (fs.existsSync(envPath)) {
    console.log('⚠️  Le fichier .env existe déjà.');
    console.log('📁 Emplacement:', envPath);
    console.log('\nPour le recréer, supprimez-le d\'abord ou modifiez-le manuellement.');
    process.exit(0);
  }

  // Créer le fichier .env
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Fichier .env créé avec succès !');
  console.log('📁 Emplacement:', envPath);
  console.log('\n🔑 Configuration des clés API :');
  console.log('   - Agent 1 (Principal) : OpenAI GPT-4o');
  console.log('   - Agent 2 (Secondaire) : Gemini');
  console.log('\n⚠️  N\'oubliez pas d\'ajouter .env à votre .gitignore pour la sécurité.\n');
  
} catch (error) {
  console.error('❌ Erreur lors de la création du fichier .env:', error.message);
  process.exit(1);
}
