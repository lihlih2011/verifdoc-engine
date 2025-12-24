# 🚀 Guide MVP - VerifDoc

## Objectif
Tester la détection de documents falsifiés avec 2 agents IA (OpenAI GPT-4o + Gemini)

## 🎯 Démarrage Rapide

### 1. Créer le fichier .env
```bash
cd backend
node scripts/create-env-file.js
```

### 2. Démarrer le serveur
```bash
cd backend
npm start
```

Le serveur démarre sur: `http://localhost:3001`

### 3. Accéder à l'interface de test
Ouvrez votre navigateur et allez sur:
```
http://localhost:3001/test-mvp.html
```

## 📋 Comment Tester

### Étape 1: Préparer vos documents de test
- **Document valide**: Un document original (photo d'identité, contrat, etc.)
- **Document suspect**: Un document avec des modifications mineures
- **Document falsifié**: Un document clairement modifié/manipulé

### Étape 2: Tester avec l'interface MVP
1. Ouvrez `http://localhost:3001/test-mvp.html`
2. Cliquez sur "Choisir un fichier" ou glissez-déposez un document
3. Cliquez sur "Analyser le document"
4. Attendez les résultats (les 2 agents IA analysent en parallèle)

### Étape 3: Analyser les résultats
- **Verdict**: VALIDE / SUSPECT / FALSIFIÉ
- **Score de confiance**: 0-100
- **Anomalies détectées**: Liste des problèmes trouvés
- **Résultats par agent**: Voir ce que chaque agent a détecté

## 🔍 Ce qui est testé

### Agent 1 (OpenAI GPT-4o)
- Analyse approfondie avec vision IA
- Détection de manipulations visuelles
- Analyse de la structure du document
- Poids: 60% dans la décision finale

### Agent 2 (Gemini)
- Validation croisée
- Détection d'anomalies complémentaires
- Vérification de cohérence
- Poids: 40% dans la décision finale

### Fusion des résultats
Les résultats des 2 agents sont fusionnés avec pondération:
- Score final = (Score Agent 1 × 0.6) + (Score Agent 2 × 0.4)
- Anomalies = Union de toutes les anomalies détectées
- Verdict = Basé sur le score fusionné

## 📊 Interprétation des Résultats

### Score 75-100: DOCUMENT VALIDE ✅
- Le document semble authentique
- Peu ou pas d'anomalies détectées
- Les deux agents sont d'accord

### Score 50-74: DOCUMENT SUSPECT ⚠️
- Des anomalies ont été détectées
- Nécessite une vérification manuelle
- Les agents peuvent avoir des avis différents

### Score 0-49: DOCUMENT FALSIFIÉ ❌
- Plusieurs anomalies majeures détectées
- Forte probabilité de falsification
- Les agents sont généralement d'accord

## 🧪 Scénarios de Test Recommandés

### Test 1: Document Original
- **Attendu**: Verdict VALIDE, Score élevé (>75)
- **Vérifie**: Que le système ne génère pas de faux positifs

### Test 2: Document Retouché
- **Attendu**: Verdict SUSPECT ou FALSIFIÉ, Score moyen/faible
- **Vérifie**: Détection des manipulations visuelles

### Test 3: Document avec Métadonnées Modifiées
- **Attendu**: Verdict SUSPECT, Anomalies sur métadonnées
- **Vérifie**: Détection des incohérences dans les métadonnées

### Test 4: Document Complètement Falsifié
- **Attendu**: Verdict FALSIFIÉ, Score faible (<50)
- **Vérifie**: Détection des falsifications majeures

## 🔧 API de Test (Alternative)

Vous pouvez aussi tester directement via l'API:

```bash
# Tester avec curl
curl -X POST -F "file=@votre-document.jpg" http://localhost:3001/analyze

# Vérifier la configuration
curl http://localhost:3001/agents/config

# Vérifier le statut des clés API
curl http://localhost:3001/agents/api-keys/status
```

## 📝 Notes Importantes

1. **Premier test**: Les agents peuvent être lents au premier appel (chargement des modèles)
2. **Clés API**: Assurez-vous que vos clés API sont valides
3. **Formats**: Supporte JPG, PNG, PDF
4. **Taille**: Les fichiers trop volumineux peuvent prendre du temps

## 🐛 Dépannage

### Erreur: "Clé API non configurée"
- Vérifiez que le fichier `.env` existe dans `backend/`
- Vérifiez que les clés API sont correctes

### Erreur: "Aucun fichier reçu"
- Vérifiez que vous avez bien sélectionné un fichier
- Vérifiez que le format est supporté

### Les résultats sont toujours "VALIDE"
- C'est normal si vous testez avec de vrais documents originaux
- Testez avec des documents modifiés pour voir la détection

## ✅ Checklist MVP

- [x] Interface de test créée
- [x] 2 agents configurés (OpenAI + Gemini)
- [x] Fusion des résultats implémentée
- [x] API fonctionnelle
- [ ] Fichier .env créé (à faire)
- [ ] Serveur démarré (à faire)
- [ ] Tests avec documents réels (à faire)

## 🎉 Prêt pour les Tests!

Votre MVP est prêt. Suivez les étapes ci-dessus pour commencer à tester!




