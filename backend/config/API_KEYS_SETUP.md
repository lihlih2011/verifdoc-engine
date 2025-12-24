# Configuration des Clés API pour les Agents

Ce document explique comment configurer les clés API pour les 2 agents VerifDoc.

## Structure des Fichiers

- `api-keys.config.js` : Charge les clés API depuis les variables d'environnement
- `.env` : Fichier contenant vos clés API (à créer, ne pas commiter dans Git)

## Configuration

### Étape 1 : Créer le fichier .env

Créez un fichier `.env` à la racine du dossier `backend/` avec le contenu suivant :

```env
# ============================================
# Agent 1 - Agent Principal
# ============================================
AGENT_1_API_KEY=votre_cle_api_agent_1
AGENT_1_API_SECRET=votre_secret_api_agent_1
AGENT_1_AUTH_TYPE=api_key
AGENT_1_API_VERSION=v1
AGENT_1_BASE_URL=

# ============================================
# Agent 2 - Agent Secondaire
# ============================================
AGENT_2_API_KEY=votre_cle_api_agent_2
AGENT_2_API_SECRET=votre_secret_api_agent_2
AGENT_2_AUTH_TYPE=api_key
AGENT_2_API_VERSION=v1
AGENT_2_BASE_URL=

# ============================================
# Configuration globale des API
# ============================================
API_DEFAULT_TIMEOUT=30000
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY=1000
```

### Étape 2 : Remplir vos clés API

Remplacez les valeurs `votre_cle_api_agent_1`, `votre_cle_api_agent_2`, etc. par vos vraies clés API.

### Étape 3 : Vérifier la configuration

Vous pouvez vérifier que les clés sont bien chargées en appelant l'endpoint :

```
GET http://localhost:3001/agents/config
```

## Variables d'Environnement Disponibles

### Agent 1
- `AGENT_1_API_KEY` : Clé API principale pour l'agent 1
- `AGENT_1_API_SECRET` : Secret API pour l'agent 1 (optionnel)
- `AGENT_1_AUTH_TYPE` : Type d'authentification (`api_key`, `bearer`, `oauth`)
- `AGENT_1_API_VERSION` : Version de l'API
- `AGENT_1_BASE_URL` : URL de base pour les appels API externes (optionnel)

### Agent 2
- `AGENT_2_API_KEY` : Clé API principale pour l'agent 2
- `AGENT_2_API_SECRET` : Secret API pour l'agent 2 (optionnel)
- `AGENT_2_AUTH_TYPE` : Type d'authentification (`api_key`, `bearer`, `oauth`)
- `AGENT_2_API_VERSION` : Version de l'API
- `AGENT_2_BASE_URL` : URL de base pour les appels API externes (optionnel)

### Configuration Globale
- `API_DEFAULT_TIMEOUT` : Timeout par défaut en millisecondes (défaut: 30000)
- `API_RETRY_ATTEMPTS` : Nombre de tentatives en cas d'échec (défaut: 3)
- `API_RETRY_DELAY` : Délai entre les tentatives en millisecondes (défaut: 1000)

## Sécurité

⚠️ **IMPORTANT** : 
- Ne commitez JAMAIS le fichier `.env` dans Git
- Ajoutez `.env` à votre `.gitignore`
- Gardez vos clés API secrètes et ne les partagez pas

## Utilisation dans le Code

Les clés API sont automatiquement chargées et disponibles dans :
- `backend/config/api-keys.config.js` : Configuration centralisée
- `backend/config/agents.config.js` : Intégrées dans la config des agents
- `backend/services/agent.js` : Accessibles via `this.apiKeys`

## Exemple d'Utilisation

```javascript
// Dans agent.js, les clés sont disponibles via :
if (this.apiKeys && this.apiKeys.apiKey) {
  // Utiliser this.apiKeys.apiKey pour authentifier les requêtes
  const headers = {
    'Authorization': `Bearer ${this.apiKeys.apiKey}`,
    ...this.apiKeys.headers
  };
}
```





