@echo off
echo ==========================================================
echo    Starting ReturnGuard (Autonomous ReAct Refund Agent)   
echo ==========================================================

start "ReturnGuard Backend" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 2 /nobreak >nul
start "ReturnGuard Frontend" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo Services launched!
echo Web App: http://127.0.0.1:5173
echo API Docs: http://127.0.0.1:8000/docs
