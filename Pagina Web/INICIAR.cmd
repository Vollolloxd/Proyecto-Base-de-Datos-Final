@echo off
REM Inicia la aplicacion web de Vina La Alborada en http://localhost:3001
cd /d "%~dp0backend"
if not exist node_modules (
    echo Instalando dependencias del backend...
    call npm install
)
if not exist "..\frontend\dist\index.html" (
    echo Compilando la aplicacion web...
    pushd "..\frontend"
    call npm install
    call npm run build
    popd
)
start "" http://localhost:3001
node src\servidor.js
pause
