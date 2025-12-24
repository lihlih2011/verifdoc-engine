@echo off
echo ========================================
echo   VerifDoc MVP - Demarrage
echo ========================================
echo.

cd /d %~dp0

echo [1/3] Verification des dependances...
if not exist "node_modules" (
    echo Installation des dependances...
    call npm install
) else (
    echo Dependances deja installees.
)

echo.
echo [2/3] Verification du fichier .env...
if not exist ".env" (
    echo ATTENTION: Le fichier .env n'existe pas!
    echo.
    echo Veuillez creer le fichier .env avec vos cles API.
    echo Voir START_MVP.md pour les instructions.
    echo.
    pause
    exit /b 1
) else (
    echo Fichier .env trouve.
)

echo.
echo [3/3] Demarrage du serveur...
echo.
echo ========================================
echo   Serveur en cours de demarrage...
echo   Ouvrez http://localhost:3001/mvp
echo ========================================
echo.

node server.js




