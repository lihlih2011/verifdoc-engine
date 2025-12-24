@echo off
echo ===================================================
echo   CONFIGURATION & DEPLOIEMENT FORCE (ULTIME)
echo ===================================================
echo.
echo 1. Configuration de l'identite Git (Interne)...
git config user.email "deploy@verifdoc.ai"
git config user.name "VerifDoc Deployer"

echo.
echo 2. Sauvegarde Forcee...
git add .
git commit -m "Deployment Release (Force Push)"

echo.
echo 3. ENVOI FORCE VERS GITHUB...
echo (Cela va ecraser la version distante pour imposer VOTRE version locale)
git push -u origin main --force

echo.
echo ===================================================
echo SI VOUS VOYEZ "Everything up-to-date" OU "branch set up"...
echo ... ALORS C'EST GAGNE !
echo ===================================================
echo.
pause
