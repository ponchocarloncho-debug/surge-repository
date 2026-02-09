@echo off
echo ================================
echo   Deploy GitHub Pages
echo ================================

git add .
git commit -m "Auto deploy"
git push

echo ================================
echo   Deploy completado
echo ================================
pause
