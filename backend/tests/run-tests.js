#!/usr/bin/env node

/**
 * Script de test simple pour VerifDoc
 * Exécute les tests sans dépendre de Jest
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Tests VerifDoc\n');
console.log('='.repeat(50));

let passed = 0;
let failed = 0;
const errors = [];

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Erreur: ${error.message}`);
    errors.push({ name, error: error.message });
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test 1: Vérifier que les fichiers de configuration existent
test('Fichier agents.config.js existe', () => {
  const configPath = path.join(__dirname, '..', 'config', 'agents.config.js');
  assert(fs.existsSync(configPath), 'agents.config.js manquant');
});

test('Fichier api-keys.config.js existe', () => {
  const configPath = path.join(__dirname, '..', 'config', 'api-keys.config.js');
  assert(fs.existsSync(configPath), 'api-keys.config.js manquant');
});

// Test 2: Vérifier que les services existent
test('Service agent.js existe', () => {
  const servicePath = path.join(__dirname, '..', 'services', 'agent.js');
  assert(fs.existsSync(servicePath), 'agent.js manquant');
});

test('Service openai-service.js existe', () => {
  const servicePath = path.join(__dirname, '..', 'services', 'openai-service.js');
  assert(fs.existsSync(servicePath), 'openai-service.js manquant');
});

test('Service gemini-service.js existe', () => {
  const servicePath = path.join(__dirname, '..', 'services', 'gemini-service.js');
  assert(fs.existsSync(servicePath), 'gemini-service.js manquant');
});

test('Service analyze.js existe', () => {
  const servicePath = path.join(__dirname, '..', 'services', 'analyze.js');
  assert(fs.existsSync(servicePath), 'analyze.js manquant');
});

// Test 3: Vérifier la configuration
test('Configuration des agents chargée', () => {
  try {
    const agentsConfig = require('../config/agents.config');
    assert(agentsConfig, 'Configuration non chargée');
    assert(agentsConfig.agents, 'Agents non définis');
    assert(Array.isArray(agentsConfig.agents), 'Agents doit être un tableau');
    assert(agentsConfig.agents.length === 2, 'Doit avoir 2 agents');
  } catch (error) {
    throw new Error(`Erreur de chargement: ${error.message}`);
  }
});

test('Agent 1 configuré avec OpenAI', () => {
  const agentsConfig = require('../config/agents.config');
  const agent1 = agentsConfig.agents.find(a => a.id === 'agent-1');
  assert(agent1, 'Agent 1 non trouvé');
  assert(agent1.enabled === true, 'Agent 1 doit être activé');
});

test('Agent 2 configuré avec Gemini', () => {
  const agentsConfig = require('../config/agents.config');
  const agent2 = agentsConfig.agents.find(a => a.id === 'agent-2');
  assert(agent2, 'Agent 2 non trouvé');
  assert(agent2.enabled === true, 'Agent 2 doit être activé');
});

test('Configuration globale correcte', () => {
  const agentsConfig = require('../config/agents.config');
  assert(agentsConfig.global, 'Configuration globale manquante');
  assert(agentsConfig.global.executionMode === 'parallel', 'Mode doit être parallèle');
  assert(agentsConfig.global.fusionMode === 'weighted', 'Mode de fusion doit être weighted');
});

test('Poids de fusion corrects', () => {
  const agentsConfig = require('../config/agents.config');
  const weights = agentsConfig.global.fusionWeights;
  assert(weights['agent-1'] === 0.6, 'Poids agent-1 doit être 0.6');
  assert(weights['agent-2'] === 0.4, 'Poids agent-2 doit être 0.4');
});

// Test 4: Vérifier les services
test('Service OpenAI instanciable', () => {
  const OpenAIService = require('../services/openai-service');
  const service = new OpenAIService('test-key');
  assert(service, 'Service non instancié');
  assert(service.model, 'Modèle non défini');
});

test('Service Gemini instanciable', () => {
  const GeminiService = require('../services/gemini-service');
  const service = new GeminiService('test-key');
  assert(service, 'Service non instancié');
  assert(service.model, 'Modèle non défini');
});

test('Agent instanciable', () => {
  const Agent = require('../services/agent');
  const agentsConfig = require('../config/agents.config');
  const agent1Config = agentsConfig.agents.find(a => a.id === 'agent-1');
  const agent = new Agent(agent1Config);
  assert(agent, 'Agent non instancié');
  assert(agent.id === 'agent-1', 'ID incorrect');
});

// Test 5: Vérifier les fichiers manquants (avertissements)
console.log('\n' + '='.repeat(50));
console.log('⚠️  Vérifications supplémentaires:\n');

const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  Fichier .env manquant (nécessaire pour les clés API)');
} else {
  console.log('✅ Fichier .env présent');
}

const uploadsPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  console.log('⚠️  Dossier uploads/ manquant (sera créé automatiquement)');
} else {
  console.log('✅ Dossier uploads/ présent');
}

// Résumé
console.log('\n' + '='.repeat(50));
console.log('📊 Résumé des tests:\n');
console.log(`✅ Tests réussis: ${passed}`);
console.log(`❌ Tests échoués: ${failed}`);

if (failed > 0) {
  console.log('\n❌ Erreurs détectées:');
  errors.forEach(({ name, error }) => {
    console.log(`   - ${name}: ${error}`);
  });
  process.exit(1);
} else {
  console.log('\n✅ Tous les tests sont passés !');
  process.exit(0);
}




