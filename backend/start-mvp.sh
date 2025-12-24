#!/bin/bash

echo "========================================"
echo "  VerifDoc MVP - Démarrage"
echo "========================================"
echo ""

cd "$(dirname "$0")"

echo "[1/3] Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances..."
    npm install
else
    echo "Dépendances déjà installées."
fi

echo ""
echo "[2/3] Vérification du fichier .env..."
if [ ! -f ".env" ]; then
    echo "ATTENTION: Le fichier .env n'existe pas!"
    echo ""
    echo "Veuillez créer le fichier .env avec vos clés API."
    echo "Voir START_MVP.md pour les instructions."
    echo ""
    exit 1
else
    echo "Fichier .env trouvé."
fi

echo ""
echo "[3/3] Démarrage du serveur..."
echo ""
echo "========================================"
echo "  Serveur en cours de démarrage..."
echo "  Ouvrez http://localhost:3001/mvp"
echo "========================================"
echo ""

node server.js




