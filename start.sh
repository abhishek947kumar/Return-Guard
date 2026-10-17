#!/bin/bash
# ReturnGuard 1-Click Startup Script for Linux & macOS

echo "=========================================================="
echo "🛡️  Starting ReturnGuard (Autonomous ReAct Refund Agent)  "
echo "=========================================================="

# 1. Start Backend
echo "[1/2] Launching FastAPI Backend on http://127.0.0.1:8000..."
python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

sleep 2

# 2. Start Frontend
echo "[2/2] Launching Vite Frontend on http://127.0.0.1:5173..."
cd frontend && npm run dev -- --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!

echo "✅ Both services running in background!"
echo "👉 Web App:  http://127.0.0.1:5173"
echo "👉 API Docs: http://127.0.0.1:8000/docs"

wait $BACKEND_PID $FRONTEND_PID
