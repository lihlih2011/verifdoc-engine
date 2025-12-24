# Configuration de Gemini API pour VerifDoc

## Clé API Configurée

Votre clé API Gemini a été configurée :
```
AIzaSyB-k7NdhgKwErZvI4epYRAUkyJuuedRQVQ
```

## Création du fichier .env

**IMPORTANT** : Créez manuellement le fichier `.env` dans le dossier `backend/` avec le contenu suivant :

```env
# Configuration des clés API pour les agents VerifDoc

# ============================================
# Agent 1 - Agent Principal (Gemini)
# ============================================
AGENT_1_API_KEY=AIzaSyB-k7NdhgKwErZvI4epYRAUkyJuuedRQVQ
AGENT_1_API_SECRET=
AGENT_1_AUTH_TYPE=api_key
AGENT_1_API_VERSION=v1
AGENT_1_BASE_URL=https://generativelanguage.googleapis.com
AGENT_1_PROVIDER=gemini

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
# Configuration Gemini spécifique
# ============================================
GEMINI_API_KEY=AIzaSyB-k7NdhgKwErZvI4epYRAUkyJuuedRQVQ
GEMINI_MODEL=gemini-pro-vision
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models
```

## Fonctionnalités

Une fois le fichier `.env` créé, les 2 agents utiliseront automatiquement Gemini API pour :

1. **Analyse approfondie des documents** avec vision IA
2. **Détection d'anomalies** via analyse intelligente
3. **Verdict automatisé** basé sur l'analyse Gemini
4. **Fallback automatique** vers l'analyse locale si Gemini échoue

## Vérification

Pour vérifier que tout est bien configuré :

1. **Vérifier le statut des clés API** :
   ```bash
   curl http://localhost:3001/agents/api-keys/status
   ```

2. **Vérifier la configuration des agents** :
   ```bash
   curl http://localhost:3001/agents/config
   ```

## Utilisation

Les agents utiliseront automatiquement Gemini lors de l'analyse de documents via :
```bash
POST http://localhost:3001/analyze
```

Les résultats incluront un champ `geminiAnalysis` indiquant que Gemini a été utilisé.

## Sécurité

⚠️ **IMPORTANT** :
- Le fichier `.env` ne doit JAMAIS être commité dans Git
- Assurez-vous que `.env` est dans votre `.gitignore`
- Gardez votre clé API secrète





