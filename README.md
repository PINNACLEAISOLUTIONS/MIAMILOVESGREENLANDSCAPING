# Miami Loves Green Landscaping - Official Website & AI Chatbot

This repository hosts the official website for **Miami Loves Green Landscaping** and its integrated AI Agent Chatbot.

## 🚀 How to Deploy the Chatbot on Render

This repository contains the chatbot application in the `chatbot-temp` folder. Follow these specific steps to deploy it successfully on Render.com.

### 1. Create a New Web Service

1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect this repository: `PINNACLEAISOLUTIONS/MIAMILOVESGREENLANDSCAPING`.

### 2. Configure Service Settings (CRITICAL)

You **MUST** configure the "Root Directory" or the build will fail.

| Setting | Value |
| :--- | :--- |
| **Name** | `miami-loves-green-chatbot` (or your choice) |
| **Region** | Oregon (US West) or Ohio (US East) |
| **Branch** | `main` |
| **Root Directory** | `chatbot-temp` |
| **Runtime** | **Docker** |

> **⚠️ IMPORTANT:** ensure **Root Directory** is set to `chatbot-temp`. If you leave it blank, Render cannot find the Dockerfile.

### 3. Environment Variables

Add the following environment variables in the "Environment" tab:

| Key | Value | Description |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.11.0` | Required for Python compatibility |
| `PORT` | `8000` | Port the app listens on |
| `GROQ_API_KEY` | `gsk_...` | (Optional) For fast inference |
| `GEMINI_API_KEY` | `...` | (Required) For main chat logic |
| `ELEVENLABS_API_KEY` | `...` | (Optional) For voice features |
| `PUBLIC_BASE_URL` | `https://your-service-name.onrender.com` | URL for image display |

### 4. Build & Start

- Render will automatically detect the `Dockerfile` inside `chatbot-temp`.
- **Start Command**: Not needed (defined in Dockerfile), but if asked:

```bash
gunicorn main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

## 📂 Project Structure

- `/` - Main website (HTML/CSS/JS) hosted via GitHub Pages or direct upload.
- `/chatbot-temp` - **The Python AI Chatbot Application** (Deploy this to Render).
  - `Dockerfile` - Configuration for building the Docker container.
  - `requirements.txt` - Python dependencies.
  - `main.py` - FastAPI application entry point.
  - `business_knowledge.md` - Context for the AI agent.

## 🤖 Chatbot Features

- **AI-Powered**: Uses Gemini/Groq for intelligent responses.
- **Voice Mode**: Supports speech-to-text and text-to-speech.
- **Lead Generation**: Captures user info and stores it.
- **Image Generation**: Can generate landscaping ideas (requires `PUBLIC_BASE_URL`).

## 🌐 Website Integration

To add the chatbot to the main site, use the provided iframe widget code in `index.html`.
