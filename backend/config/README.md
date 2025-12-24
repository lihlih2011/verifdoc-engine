# Configuration des Agents VerifDoc

Ce dossier contient la configuration des agents d'analyse pour VerifDoc.

## Structure

- `agents.config.js` : Configuration principale des 2 agents d'analyse

## Agents Configurés

### Agent 1 - Agent Principal
- **ID**: `agent-1`
- **Priorité**: 1 (le plus prioritaire)
- **Description**: Agent principal pour l'analyse approfondie des documents
- **Caractéristiques**:
  - Analyse approfondie activée
  - Vérification complète (métadonnées, compression, structure)
  - Seuil de confiance: 70
  - Seuil d'anomalies: 3

### Agent 2 - Agent Secondaire
- **ID**: `agent-2`
- **Priorité**: 2
- **Description**: Agent secondaire pour validation et vérification croisée
- **Caractéristiques**:
  - Analyse standard (non approfondie)
  - Vérification partielle (métadonnées et structure uniquement)
  - Seuil de confiance: 75 (plus strict)
  - Seuil d'anomalies: 2

## Configuration Globale

- **Mode d'exécution**: `parallel` (les agents s'exécutent en parallèle)
- **Mode de fusion**: `weighted` (fusion pondérée des résultats)
- **Poids de fusion**:
  - Agent 1: 60%
  - Agent 2: 40%

## Modification de la Configuration

Pour modifier les paramètres des agents, éditez le fichier `agents.config.js` :

```javascript
{
  id: "agent-1",
  enabled: true,  // Activer/désactiver l'agent
  config: {
    deepAnalysis: true,  // Activer l'analyse approfondie
    confidenceThreshold: 70,  // Modifier le seuil de confiance
    // ... autres paramètres
  }
}
```

## Endpoints API

- `GET /agents/config` : Consulter la configuration des agents
- `POST /analyze` : Analyser un document avec les agents configurés





