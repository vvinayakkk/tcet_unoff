@echo off

:: Function to check if a port is in use
:check_port
netstat -an | find ":%1" | find "LISTENING" >nul
if errorlevel 1 (
    exit /b 1
) else (
    exit /b 0
)

:: Create virtual environments if they don't exist
if not exist "notion\venv" (
    echo Setting up Notion backend virtual environment...
    cd notion
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
    cd ..
)

if not exist "rl_agent\venv" (
    echo Setting up RL Agent virtual environment...
    cd rl_agent
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
    cd ..
)

:: Start Frontend
start cmd /k "cd client && npm run dev"

:: Start Notion Backend
start cmd /k "cd notion && call venv\Scripts\activate && flask run"

:: Start RL Agent
start cmd /k "cd rl_agent && call venv\Scripts\activate && python integration.py"

echo All services started! Access the application at http://localhost:5173 