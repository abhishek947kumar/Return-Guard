# ReturnGuard 1-Click Startup Script for Windows PowerShell
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🛡️  Starting ReturnGuard (Autonomous ReAct Refund Agent)  " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Backend in Background
Write-Host "[1/2] Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

# 2. Wait 2 seconds for backend to bind
Start-Sleep -Seconds 2

# 3. Start Frontend
Write-Host "[2/2] Launching Vite Frontend on http://127.0.0.1:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev -- --host 127.0.0.1 --port 5173"

Write-Host "✅ Both services launched!" -ForegroundColor Green
Write-Host "👉 Web App: http://127.0.0.1:5173" -ForegroundColor White
Write-Host "👉 API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
