@echo off
title Sistema Libreria - Lanzador
color 0A
echo ===============================================
echo      INICIANDO SISTEMA DE LIBRERIA
echo ===============================================
echo.
echo 1. Iniciando el servidor (Backend)...
start /min "Backend Libreria" cmd /k "cd backend && node index.js"

echo 2. Esperando conexion a base de datos...
timeout /t 2 /nobreak >nul

echo 3. Iniciando la interfaz (Frontend)...
start /min "Frontend Libreria" cmd /k "cd frontend && npm run dev"

echo 4. Abriendo navegador...
timeout /t 4 /nobreak >nul
start http://localhost:5173

echo.
echo ===============================================
echo      SISTEMA INICIADO CORRECTAMENTE
echo ===============================================
echo.
echo NOTA: No cierre las ventanas negras minimizadas
echo mientras este usando el sistema.
echo.
echo Puede minimizar esta ventana tambien.
pause
