@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Deploy to GitHub Pages
echo ========================================
echo.

:: Verificar si estamos en un repositorio Git
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo [ERROR] No estas en un repositorio Git.
    echo Ejecuta este script desde la carpeta de tu proyecto.
    echo.
    pause
    exit /b 1
)

echo [OK] Repositorio Git detectado
echo.

:: Verificar si hay cambios
git diff --quiet --exit-code
set has_unstaged_changes=%errorlevel%

git diff --cached --quiet --exit-code
set has_staged_changes=%errorlevel%

if %has_unstaged_changes% equ 0 if %has_staged_changes% equ 0 (
    echo [INFO] No hay cambios para desplegar.
    echo.
    pause
    exit /b 0
)

echo [OK] Se detectaron cambios
echo.

:: Mostrar archivos modificados
echo ----------------------------------------
echo Archivos modificados:
echo ----------------------------------------
git status --short
echo ----------------------------------------
echo.

:: Solicitar confirmacion
set /p confirm=Deseas continuar con el deploy? (S/N): 
if /i not "%confirm%"=="S" (
    echo.
    echo Deploy cancelado.
    pause
    exit /b 0
)

echo.
echo ========================================
echo   Iniciando deploy...
echo ========================================
echo.

:: Mensaje de commit
set /p commit_msg=Mensaje de commit (Enter = 'Auto deploy'): 
if "%commit_msg%"=="" set commit_msg=Auto deploy

:: Paso 1: Add
echo [1/4] Anadiendo archivos...
git add .
if errorlevel 1 (
    echo [ERROR] Fallo al anadir archivos.
    pause
    exit /b 1
)
echo [OK] Archivos anadidos
echo.

:: Paso 2: Commit
echo [2/4] Creando commit...
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo [ERROR] Fallo al crear commit.
    pause
    exit /b 1
)
echo [OK] Commit creado
echo.

:: Paso 3: Verificar remoto
echo [3/4] Verificando conexion...
git remote -v | findstr "origin" >nul
if errorlevel 1 (
    echo [ERROR] No se encontro el remoto 'origin'.
    pause
    exit /b 1
)
echo [OK] Remoto configurado
echo.

:: Paso 4: Push
echo [4/4] Subiendo a GitHub...
git push
if errorlevel 1 (
    echo.
    echo [ERROR] Fallo al hacer push.
    echo.
    echo Posibles causas:
    echo - Sin permisos en el repositorio
    echo - Conflictos con el remoto
    echo - Sin conexion a Internet
    echo.
    echo Intenta: git pull
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deploy completado exitosamente!
echo ========================================
echo.
echo Tu sitio se actualizara en GitHub Pages
echo en unos momentos.
echo.
pause
