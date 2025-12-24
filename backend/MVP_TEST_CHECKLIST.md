# ✅ Checklist de Test MVP - VerifDoc

## 🎯 Objectif
Tester toutes les fonctionnalités validées du système VerifDoc

## 📋 Préparation

### Avant de commencer
- [ ] Fichier `.env` créé dans `backend/` avec les clés API
- [ ] Dépendances installées (`npm install` dans `backend/`)
- [ ] Dossier `uploads/` existe dans `backend/`
- [ ] Serveur démarré (`npm start` dans `backend/`)

### Vérification du serveur
- [ ] Serveur répond sur `http://localhost:3001`
- [ ] Endpoint `/agents/config` accessible
- [ ] Endpoint `/agents/api-keys/status` accessible

## 🧪 Tests à Effectuer

### Test 1: Configuration des Agents
**URL**: `http://localhost:3001/agents/config`

**Vérifier**:
- [ ] 2 agents configurés
- [ ] Agent 1: OpenAI GPT-4o
- [ ] Agent 2: Google Gemini
- [ ] Mode d'exécution: parallel
- [ ] Poids de fusion: 60% / 40%

### Test 2: Statut des Clés API
**URL**: `http://localhost:3001/agents/api-keys/status`

**Vérifier**:
- [ ] Agent 1: clé API configurée
- [ ] Agent 2: clé API configurée
- [ ] Types d'authentification corrects

### Test 3: Interface MVP
**URL**: `http://localhost:3001/mvp`

**Vérifier**:
- [ ] Interface s'affiche correctement
- [ ] Upload de fichier fonctionne
- [ ] Drag & drop fonctionne
- [ ] Bouton "Analyser" s'active après sélection

### Test 4: Analyse avec Document Original
**Document**: Image JPG/PNG originale

**Vérifier**:
- [ ] Analyse se lance (5-15 secondes)
- [ ] Verdict: DOCUMENT VALIDE ou SUSPECT
- [ ] Score de confiance > 50
- [ ] Résultats des 2 agents affichés
- [ ] Section ELA affichée (même si vide)
- [ ] Statistiques affichées correctement

### Test 5: Analyse avec Document Modifié
**Document**: Image JPG/PNG retouchée/modifiée

**Vérifier**:
- [ ] Verdict: DOCUMENT SUSPECT ou FALSIFIÉ
- [ ] Score de confiance réduit
- [ ] Anomalies détectées listées
- [ ] Anomalies ELA détectées (si modifications visuelles)
- [ ] Types d'anomalies ELA corrects (COPY/MOVE/ADD)
- [ ] Régions suspectes identifiées

### Test 6: Analyse avec Document Falsifié
**Document**: Image clairement falsifiée

**Vérifier**:
- [ ] Verdict: DOCUMENT FALSIFIÉ
- [ ] Score de confiance < 50
- [ ] Plusieurs anomalies détectées
- [ ] Anomalies ELA nombreuses
- [ ] Détails des régions affichés

### Test 7: Analyse ELA Spécifique
**Document**: Image avec modifications visuelles

**Vérifier**:
- [ ] Section ELA s'affiche
- [ ] Anomalies ELA listées avec types
- [ ] Confiance affichée pour chaque anomalie
- [ ] Régions affichées (coordonnées x, y, width, height)
- [ ] Niveaux d'erreur affichés
- [ ] Codes couleur corrects (COPY=bleu, MOVE=jaune, ADD=rouge)

### Test 8: Résultats par Agent
**Vérifier**:
- [ ] Carte pour Agent 1 (OpenAI) affichée
- [ ] Carte pour Agent 2 (Gemini) affichée
- [ ] Verdict de chaque agent affiché
- [ ] Score de chaque agent affiché
- [ ] Nombre d'anomalies par agent affiché
- [ ] Nombre d'anomalies ELA par agent affiché

### Test 9: Fusion des Résultats
**Vérifier**:
- [ ] Score final = fusion pondérée (60% Agent 1 + 40% Agent 2)
- [ ] Verdict final basé sur score fusionné
- [ ] Toutes les anomalies collectées
- [ ] Toutes les anomalies ELA collectées

### Test 10: Rapport HTML
**URL**: `http://localhost:3001/last-report.html`

**Vérifier**:
- [ ] Rapport généré après analyse
- [ ] Section ELA dans le rapport
- [ ] Anomalies ELA affichées avec détails
- [ ] Explication ELA incluse

## 🔍 Points d'Attention

### Performance
- [ ] Analyse complète prend < 30 secondes
- [ ] Pas d'erreur de timeout
- [ ] Interface reste responsive

### Erreurs
- [ ] Pas d'erreurs dans la console serveur
- [ ] Pas d'erreurs dans la console navigateur
- [ ] Messages d'erreur clairs si problème

### Compatibilité
- [ ] Fonctionne avec JPG
- [ ] Fonctionne avec PNG
- [ ] PDF (peut nécessiter conversion)

## 📊 Résultats Attendus

### Document Original
- Verdict: VALIDE ou SUSPECT
- Score: 70-100
- Anomalies: 0-2
- ELA: 0-1 anomalies mineures

### Document Modifié
- Verdict: SUSPECT
- Score: 50-74
- Anomalies: 2-5
- ELA: 1-3 anomalies

### Document Falsifié
- Verdict: FALSIFIÉ
- Score: 0-49
- Anomalies: 5+
- ELA: 3+ anomalies

## ✅ Validation Finale

- [ ] Tous les tests passent
- [ ] Interface MVP fonctionnelle
- [ ] Analyse complète opérationnelle
- [ ] Résultats cohérents et explicables
- [ ] Documentation consultée et comprise

## 🎉 MVP Validé!

Si tous les tests passent, votre MVP est **PRODUCTION READY**!




