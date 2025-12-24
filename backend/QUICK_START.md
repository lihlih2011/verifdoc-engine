# 🚀 Démarrage Rapide MVP - VerifDoc

## ⚡ 3 Étapes pour Tester

### 1️⃣ Créer le fichier .env

Créez le fichier `backend/.env` avec ce contenu:

```env
AGENT_1_API_KEY=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
AGENT_1_PROVIDER=openai
AGENT_1_BASE_URL=https://api.openai.com
AGENT_1_AUTH_TYPE=bearer

AGENT_2_API_KEY=AIzaSyB-k7NdhgKwErZvI4epYRAUkyJuuedRQVQ
AGENT_2_PROVIDER=gemini
AGENT_2_BASE_URL=https://generativelanguage.googleapis.com
AGENT_2_AUTH_TYPE=api_key

OPENAI_API_KEY=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
OPENAI_MODEL=gpt-4o

GEMINI_API_KEY=AIzaSyB-k7NdhgKwErZvI4epYRAUkyJuuedRQVQ
GEMINI_MODEL=gemini-pro-vision
```

### 2️⃣ Démarrer le serveur

```bash
cd backend
npm start
```

Le serveur démarre sur: **http://localhost:3001**

### 3️⃣ Tester avec l'interface MVP

Ouvrez votre navigateur:
```
http://localhost:3001/test-mvp.html
```

Ou:
```
http://localhost:3001/test
```

## 🎯 Comment Tester

1. **Téléversez un document** (JPG, PNG, PDF)
2. **Cliquez sur "Analyser"**
3. **Regardez les résultats**:
   - Verdict (VALIDE/SUSPECT/FALSIFIÉ)
   - Score de confiance (0-100)
   - Anomalies détectées
   - Résultats de chaque agent

## 📊 Interprétation

- **Score 75-100**: Document VALIDE ✅
- **Score 50-74**: Document SUSPECT ⚠️
- **Score 0-49**: Document FALSIFIÉ ❌

## ✅ Votre MVP est Prêt!

Tout est configuré. Il ne reste qu'à créer le `.env` et démarrer le serveur!




