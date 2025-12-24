#!/usr/bin/env node

/**
 * Script d'aide pour configurer les clés API des agents
 * Usage: node scripts/setup-api-keys.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupApiKeys() {
  console.log('🔑 Configuration des clés API pour VerifDoc\n');
  console.log('Ce script va vous aider à configurer les clés API pour les 2 agents.\n');

  const envPath = path.join(__dirname, '..', '.env');
  let envContent = '';

  // Vérifier si le fichier .env existe déjà
  if (fs.existsSync(envPath)) {
    console.log('⚠️  Le fichier .env existe déjà.');
    const overwrite = await question('Voulez-vous le remplacer ? (o/N): ');
    if (overwrite.toLowerCase() !== 'o') {
      console.log('❌ Configuration annulée.');
      rl.close();
      return;
    }
  }

  console.log('\n=== Agent 1 - Agent Principal ===');
  const agent1Key = await question('Clé API Agent 1: ');
  const agent1Secret = await question('Secret API Agent 1 (optionnel): ');
  const agent1BaseUrl = await question('URL de base Agent 1 (optionnel): ');

  console.log('\n=== Agent 2 - Agent Secondaire ===');
  const agent2Key = await question('Clé API Agent 2: ');
  const agent2Secret = await question('Secret API Agent 2 (optionnel): ');
  const agent2BaseUrl = await question('URL de base Agent 2 (optionnel): ');

  // Construire le contenu du fichier .env
  envContent = `# Configuration des clés API pour les agents VerifDoc
# Généré le ${new Date().toISOString()}

# ============================================
# Agent 1 - Agent Principal
# ============================================
AGENT_1_API_KEY=${agent1Key || ''}
AGENT_1_API_SECRET=${agent1Secret || ''}
AGENT_1_AUTH_TYPE=api_key
AGENT_1_API_VERSION=v1
AGENT_1_BASE_URL=${agent1BaseUrl || ''}

# ============================================
# Agent 2 - Agent Secondaire
# ============================================
AGENT_2_API_KEY=${agent2Key || ''}
AGENT_2_API_SECRET=${agent2Secret || ''}
AGENT_2_AUTH_TYPE=api_key
AGENT_2_API_VERSION=v1
AGENT_2_BASE_URL=${agent2BaseUrl || ''}

# ============================================
# Configuration globale des API
# ============================================
API_DEFAULT_TIMEOUT=30000
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY=1000
`;

  // Écrire le fichier .env
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Fichier .env créé avec succès !');
  console.log(`📁 Emplacement: ${envPath}`);
  console.log('\n⚠️  N\'oubliez pas d\'ajouter .env à votre .gitignore pour la sécurité.\n');

  rl.close();
}

// Exécuter le script
setupApiKeys().catch(err => {
  console.error('❌ Erreur:', err);
  rl.close();
  process.exit(1);
});





