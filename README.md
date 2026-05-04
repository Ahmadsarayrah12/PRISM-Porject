<!-- markdownlint-disable MD033 -->
<p align="center">
  <img src="frontend/assets/prism-icon.svg" width="150" alt="Prism Logo"/>
</p>

<h1 align="center">🔮 PRISM — AI-Powered Media Intelligence</h1>

<p align="center">
  <strong>For modern journalism – summarise, fact‑check, repurpose, and synthesise narratives.</strong><br/>
  <sub>Node.js · Express · Gemini 2.5 Pro · MongoDB · Vanilla JS</sub>
</p>

<p align="center">
  <a href="#-quick-start"><img src="https://img.shields.io/badge/🚀_Quick_Start-blue?style=for-the-badge&logo=node.js&logoColor=white"/></a>
  <a href="#-api-reference"><img src="https://img.shields.io/badge/📡_API_Reference-blue?style=for-the-badge&logo=fastapi&logoColor=white"/></a>
  <a href="#-deployment"><img src="https://img.shields.io/badge/☁️_Deployment-blue?style=for-the-badge&logo=googlecloud&logoColor=white"/></a>
  <a href="#-license"><img src="https://img.shields.io/badge/📄_License-MIT-purple?style=for-the-badge"/></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20-brightgreen?logo=node.js"/>
  <img src="https://img.shields.io/badge/Gemini-2.5_Pro-blue?logo=google"/>
  <img src="https://img.shields.io/badge/Cloud_Run-Ready-orange?logo=google-cloud"/>
  <img src="https://img.shields.io/badge/License-MIT-purple"/>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen"/>
</p>

---

## 📖 Table of Contents

<details>
<summary>Click to expand</summary>

1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Architecture](#-architecture)
4. [Tech Stack](#-tech-stack)
5. [Project Structure](#-project-structure)
6. [Quick Start](#-quick-start)
7. [Environment Variables](#-environment-variables)
8. [API Reference](#-api-reference)
9. [Database Schema](#-database-schema)
10. [Frontend Features](#-frontend-features)
11. [Security](#-security)
12. [Deployment](#-deployment)
13. [Troubleshooting](#-troubleshooting)
14. [Roadmap](#-roadmap)
15. [License](#-license)

</details>

---

## 🧠 Overview

**PRISM** is a SaaS‑grade AI assistant designed for **newsrooms, investigative journalists, and content creators**. It connects directly to **Google Gemini 2.5 Pro** (via Vertex AI) to provide advanced text and media analysis.

| What PRISM does | Why it matters |
|----------------|----------------|
| 📝 **Smart Summarization** | Extract key headlines, stats, and quotes from long reports in seconds. |
| ⚖️ **Bias Radar** | Detect verbal bias, loaded language, and propaganda. |
| ♻️ **Content Recycler** | Transform long articles into social media posts (X, LinkedIn, Instagram). |
| 🛡️ **Truth Guard** | Fact‑check claims, detect logical fallacies, and flag misinformation. |
| 🔗 **Narrative Synthesis** | Merge multiple sources and expose contradictions. |
| 🎙️ **Audio/Video Analysis** | Transcribe and fact‑check spoken media. |

All analyses are stored in **MongoDB Atlas**, with **history search, favouriting, and PDF export**. The frontend is a fully responsive, **bilingual (Arabic/English) PWA** with dark/light mode and offline support.

---

## ✨ Key Features

<div align="center">

| Feature | Output Format | Streaming |
|---------|---------------|-----------|
| **Smart Summarize** | Markdown | ✅ SSE |
| **Bias Radar** | JSON (visual gauge) | ❌ |
| **Content Recycler** | Markdown | ✅ SSE |
| **Truth Guard** | JSON (status cards) | ❌ |
| **Narrative Synthesis** | Markdown | ✅ SSE |
| **URL Scraper** | Plain text | ❌ |
| **Audio / Video Analysis** | Markdown | ✅ SSE |

</div>

### 🔥 Highlights

- **Real‑time streaming (SSE)** – Watch markdown results appear character by character.
- **Persistent history** – Every report saved in MongoDB, searchable and filterable.
- **Bilingual UI** – Full support for English and Arabic (RTL layout).
- **PDF export** – Generate beautiful A4 reports (client‑side).
- **Dark/Light mode** – Respects system preference or manual toggle.
- **Offline‑ready** – Service Worker caches static assets.

---

## 🏗️ Architecture

```mermaid
graph TB
    A[Frontend<br/>Vanilla JS + Tailwind] -->|Fetch / SSE| B[Express Backend]
    B --> C[Middlewares<br/>rate‑limit, helmet, validation]
    C --> D[Controllers<br/>aiController, historyController]
    D --> E[Services<br/>geminiService]
    D --> F[(MongoDB Atlas)]
    E --> G[Vertex AI Gemini 2.5 Pro]
    E --> H[(GCS Optional<br/>for media >10MB)]
```

<details>
<summary>Plain text representation</summary>

```text
Frontend (Vanilla JS)
   │
   │  Fetch API / SSE
   ▼
Express.js Backend
   ├── Middlewares
   ├── Routes (AI + History)
   ├── Controllers
   ├── Services (Gemini)
   └── Models (MongoDB)
   │
   ▼
Google Cloud Vertex AI (Gemini 2.5 Pro)
   │
   └─ Google Cloud Storage (optional)
```

</details>

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Runtime** | Node.js | 20+ |
| **Framework** | Express.js | 4.19 |
| **AI SDK** | `@google/genai` | 1.50+ |
| **Database** | MongoDB Atlas + Mongoose | 7.x |
| **File upload** | Multer | 1.4 |
| **Web scraping** | Axios + Cheerio | 1.7 |
| **Frontend** | Vanilla JS (ES modules) | - |
| **Styling** | Tailwind CSS | CDN |
| **PDF generation** | html2pdf.js | 0.10 |
| **Security** | Helmet, CORS, rate‑limit | - |
| **Container** | Docker | Alpine |
| **Deployment** | Google Cloud Run | - |

---

## 📁 Project Structure

<details>
<summary>Click to expand full tree</summary>

```text
prism-media/
├── server.js                     # Entry point
├── package.json
├── .env.example
├── .gitignore
├── .dockerignore
├── Dockerfile
│
├── config/
│   ├── env.js                    # Centralised config
│   └── db.js                     # MongoDB connection
│
├── controllers/
│   ├── aiController.js           # 7 AI tools + streaming + retry
│   └── historyController.js      # CRUD for reports
│
├── routes/
│   ├── aiRoutes.js               # /api/summarize, /bias, etc.
│   └── historyRoutes.js          # /api/history
│
├── middlewares/
│   ├── errorHandler.js
│   ├── validateInput.js          # Text validation
│   ├── validateFile.js           # File validation (size/type)
│   └── catchAsync.js
│
├── services/
│   └── geminiService.js          # Vertex AI client + GCS support
│
├── utils/
│   ├── prompts.js                # System prompts
│   ├── urlValidator.js           # SSRF protection
│   └── catchAsync.js
│
├── models/
│   └── Report.js                 # Mongoose schema
│
└── frontend/
    ├── index.html                # Landing page
    ├── app.html                  # Workspace
    ├── manifest.json
    ├── sw.js                     # Service Worker
    ├── assets/
    │   └── prism-icon.svg
    └── js/
        ├── main.js               # Core logic
        ├── api.js                # API + streaming
        ├── ui.js                 # UI helpers, visualisations
        ├── i18n.js               # Arabic/English translations
        ├── settings.js           # Theme & lang persistence
        ├── toolSelector.js
        ├── sidebar.js
        ├── historyManager.js
        └── pdfReport.js
```

</details>

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (free tier)
- Google Cloud project with Vertex AI API enabled
- Service account key (JSON) with Vertex AI User role
- (Optional) Google Cloud Storage bucket for large media files

### Installation

```bash
# Clone the repository
git clone https://github.com/Ahmadsarayrah12/PRISM-Porject.git
cd PRISM-Porject

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root:

```ini
# Required
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./key.json
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/prism?authSource=admin

# Optional
PORT=8080
ALLOWED_ORIGIN=http://localhost:8080
GCS_BUCKET=your-bucket-name   # for media >10MB
NODE_ENV=development
```

> ⚠️ Never commit `.env` or `key.json` – they are excluded via `.gitignore` and `.dockerignore`.

### Run Locally

```bash
npm start
```

Open [http://localhost:8080](http://localhost:8080)

---

## 🌐 API Reference

Base URL: `/api`

### Text Analysis Endpoints

| Method | Endpoint | Request Body | Response Type | Description |
|--------|----------|--------------|---------------|-------------|
| POST | `/summarize` | `{ text, options: { length, quotes } }` | Markdown | Smart summarisation |
| POST | `/bias` | `{ text, options: { strictness } }` | JSON (bias gauge) | Bias detection |
| POST | `/recycle` | `{ text, options: { platforms, tone, audience } }` | Markdown | Social media repurposing |
| POST | `/truth-guard` | `{ text, options: { checkType } }` | JSON (status cards) | Fact‑checking |
| POST | `/synthesis` | `{ text }` | Markdown | Multi‑source synthesis |
| POST | `/scrape` | `{ url }` | Plain text | Extract article from URL |
| POST | `/audio` | `multipart/form-data` (field `media`) | Markdown | Transcribe + analyse media |

### Streaming (SSE) Endpoints

Add `/stream` suffix to the above markdown endpoints:
- `/summarize/stream`
- `/recycle/stream`
- `/synthesis/stream`
- `/audio/stream`

Returns `text/event-stream` with `{ chunk }` and final `{ done, reportId }`.

### History Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | Get last 50 reports |
| DELETE | `/api/history/:id` | Delete a report |
| PATCH | `/api/history/:id/favorite` | Toggle favourite flag |

### Example cURL

```bash
# Summarize
curl -X POST http://localhost:8080/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"text":"Article text...","options":{"length":"متوسط","quotes":true}}'

# Bias
curl -X POST http://localhost:8080/api/bias \
  -H "Content-Type: application/json" \
  -d '{"text":"The opposition failed...","options":{"strictness":"قياسي"}}'

# Streaming
curl -N -X POST http://localhost:8080/api/summarize/stream \
  -H "Content-Type: application/json" \
  -d '{"text":"Long article..."}'
```

---

## 🗄️ Database Schema (MongoDB)

**Collection:** `reports`

| Field | Type | Description |
|-------|------|-------------|
| `endpoint` | string | `summarize`, `bias`, `recycle`, `truthGuard`, `synthesis`, `audioAnalysis` |
| `inputText` | string | Original text or filename |
| `aiResult` | mixed | Markdown string or JSON object |
| `options` | object | Tool‑specific options |
| `favorite` | boolean | Default false |
| `createdAt` | Date | Auto‑generated |
| `updatedAt` | Date | Auto‑generated |

---

## 🎨 Frontend Features

| Feature | Description |
|---------|-------------|
| **Bilingual UI** | `i18n.js` provides Arabic/English translations, RTL/LTR switching. |
| **Dark/Light mode** | Persistent via localStorage, follows system or manual toggle. |
| **Responsive design** | Mobile sidebar, flexible grid, touch‑friendly elements. |
| **History panel** | Search, filter by tool, mark favourite, delete, load previous reports. |
| **PDF export** | Client‑side generation with proper A4 layout, bilingual headers, page numbers. |
| **Auto‑save drafts** | Text is saved to localStorage and restored on page load. |
| **Real‑time stats** | Real‑time word count & reading time estimate. |
| **URL scraper** | Paste a news URL to auto‑fill the editor. |
| **File dropzone** | Drag & drop audio/video files. |
| **Skeleton loader** | Skeleton loader and smooth animations. |

---

## 🔒 Security

| Measure | Implementation |
|---------|----------------|
| **Input validation** | `validateInput.js`: max 800k chars, non‑empty. |
| **File validation** | `validateFile.js`: allowed MIME types (`audio/`, `video/`), max 20 MB. |
| **SSRF protection** | `urlValidator.js`: blocks localhost, private IPs, metadata endpoints. |
| **Rate limiting** | 100 requests per 15 min per IP (configurable). |
| **CORS** | Restricted via `ALLOWED_ORIGIN` env var. |
| **Helmet** | Sets secure HTTP headers (CSP disabled temporarily for Tailwind CDN). |
| **Secrets exclusion** | `.dockerignore` and `.gitignore` prevent `.env`, `key.json`. |
| **XSS prevention** | Client‑side `DOMPurify` sanitises markdown output. |
| **Error handling** | Global handler hides stack traces in production. |

---

## ☁️ Deployment

### Docker Local Build

```bash
docker build -t prism-media .
docker run -p 8080:8080 --env-file .env prism-media
```

### Google Cloud Run (Production)

**1. Build and push**

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT/prism-media
```

**2. Deploy**

```bash
gcloud run deploy prism-media \
  --image gcr.io/YOUR_PROJECT/prism-media \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=YOUR_PROJECT,GOOGLE_CLOUD_LOCATION=us-central1,MONGO_URI="your_mongo_uri"
```

> 💡 Do not set `GOOGLE_APPLICATION_CREDENTIALS`; use Workload Identity instead.

### Workload Identity (Recommended)

Create a service account and grant:

- `roles/aiplatform.user`
- `roles/storage.objectViewer` (if using GCS)
- `roles/run.invoker`

Deploy with `--service-account=SA_EMAIL`. No key file needed.

---

## ❗ Troubleshooting

| Error | Likely cause | Solution |
|-------|--------------|----------|
| `bad auth` (MongoDB) | Wrong password or missing `authSource=admin` | Add `?authSource=admin` to `MONGO_URI`. |
| `429 Resource exhausted`| Gemini rate limit | Built‑in retry (3 attempts, exponential backoff). Requests 429 – wait and retry. |
| `413 Payload Too Large`| Text >800k chars or file >20 MB | Split input or use GCS for media >10 MB. |
| `CORS error` | Frontend origin not allowed | Set `ALLOWED_ORIGIN` to your frontend URL. |
| SSE not streaming | Reverse proxy buffering | Ensure `X-Accel-Buffering: no` header (already set). |

---

## 🗺️ Roadmap

- [ ] User authentication (JWT, Google OAuth)
- [ ] Pagination for `/api/history`
- [ ] Strict CSP for production
- [ ] Batch URL processing
- [ ] Webhook notifications
- [ ] Mobile app (React Native)

---

## 📄 License

MIT © 2026 Prism Media — Built for free press.
صُنع للصحافة الحرة.

---

## 🙏 Acknowledgements

- Google Gemini – Vertex AI SDK.
- Tailwind CSS – Utility CSS framework.
- marked.js – Markdown parser.
- DOMPurify – XSS sanitizer.
- html2pdf.js – Client‑side PDF.
- MongoDB Atlas – Cloud database.

<br>

<p align="center"> 
  <sub>Made with ❤️ for journalists and fact‑checkers.</sub><br/> 
  <sub>Questions? Open an issue on <a href="https://github.com/Ahmadsarayrah12/PRISM-Porject">GitHub</a>.</sub> 
</p>
