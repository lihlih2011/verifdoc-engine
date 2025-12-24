# Tests VerifDoc

## Structure des Tests

- `agents.test.js` - Tests des agents
- `config.test.js` - Tests de configuration
- `services.test.js` - Tests des services
- `integration.test.js` - Tests d'intégration
- `api.test.js` - Tests de l'API (nécessite le serveur démarré)

## Exécution des Tests

### Installer Jest (si pas déjà installé)
```bash
npm install --save-dev jest
```

### Lancer tous les tests
```bash
npm test
```

### Lancer les tests en mode watch
```bash
npm run test:watch
```

### Générer un rapport de couverture
```bash
npm run test:coverage
```

## Tests Disponibles

### Tests Unitaires
- ✅ Configuration des agents
- ✅ Instanciation des services
- ✅ Validation de la configuration

### Tests d'Intégration
- ✅ Fusion des résultats
- ✅ Priorités des agents
- ✅ Mode d'exécution

### Tests API
- ⚠️ Nécessitent que le serveur soit démarré
- Endpoint `/agents/config`
- Endpoint `/agents/api-keys/status`

## Notes

Les tests API nécessitent que le serveur soit démarré sur `http://localhost:3001`. 
Si le serveur n'est pas démarré, ces tests seront ignorés.




