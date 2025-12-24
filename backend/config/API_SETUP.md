# Configuration des Clés API pour VerifDoc

## Configuration Actuelle

- **Agent 1 (Principal)** : OpenAI GPT-4o
- **Agent 2 (Secondaire)** : Google Gemini

## Clés API Configurées

### OpenAI (Agent 1)
- Clé API : `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`
- Modèle : GPT-4o
- Provider : OpenAI

### Gemini (Agent 2)
- Clé API : `AIzaSyB-k7NdhgKwErZvI4epYRAUkyJuuedRQVQ`
- Modèle : gemini-pro-vision
- Provider : Google Gemini

## Création du fichier .env

**IMPORTANT** : Créez le fichier `.env` dans le dossier `backend/` :

### Option 1 : Utiliser le script automatique
```bash
cd backend
node scripts/create-env-file.js
```

### Option 2 : Créer manuellement

Créez `backend/.env` avec ce contenu :

```env
# Agent 1 - OpenAI GPT-4o
AGENT_1_API_KEY=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
AGENT_1_PROVIDER=openai
AGENT_1_BASE_URL=https://api.openai.com
AGENT_1_AUTH_TYPE=bearer

# Agent 2 - Gemini
AGENT_2_API_KEY=AIzaSyB-k7NdhgKwErZvI4epYRAUkyJuuedRQVQ
AGENT_2_PROVIDER=gemini
AGENT_2_BASE_URL=https://generativelanguage.googleapis.com
AGENT_2_AUTH_TYPE=api_key

# OpenAI Global
OPENAI_API_KEY=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
OPENAI_MODEL=gpt-4o

# Gemini Global
GEMINI_API_KEY=AIzaSyB-k7NdhgKwErZvI4epYRAUkyJuuedRQVQ
GEMINI_MODEL=gemini-pro-vision

# Configuration globale
API_DEFAULT_TIMEOUT=30000
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY=1000
```

## Fonctionnement

### Agent 1 (OpenAI GPT-4o)
- Utilise GPT-4o avec vision pour l'analyse approfondie
- Analyse les documents avec une précision élevée
- Détecte les manipulations et falsifications
- Poids dans la fusion : 60%

### Agent 2 (Gemini)
- Utilise Gemini Pro Vision pour validation croisée
- Analyse complémentaire pour vérification
- Détecte des anomalies supplémentaires
- Poids dans la fusion : 40%

## Vérification

Vérifiez que tout est bien configuré :

```bash
# Vérifier le statut des clés API
curl http://localhost:3001/agents/api-keys/status

# Vérifier la configuration des agents
curl http://localhost:3001/agents/config
```

## Utilisation

Les agents utilisent automatiquement leurs APIs respectives lors de l'analyse :

```bash
POST http://localhost:3001/analyze
```

Les résultats incluront :
- `openaiAnalysis` pour l'agent 1 (si OpenAI utilisé)
- `geminiAnalysis` pour l'agent 2 (si Gemini utilisé)

## Sécurité

⚠️ **IMPORTANT** :
- Le fichier `.env` ne doit JAMAIS être commité dans Git
- Assurez-vous que `.env` est dans votre `.gitignore`
- Gardez vos clés API secrètes et ne les partagez pas publiquement

## Fallback

Si une API échoue, l'agent bascule automatiquement sur l'analyse locale pour garantir la continuité du service.





