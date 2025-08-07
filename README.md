# 🚀Giga Brain - AI-Powered Productivity Suite
<img width="1024" height="1024" alt="image" src="https://github.com/user-attachments/assets/288549a9-1268-4f35-9d84-dc3e8aa78e44" />

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)
![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1.0-purple)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)

</div>

## 📑 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## 🌟 Overview

TCET Unofficial is a cutting-edge productivity suite that combines AI, voice recognition, and seamless integration with popular tools to enhance your workflow. Built with modern technologies and a focus on user experience, this platform offers a comprehensive solution for task management, communication, and AI-powered assistance.

## 🎯 Features

### 1. Voice Input System
```mermaid
graph TD
    A[Voice Input] --> B[Multi-language Support]
    B --> C[20+ Indian Languages]
    A --> D[Task Processing]
    D --> E[Calendar Integration]
    D --> F[Gmail Integration]
    D --> G[Google Docs]
    D --> H[Google Drive]
    D --> I[Google Sheets]
    D --> J[YouTube Integration]
    A --> K[Real-time Transcription]
    A --> L[Task Approval Workflow]
```

### 2. Notion AI Integration
```mermaid
graph LR
    A[Notion AI] --> B[Task Analysis]
    B --> C[AI Insights]
    B --> D[PDF Reports]
    A --> E[Task Scheduling]
    E --> F[Calendar Sync]
    E --> G[Reminder System]
    A --> H[Document Processing]
    H --> I[Content Analysis]
    H --> J[Smart Summaries]
```

### 3. Communication System
```mermaid
graph TD
    A[Communication Hub] --> B[Voice Messages]
    A --> C[Text Chat]
    A --> D[File Sharing]
    A --> E[Translation]
    E --> F[20+ Languages]
    A --> G[Task Collaboration]
    G --> H[Real-time Updates]
    G --> I[Status Tracking]
```

### 4. Agent Learning System
```mermaid
graph LR
    A[Agent Learning] --> B[Pattern Recognition]
    B --> C[User Behavior]
    B --> D[Task Patterns]
    A --> E[Adaptive Learning]
    E --> F[Personalization]
    E --> G[Optimization]
    A --> H[Performance Analytics]
    H --> I[Usage Metrics]
    H --> J[Efficiency Scores]
```

## 🏗 Architecture

```mermaid
graph TD
    subgraph Frontend
        A[React App] --> B[Components]
        B --> C[Pages]
        B --> D[UI Elements]
        A --> E[State Management]
        A --> F[Routing]
    end
    
    subgraph Backend
        G[API Server] --> H[Authentication]
        G --> I[Task Processing]
        G --> J[AI Services]
        G --> K[Database]
    end
    
    subgraph Browser Extension
        L[Extension] --> M[Content Script]
        L --> N[Background Process]
        L --> O[Popup Interface]
    end
    
    A <--> G
    L <--> G
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Python 3.8+ (for backend services)
- Git
- Virtual Environment (Python)
- Chrome/Edge browser (for extension)

### Project Structure
```
tcet-unofficial/
├── client/                 # Frontend React application
├── notion/                # Notion AI integration backend
├── rl_agent/             # Reinforcement Learning agent
├── extension/            # Browser extension
└── scripts/              # Utility scripts
```

### Detailed Setup Instructions

1. **Clone and Setup Base Project**
```bash
git clone https://github.com/yourusername/tcet-unofficial.git
cd tcet-unofficial
```

2. **Frontend Setup (React + Vite)**
```bash
cd client
npm install
# Create .env file
echo "VITE_API_URL=http://localhost:5000" > .env
npm run dev  # Runs on http://localhost:5173
```

3. **Notion AI Backend Setup**
```bash
cd notion
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
# Create .env file
echo "NOTION_API_KEY=your_key_here
FLASK_APP=notion.py
FLASK_ENV=development" > .env
flask run  # Runs on http://localhost:5000
```

4. **RL Agent Setup**
```bash
cd rl_agent
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
# Create .env file
echo "MODEL_PATH=./dqn_model.pth
API_URL=http://localhost:5000" > .env
python integration.py  # Runs on http://localhost:5001
```

5. **Browser Extension Setup**
```bash
cd extension
# Load unpacked extension in Chrome/Edge:
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the extension folder
```

### Quick Start Script

We provide a shell script to start all services at once. Create a file named `start.sh` in the root directory:

```bash
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
```

For Windows users, create `start.bat`:

```batch
@echo off

:: Function to check if a port is in use
:check_port
netstat -an | find ":%1" | find "LISTENING" >nul
if errorlevel 1 (
    exit /b 1
) else (
    exit /b 0
)

:: Start Frontend
start cmd /k "cd client && npm run dev"

:: Start Notion Backend
start cmd /k "cd notion && .\venv\Scripts\activate && flask run"

:: Start RL Agent
start cmd /k "cd rl_agent && .\venv\Scripts\activate && python integration.py"

echo All services started! Access the application at http://localhost:5173
```

### Running the Services

1. **Using the Script (Recommended)**
```bash
# On Linux/Mac
chmod +x start.sh
./start.sh

# On Windows
start.bat
```

2. **Manual Start**
```bash
# Terminal 1 - Frontend
cd client
npm run dev

# Terminal 2 - Notion Backend
cd notion
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
flask run

# Terminal 3 - RL Agent
cd rl_agent
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
python integration.py
```

### Service Ports
- Frontend: http://localhost:5173
- Notion Backend: http://localhost:5000
- RL Agent: http://localhost:5001
- Browser Extension: Loaded in Chrome/Edge

### Environment Variables

1. **Frontend (.env in client/)**
```
VITE_API_URL=http://localhost:5000
```

2. **Notion Backend (.env in notion/)**
```
NOTION_API_KEY=your_key_here
FLASK_APP=notion.py
FLASK_ENV=development
```

3. **RL Agent (.env in rl_agent/)**
```
MODEL_PATH=./dqn_model.pth
API_URL=http://localhost:5000
```

## 📚 API Documentation

### Authentication Endpoints
```typescript
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/logout
GET /api/auth/me
```

### Task Management
```typescript
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id
```

### Voice Processing
```typescript
POST /api/voice/transcribe
POST /api/voice/process
GET /api/voice/languages
```

### Notion Integration
```typescript
POST /api/notion/analyze
GET /api/notion/sync
POST /api/notion/tasks
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Notion API](https://developers.notion.com/)
- [Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text)
- [Framer Motion](https://www.framer.com/motion/)

---

<div align="center">
Made with ❤️ by TCET Unofficial Team
</div>
