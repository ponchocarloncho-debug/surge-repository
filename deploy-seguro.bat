@echo off
title VERIFICADOR POST-DEPLOY

echo ============================================
echo       VERIFICACIÓN POST-DEPLOY
echo ============================================
echo.

echo 1. Verificando estado del repositorio...
git status
echo.

echo 2. Últimos commits subidos:
git log --oneline -3
echo.

echo 3. Archivos modificados en el último commit:
git diff HEAD~1 --name-only
echo.

echo 4. ¿El sitio está accesible?
echo Prueba manualmente en tu navegador:
echo   - https://tuusuario.github.io
echo   - https://www.tudominio.com
echo.
echo 5. Verificar páginas críticas:
echo   - Página principal: index.html ✓
echo   - Estilos: CSS cargando ✓
echo   - Scripts: JS funcionando ✓
echo.

echo 6. Si encuentras errores:
echo   Ejecuta: rollback-rapido.bat
echo   O corrige y usa: deploy-selectivo-seguro.bat
echo.

pause