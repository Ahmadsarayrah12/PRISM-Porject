# PRISM — منصة الإعلام الذكي للصحفيين

<div align="center">

![Prism Logo](frontend/assets/prism-icon.svg)

**An AI-powered journalism intelligence platform built for the modern newsroom.**

[![Node.js](https://img.shields.io/badge/Node.js-20-brightgreen?logo=node.js)](https://nodejs.org)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Pro-blue?logo=google)](https://cloud.google.com/vertex-ai)
[![Cloud Run](https://img.shields.io/badge/Cloud%20Run-Ready-orange?logo=google-cloud)](https://cloud.google.com/run)
[![License](https://img.shields.io/badge/License-MIT-purple)](LICENSE)

[🔴 Live Demo](#) · [📖 API Docs](#api-reference) · [🚀 Deploy](#deployment)

</div>

---

## 🧠 What is Prism?

**Prism** is a SaaS-grade AI media assistant that gives journalists superpowers. It connects directly to **Google Gemini 2.5 Pro** via Vertex AI to provide:

- 📝 **Smart Summarization** — Extract key headlines, stats, and quotes from long reports
- ⚖️ **Bias Radar** — Detect verbal bias, loaded language, and propaganda
- 🔄 **Content Recycler** — Transform news articles into social media content
- 🛡️ **Truth Guard** — Fact-check claims and detect logical fallacies
- 🔗 **Narrative Synthesis** — Merge multiple sources and expose contradictions
- 🎙️ **Audio/Video Analysis** — Transcribe and fact-check spoken media

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              Frontend (Vanilla JS)           │
│   index.html  ·  app.html  ·  6 JS Modules  │
└────────────────────┬────────────────────────┘
                     │ HTTP / Fetch API
┌────────────────────▼────────────────────────┐
│           Express.js Backend                 │
│  Routes → Middlewares → Controllers          │
│       → Services → Vertex AI                │
└────────────────────┬────────────────────────┘
                     │ @google-cloud/vertexai
┌────────────────────▼────────────────────────┐
│         Google Cloud Vertex AI               │
│           Gemini 2.5 Pro Model               │
└─────────────────────────────────────────────┘
```

### Project Structure

```
proj/
├── server.js              # Express entry point
├── Dockerfile             # Cloud Run optimized
├── .dockerignore          # Security: excludes credentials
├── config/env.js          # Centralized config
├── controllers/
│   └── aiController.js    # 7 AI tool handlers
├── services/
│   └── geminiService.js   # Vertex AI client
├── routes/
│   └── aiRoutes.js        # API route definitions
├── middlewares/
│   ├── errorHandler.js    # Global error handler
│   └── validateInput.js   # Input sanitization
├── utils/
│   ├── prompts.js         # AI prompt templates
│   └── catchAsync.js      # Async error wrapper
└── frontend/
    ├── index.html         # Landing page
    ├── app.html           # Main workspace
    └── js/
        ├── main.js        # Core application logic
        ├── api.js         # Backend communication
        ├── ui.js          # UI rendering & animations
        ├── i18n.js        # AR/EN translations
        ├── settings.js    # Theme & language
        └── toolSelector.js# Tool switching
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 20+
- Google Cloud project with Vertex AI API enabled
- A service account key with `Vertex AI User` role

### 1. Clone & Install

```bash
git clone https://github.com/your-username/prism-media.git
cd prism-media
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./key.json
PORT=8080
```

> ⚠️ **Never commit `key.json` or `.env`** — they are excluded via `.gitignore` and `.dockerignore`.

### 3. Run Locally

```bash
npm start
```

Open [http://localhost:8080](http://localhost:8080)

---

## 🌐 API Reference

**Base URL:** `/api`

All text-based endpoints accept `POST` with `Content-Type: application/json`.

| Endpoint | Method | Body | Description |
|----------|--------|------|-------------|
| `/api/summarize` | POST | `{ text, options }` | Smart summarization |
| `/api/bias` | POST | `{ text, options }` | Bias detection |
| `/api/recycle` | POST | `{ text, options }` | Social media repurposing |
| `/api/truth-guard` | POST | `{ text, options }` | Fact-checking |
| `/api/synthesis` | POST | `{ text, options }` | Multi-source synthesis |
| `/api/scrape` | POST | `{ url }` | URL article scraper |
| `/api/audio` | POST | `FormData: media` | Audio/video analysis |

### Example Request

```bash
curl -X POST http://localhost:8080/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your news article text here...",
    "options": { "length": "متوسط", "quotes": true }
  }'
```

### Example Response

```json
{
  "success": true,
  "type": "markdown",
  "result": "## ملخص الخبر\n..."
}
```

---

## 🚀 Deployment

### Google Cloud Run

```bash
# 1. Build & push image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/prism-media

# 2. Deploy to Cloud Run
gcloud run deploy prism-media \
  --image gcr.io/YOUR_PROJECT_ID/prism-media \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,GOOGLE_CLOUD_LOCATION=us-central1
```

> 💡 For production, use **Workload Identity Federation** instead of a key file.

### Docker (Local)

```bash
docker build -t prism-media .
docker run -p 8080:8080 --env-file .env prism-media
```

---

## 🔒 Security

- **Helmet.js** — HTTP security headers
- **Rate Limiting** — 100 requests / 15 min per IP
- **Input Validation** — All text inputs are sanitized server-side
- **Credentials** — Never included in Docker images (`.dockerignore`)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 (Alpine) |
| Framework | Express.js 4 |
| AI Engine | Google Gemini 2.5 Pro (Vertex AI) |
| Web Scraping | Axios + Cheerio |
| File Upload | Multer (memory storage) |
| Frontend | Vanilla HTML/CSS/JS (ES Modules) |
| Styling | Tailwind CSS CDN + Custom CSS |
| i18n | Custom AR/EN translation system |
| Containerization | Docker + Google Cloud Run |

---

## 🗺️ Roadmap

- [ ] Server-Sent Events for streaming AI responses
- [ ] Redis caching for repeated queries
- [ ] Mobile-responsive sidebar
- [ ] `/health` endpoint for Cloud Run readiness probe
- [ ] User authentication & usage history
- [ ] PDF report export
- [ ] Batch URL processing

---

## 📄 License

MIT © 2026 Prism Media — Built for free press. صُنع للصحافة الحرة.
