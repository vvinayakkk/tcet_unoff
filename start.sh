#!/bin/bash

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to start a service
start_service() {
    local name=$1
    local command=$2
    local port=$3
    
    echo "Starting $name..."
    if check_port $port; then
        echo "Port $port is already in use. Skipping $name."
    else
        $command &
        echo "$name started on port $port"
    fi
}

# Create virtual environments if they don't exist
if [ ! -d "notion/venv" ]; then
    echo "Setting up Notion backend virtual environment..."
    cd notion
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

if [ ! -d "rl_agent/venv" ]; then
    echo "Setting up RL Agent virtual environment..."
    cd rl_agent
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Start all services
start_service "Frontend" "cd client && npm run dev" 5173
start_service "Notion Backend" "cd notion && source venv/bin/activate && flask run" 5000
start_service "RL Agent" "cd rl_agent && source venv/bin/activate && python integration.py" 5001

echo "All services started! Access the application at http://localhost:5173" 