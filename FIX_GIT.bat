@echo off
echo ===================================================
echo   NETTOYAGE GIT & ENVOI FORCÉ
echo ===================================================
echo.
echo 1. Nettoyage de l'index Git (Cela peut prendre qq secondes)...
git rm -r --cached .
echo.

echo 2. Re-ajout des fichiers propres...
git add .
echo.

echo 3. Sauvegarde...
git commit -m "Fix: Ignore node_modules and update dependencies"
echo.

echo 4. Envoi vers GitHub...
git push -u origin main
echo.

echo TERMINÉ ! 
echo Regardez votre Render Dashboard.
echo.
pause
