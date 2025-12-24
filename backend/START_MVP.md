# 🚀 Démarrage du MVP Complet - VerifDoc

## ⚡ Démarrage Rapide

### 1. Créer le fichier .env (si pas déjà fait)

Créez `backend/.env` avec vos clés API (voir `QUICK_START.md`)

### 2. Installer les dépendances

```bash
cd backend
npm install
```

### 3. Démarrer le serveur

```bash
cd backend
npm start
```

Vous verrez: `✅ VerifDoc API opérationnelle sur http://localhost:3001`

### 4. Ouvrir l'interface MVP

Ouvrez votre navigateur sur:
```
http://localhost:3001/mvp
```

Ou:
```
http://localhost:3001/mvp-complete.html
```

## 🧪 Ce qui est testé

### ✅ 2 Agents IA
- **Agent 1**: OpenAI GPT-4o (60% poids)
- **Agent 2**: Google Gemini (40% poids)
- Analyse en parallèle
- Fusion pondérée des résultats

### ✅ Error Level Analysis (ELA)
- Détection COPY/MOVE/ADD
- Analyse de compression
- Régions suspectes identifiées
- Niveaux de confiance

### ✅ Analyse Structurelle
- Métadonnées
- Compression
- Structure du document

### ✅ Analyse de Contenu
- OCR et extraction de texte
- Vérification de cohérence
- Détection de modifications logiques

## 📊 Interface MVP

L'interface affiche:
- **Score de confiance** (0-100)
- **Verdict** (VALIDE/SUSPECT/FALSIFIÉ)
- **Anomalies détectées** (liste complète)
- **Anomalies ELA** (avec types et régions)
- **Résultats par agent** (détails de chaque agent)
- **Statistiques** (compteurs visuels)

## 🎯 Scénarios de Test

### Test 1: Document Original
- Téléversez un document original
- **Attendu**: Verdict VALIDE, Score > 75, Peu d'anomalies

### Test 2: Document Modifié
- Téléversez un document retouché
- **Attendu**: Verdict SUSPECT, Score 50-74, Anomalies ELA détectées

### Test 3: Document Falsifié
- Téléversez un document clairement falsifié
- **Attendu**: Verdict FALSIFIÉ, Score < 50, Plusieurs anomalies ELA

## 🔍 Types d'Anomalies ELA

- **COPY** (📋): Contenu dupliqué détecté
- **MOVE** (↔️): Contenu déplacé détecté
- **ADD** (➕): Nouveau contenu ajouté
- **UNKNOWN** (⚠️): Anomalie de compression suspecte

## 📝 Notes

- Les images (JPG, PNG) sont analysées avec ELA
- Les PDFs nécessitent conversion (à venir)
- L'analyse prend 5-15 secondes selon la taille
- Les agents IA peuvent être lents au premier appel

## ✅ Checklist

- [ ] Fichier `.env` créé avec les clés API
- [ ] Dépendances installées (`npm install`)
- [ ] Serveur démarré (`npm start`)
- [ ] Interface MVP ouverte (`http://localhost:3001/mvp`)
- [ ] Document de test prêt

## 🎉 Prêt à Tester!

Votre MVP complet est prêt. Tous les composants sont intégrés et fonctionnels!




