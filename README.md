```markdown
# PRISM — AI-Powered Media Intelligence Platform

<div align="center">
  <img src="frontend/assets/prism-icon.svg" width="140" alt="Prism Logo"/><br/>
  <h3>For modern journalism – summarise, fact‑check, repurpose, and synthesise narratives.</h3>
  <p><strong>Node.js · Express · Gemini 2.5 Pro · MongoDB · Vanilla JS</strong></p>
  <p>
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-api-endpoints">API</a> •
    <a href="#-deployment">Deployment</a> •
    <a href="#-security">Security</a>
  </p>
</div>

---

## 📖 Table of Contents

1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Architecture](#-architecture)
4. [Technology Stack](#-technology-stack)
5. [Project Structure](#-project-structure)
6. [Quick Start](#-quick-start)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Environment Variables](#environment-variables)
   - [Running Locally](#running-locally)
7. [API Reference](#-api-reference)
   - [Text Analysis Endpoints](#text-analysis-endpoints)
   - [Media Analysis Endpoint](#media-analysis-endpoint)
   - [Streaming (SSE) Endpoints](#streaming-sse-endpoints)
   - [History Management](#history-management)
   - [Example cURL Requests](#example-curl-requests)
8. [Database Schema](#-database-schema)
9. [Frontend Details](#-frontend-details)
   - [UI Components](#ui-components)
   - [Internationalisation (i18n)](#internationalisation-i18n)
   - [Service Worker & Offline Support](#service-worker--offline-support)
   - [PDF Export](#pdf-export)
10. [Security Features](#-security-features)
11. [Deployment](#-deployment)
    - [Docker Local Build](#docker-local-build)
    - [Google Cloud Run (Production)](#google-cloud-run-production)
    - [Workload Identity (Recommended)](#workload-identity-recommended)
12. [Troubleshooting & Known Limitations](#-troubleshooting--known-limitations)
13. [Roadmap](#-roadmap)
14. [License](#-license)
15. [Acknowledgements](#-acknowledgements)

---

## 🧠 Overview

**PRISM** is a SaaS‑grade AI assistant designed for newsrooms, investigative journalists, and content creators. It connects directly to **Google Gemini 2.5 Pro** (via Vertex AI) to provide advanced text and media analysis.

Unlike generic chatbots, PRISM is purpose‑built for journalistic workflows:

- ✅ **Smart summarisation** – extract key headlines, stats, and quotes from long reports.
- ⚖️ **Bias Radar** – detect verbal bias, loaded language, and propaganda.
- ♻️ **Content Recycler** – transform news articles into social media content (X, LinkedIn, Instagram).
- 🛡️ **Truth Guard** – fact‑check claims, detect logical fallacies, and flag misinformation.
- 🔗 **Narrative Synthesis** – merge multiple sources and expose contradictions.
- 🎙️ **Audio/Video Analysis** – transcribe and fact‑check spoken media.

All analyses are stored in **MongoDB Atlas**, with history search, favouriting, and PDF export. The frontend is a fully responsive, bilingual (Arabic/English) PWA with dark/light mode and offline support (basic Service Worker).

---

## ✨ Key Features

| Feature | Description | Output Format |
|---------|-------------|----------------|
| **Smart Summarize** | Extracts a concise summary, 3 headlines, important quotes, and statistics. User can choose length (short/standard/detailed) and whether to include quotes. | Markdown |
| **Bias Radar** | Returns bias percentage (0‑100), list of biased words/phrases, analysis, and a neutral rewrite. | JSON (visual gauge + cards) |
| **Content Recycler** | Converts an article into posts for selected platforms (X, LinkedIn, Instagram). Customisable tone (formal/engaging/urgent) and audience (general/youth/corporate). | Markdown |
| **Truth Guard** | Returns credibility score (0‑100), status (safe/warning/danger), detected logical fallacies, suggested questions for sources, and recommendations. | JSON (status banner + cards) |
| **Narrative Synthesis** | Merges 2+ sources covering the same event, highlights agreed facts, exposes contradictions, and produces a unified neutral report. | Markdown |
| **Audio/Video Analysis** | Transcribes the media file, then fact‑checks the spoken content. Supports many formats (MP3, WAV, M4A, MP4, AVI, MOV, etc.). Returns transcription + analysis. | Markdown |
| **URL Scraper** | Extracts main article text from any news URL (with SSRF protection). | Plain text |
| **Streaming (SSE)** | Real‑time markdown output for summarise, recycle, synthesis, and audio analysis. Gives users a typewriter effect. | Server‑Sent Events (SSE) |
| **History & Favourites** | Every report is stored in MongoDB. Users can search, filter by tool, mark/unmark favourite, and delete reports. | REST API + UI |
| **PDF Export** | Generates a clean A4‑formatted PDF report (client‑side using `html2pdf.js`). Supports both Arabic and English with proper RTL layout. 
| **Dual Language** | Full interface in English and Arabic. i18n system automatically switches prompts and UI labels. 
| **Dark / Light Mode** | Persistent theme preference (default dark). 
| **Offline Support** | Basic Service Worker caches static assets (network‑first for HTML/JS). 

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Vanilla JS)                   │
│  index.html | app.html | JS modules (ES6) | Tailwind CSS   │
│      (i18n, dark mode, SSE client, PDF export, history)    │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP / Fetch / SSE
┌─────────────────────────────▼───────────────────────────────┐
│                     Express.js Backend                      │
│  server.js ── middlewares (rate‑limit, helmet, validation)  │
│      routes (aiRoutes, historyRoutes)                       │
│      controllers (aiController, historyController)          │
│      services (geminiService – Gemini + GCS)                │
│      models (Report – Mongoose)                             │
└─────────────────────────────┬───────────────────────────────┘
                              │ @google/genai
┌─────────────────────────────▼───────────────────────────────┐
│              Google Cloud Vertex AI (Gemini 2.5 Pro)        │
│    (plus optional Google Cloud Storage for media >10 MB)   │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                      MongoDB Atlas                          │
│         Stores reports (endpoint, input, output,            │
│         options, favourite flag, createdAt, updatedAt)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Version / Notes |
|-------|------------|------------------|
| **Runtime** | Node.js | 20+ |
| **Framework** | Express.js | 4.19+ |
| **AI SDK** | `@google/genai` | Official Vertex AI SDK (replaces deprecated `@google-cloud/vertexai`) |
| **Database** | MongoDB Atlas | Mongoose ODM |
| **File upload** | Multer | memory storage, 20 MB limit |
| **Web scraping** | Axios + Cheerio | Extracts article text |
| **Frontend** | Vanilla JavaScript (ES Modules) | HTML/CSS, Tailwind CSS CDN |
| **Markdown rendering** | marked.js | Client‑side |
| **PDF generation** | html2pdf.js | Client‑side (browser only) |
| **Security** | Helmet, CORS, express‑rate‑limit, DOMPurify | Custom SSRF protection |
| **Container** | Docker | Alpine‑based, optimised for Cloud Run |
| **Deployment** | Google Cloud Run | (or any Node.js host) |

---

## 📁 Project Structure

```
prism-media/
├── server.js                     # Entry point: middlewares, static frontend, routes
├── package.json                  # Dependencies and scripts
├── .env.example                  # Template for environment variables
├── .gitignore                    # Excludes secrets and build artifacts
├── .dockerignore                 # Excludes secrets from Docker image
├── Dockerfile                    # Multi‑stage build for Cloud Run
│
├── config/
│   ├── env.js                    # Centralised environment config
│   └── db.js                     # MongoDB connection with event listeners
│
├── controllers/
│   ├── aiController.js           # 7 AI tools + streaming + DB saving + retry logic
│   └── historyController.js      # GET /history, DELETE /:id, PATCH /:id/favorite
│
├── routes/
│   ├── aiRoutes.js               # Routes for /api/summarize, /bias, /recycle, etc.
│   └── historyRoutes.js          # Routes for /api/history
│
├── middlewares/
│   ├── errorHandler.js           # Global error handler (sends JSON)
│   ├── validateInput.js          # Checks text presence and max length (800k chars)
│   ├── validateFile.js           # Checks file existence, size (≤20MB), MIME type
│   └── catchAsync.js             # Wrapper to avoid try/catch in controllers
│
├── services/
│   └── geminiService.js          # Vertex AI client (callGemini, callGeminiWithMedia, streaming versions)
│                                 # Supports inline (≤10MB) or GCS ( >10MB) for media
│
├── utils/
│   ├── prompts.js                # System prompts for each tool (with LANG_INSTRUCTION)
│   ├── urlValidator.js           # SSRF protection (block localhost, private IPs, metadata endpoints)
│   └── catchAsync.js             # Same as above (shared)
│
├── models/
│   └── Report.js                 # Mongoose schema (endpoint, inputText, aiResult, options, favorite, timestamps)
│
└── frontend/                     # Static files served by Express
    ├── index.html                # Landing page
    ├── app.html                  # Main workspace
    ├── manifest.json             # PWA manifest
    ├── sw.js                     # Service Worker (cache strategy)
    ├── assets/
    │   └── prism-icon.svg        # Logo
    └── js/
        ├── main.js               # Core logic: tool switching, API calls, auto‑save, media upload, streaming
        ├── api.js                # processTextAPI, processTextAPIStream, scrapeUrlAPI
        ├── ui.js                 # DOM elements, toast, counters, JSON visualisation (gauge, cards)
        ├── i18n.js               # Arabic/English translations and language switching
        ├── settings.js           # Theme and language persistence
        ├── toolSelector.js       # Toggle active tool, show/hide options containers
        ├── sidebar.js            # Mobile sidebar open/close
        ├── historyManager.js     # Fetch, render, search, filter, favourite, delete history
        └── pdfReport.js          # Generate bilingual A4 PDF (client‑side)
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **MongoDB Atlas** account (free tier is enough)
- **Google Cloud** project with:
  - Vertex AI API enabled
  - Gemini 2.5 Pro model available (or change model in `config/env.js`)
  - Service account key (JSON) with `Vertex AI User` role
- (Optional) **Google Cloud Storage** bucket if you plan to analyse media files larger than 10 MB.

### Installation

```bash
git clone https://github.com/Ahmadsarayrah12/PRISM-Porject.git
cd PRISM-Porject
npm install
```

### Environment Variables

Create a `.env` file in the root based on `.env.example`:

```env
# Required
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-central1                   # or europe-west4, etc.
GOOGLE_APPLICATION_CREDENTIALS=./key.json           # path to service account key
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/prism?authSource=admin

# Optional
PORT=8080
ALLOWED_ORIGIN=http://localhost:8080                # For CORS, use "*" only in dev
GCS_BUCKET=your-bucket-name                         # Needed for media >10 MB
NODE_ENV=development                                 # or "production"
```

> ⚠️ **Security**: Never commit `.env` or `key.json`. They are already ignored in `.gitignore` and `.dockerignore`.

### Running Locally

```bash
npm start
```

Then open [http://localhost:8080](http://localhost:8080).  
You should see the landing page. Click **Workspace** to start using the tools.

---

## 🌐 API Reference

Base URL: `http://localhost:8080/api` (or your deployed domain).

All text endpoints accept `POST` with `Content-Type: application/json`.  
The `options` object is tool‑specific (see below).

### Text Analysis Endpoints

| Endpoint | Method | Request Body | Response | Description |
|----------|--------|--------------|----------|-------------|
| `/summarize` | POST | `{ text, options: { length?, quotes? } }` | `{ success, type: "markdown", result, reportId }` | Summarises the article. `length`: `"قصير جداً (نقاط سريعة)"`, `"متوسط"`, `"تفصيلي (تغطية كاملة)"`. `quotes`: boolean. |
| `/bias` | POST | `{ text, options: { strictness? } }` | `{ success, type: "json_bias", result: { biasScore, biasedWords, analysis, neutralRewrite }, reportId }` | Bias detection. `strictness`: `"متساهل (يقبل الرأي)"`, `"قياسي"`, `"صارم جداً (معايير وكالات الأنباء الدولية)"`. |
| `/recycle` | POST | `{ text, options: { platforms?, tone?, audience? } }` | `{ success, type: "markdown", result, reportId }` | Social media repurposing. `platforms`: array of strings (e.g. `["X (Twitter)","LinkedIn"]`); `tone`: `"رسمية وإخبارية"`, `"تفاعلية مشوقة"`, `"عاجلة وصادمة"`; `audience`: `"الجمهور العام"`, `"الشباب (Gen Z)"`, `"المتخصصين والمحترفين"`. |
| `/truth-guard` | POST | `{ text, options: { checkType? } }` | `{ success, type: "json_truth", result: { status, credibilityScore, fallacies, questionsForSource, recommendations }, reportId }` | Fact‑checking. `checkType`: `"تدقيق النص بالكامل"`, `"تدقيق الأرقام والإحصائيات فقط"`, `"تدقيق تصريح أو اقتباس محدد"`. |
| `/synthesis` | POST | `{ text }` | `{ success, type: "markdown", result, reportId }` | Merge multiple sources (paste 2‑3 articles separated by blank lines). |
| `/scrape` | POST | `{ url }` | `{ success, text }` | Extracts main text from a news article URL. |

### Media Analysis Endpoint

| Endpoint | Method | Request Body | Response | Description |
|----------|--------|--------------|----------|-------------|
| `/audio` | POST | `multipart/form-data` with `media` file (field name `"media"`) and optional `options` (JSON string) | `{ success, type: "markdown", result, reportId }` | Transcribes and fact‑checks an audio or video file (≤20 MB). Supported MIME types: audio/*, video/* (see `validateFile.js` for full list). |

### Streaming (SSE) Endpoints

These endpoints return `text/event-stream`. Client receives `{ chunk }` events and a final `{ done, reportId }`.

| Endpoint | Same as | Description |
|----------|---------|-------------|
| `/summarize/stream` | `/summarize` | Streams markdown output. |
| `/recycle/stream` | `/recycle` | Streams markdown output. |
| `/synthesis/stream` | `/synthesis` | Streams markdown output. |
| `/audio/stream` | `/audio` | Streams transcription + analysis. |

### History Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/history` | GET | Returns `{ success, data: Report[] }` (last 50 reports, most recent first). |
| `/api/history/:id` | DELETE | Deletes a report. Returns `{ success, message }`. |
| `/api/history/:id/favorite` | PATCH | Toggles the `favorite` boolean. Returns `{ success, data: { _id, favorite } }`. |

### Example cURL Requests

#### Summarize (standard)

```bash
curl -X POST http://localhost:8080/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The president announced a new climate initiative...",
    "options": { "length": "متوسط", "quotes": true }
  }'
```

#### Bias (JSON response)

```bash
curl -X POST http://localhost:8080/api/bias \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The opposition party has once again failed to present a viable plan.",
    "options": { "strictness": "قياسي" }
  }'
```

#### Audio analysis with file upload

```bash
curl -X POST http://localhost:8080/api/audio \
  -F "media=@interview.mp3" \
  -F "options={\"length\":\"standard\"}"
```

#### Streaming (SSE) example

```bash
curl -N -X POST http://localhost:8080/api/summarize/stream \
  -H "Content-Type: application/json" \
  -d '{"text":"... long article ..."}'
```

#### Get history

```bash
curl http://localhost:8080/api/history
```

---

## 🗄️ Database Schema

**Collection: `reports`** (Mongoose model `Report`)

| Field | Type | Description |
|-------|------|-------------|
| `endpoint` | string (enum) | One of `summarize`, `bias`, `recycle`, `truthGuard`, `synthesis`, `audioAnalysis` |
| `inputText` | string | The original text (or filename for media) |
| `aiResult` | mixed | String (markdown) or Object (JSON for bias/truth) |
| `language` | string | `"auto"` (future use) |
| `options` | object | The tool‑specific options used |
| `favorite` | boolean | Default `false` |
| `createdAt` | Date | Auto‑set by Mongoose |
| `updatedAt` | Date | Auto‑set by Mongoose |

Indexes: `favorite` is indexed for faster filtering.

---

## 🎨 Frontend Details

### UI Components

- **Landing page** (`index.html`): Showcases tools, call‑to‑action, theme/language switchers.
- **Workspace** (`app.html`): Main interface with:
  - Sidebar (tool selection, history list, theme/lang)
  - Editor area (text input, URL scraper bar, file dropzone)
  - Tool‑specific options panels (summarize, bias, recycle, truth‑guard)
  - Result area (skeleton loader, markdown/JSON visualisation, export buttons)
- **Responsive**: Mobile sidebar toggle, flexible layout.

### Internationalisation (i18n)

- Located in `frontend/js/i18n.js`.
- Supports `ar` (Arabic, RTL) and `en` (English, LTR).
- All UI text uses `data-i18n`, `data-i18n-placeholder`, `data-i18n-title` attributes.
- Language preference is stored in `localStorage` and applied dynamically.
- Tool prompts (sent to Gemini) automatically include `LANG_INSTRUCTION` to force response in the same language as the input.

### Service Worker & Offline Support

- **`sw.js`**: Caches static assets (HTML, JS, CSS, manifest, logo).
- **Network‑first** for HTML and JS files: tries network first, falls back to cache.
- **Cache‑first** for other assets (icons, etc.).
- **Bypasses** all `/api/*` requests to avoid breaking SSE streams and dynamic responses.

### PDF Export

- **`pdfReport.js`**: Client‑side PDF generation using `html2pdf.js`.
- Captures the content of `#results-container`, injects it into a clean `#print-wrapper` with custom print styles.
- Detects language (Arabic/English) and applies proper RTL/LTR, fonts, and layout.
- Adds header (logo, tool name, date) and footer on each page.
- Works entirely in the browser – no server load.

---

## 🔒 Security Features

| Measure | Implementation |
|---------|----------------|
| **Input validation** | `validateInput.js` rejects empty or over‑sized text (>800k chars). |
| **File validation** | `validateFile.js` checks MIME type (audio/video whitelist), size ≤20 MB. |
| **SSRF protection** | `urlValidator.js` blocks `localhost`, `127.0.0.1`, private IP ranges, and metadata endpoints (169.254.169.254). |
| **Rate limiting** | `express-rate-limit` – 100 requests per 15 minutes per IP (configurable). |
| **CORS** | Controlled via `ALLOWED_ORIGIN` env var (default `*` only in dev). |
| **Helmet** | Sets secure HTTP headers (CSP temporarily disabled for Tailwind CDN). |
| **No secrets in Docker** | `.dockerignore` excludes `.env`, `key.json`, logs, node_modules. |
| **XSS prevention** | Client‑side `DOMPurify` sanitises rendered HTML. |
| **Global error handler** | Does not leak stack traces in production. |

---

## 🚀 Deployment

### Docker Local Build

```bash
docker build -t prism-media .
docker run -p 8080:8080 --env-file .env prism-media
```

### Google Cloud Run (Production)

> **Recommended**: Use Workload Identity instead of a service account key file.

#### 1. Prepare your project
Enable Artifact Registry, Cloud Run, Vertex AI API, and (optional) Cloud Storage.

#### 2. Build and push image

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/prism-media
```

#### 3. Deploy without embedding secrets

```bash
gcloud run deploy prism-media \
  --image gcr.io/YOUR_PROJECT_ID/prism-media \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,GOOGLE_CLOUD_LOCATION=us-central1,MONGO_URI="your_mongo_uri"
```

> ⚠️ Do **not** set `GOOGLE_APPLICATION_CREDENTIALS` when using Workload Identity.

### Workload Identity (Recommended)

Follow [Google's guide](https://cloud.google.com/run/docs/configuring/service-accounts#workload-identity) to create a service account and grant it:

- `roles/aiplatform.user` (Vertex AI User)
- `roles/storage.objectViewer` (if using GCS)
- `roles/run.invoker` (for Cloud Run)

Then deploy with the service account:

```bash
gcloud run deploy prism-media \
  --service-account=SA_EMAIL@PROJECT.iam.gserviceaccount.com \
  ... (other flags as above)
```

The runtime will automatically obtain credentials from the environment – no key file needed.

---

## ❗ Troubleshooting & Known Limitations

### Common Issues

| Problem | Likely cause | Solution |
|---------|--------------|----------|
| `bad auth` on MongoDB | Wrong password or missing `authSource=admin` | Add `?authSource=admin` to `MONGO_URI`. |
| `429 Resource exhausted` | Gemini rate limit / quota exceeded | Implemented retry logic (3 attempts, exponential backoff). Increase quota or reduce concurrency. |
| `413 Payload Too Large` | Text >800k characters or file >20 MB | Split text or use GCS for larger media. |
| `CORS error` | Frontend origin not allowed | Set `ALLOWED_ORIGIN` to your frontend URL (e.g., `https://yourdomain.com`). |
| SSE not working | Reverse proxy buffering | Ensure `X-Accel-Buffering: no` header is set (already done in `aiController.js`). |

### Known Limitations

- **CSP disabled** – Content Security Policy is turned off via Helmet to allow Tailwind CDN. For production, implement a strict CSP that permits only trusted CDNs.
- **History pagination** – Only last 50 reports are returned. Large histories may slow down the frontend.
- **No user authentication** – All analyses are shared across all users. Add JWT / OAuth for multi‑tenant use.
- **Streaming not supported for bias/truth‑guard** – Those endpoints return JSON, not markdown. Could be extended.
- **Large media files ( >10 MB) require GCS** – Without a bucket, they will be rejected.
- **Scraper may fail on JS‑heavy sites** – Works best with static HTML news articles.

---

## 🗺️ Roadmap

- [ ] **User authentication** (JWT, Google OAuth) and per‑user history.
- [ ] **Pagination** for `/api/history` with `?page` and `?limit`.
- [ ] **Strict CSP** for production.
- [ ] **Batch URL processing** – analyse multiple articles at once.
- [ ] **Webhook support** – send results to external systems.
- [ ] **More languages** – French, Spanish, etc.
- [ ] **Mobile app** (React Native wrapper).

---

## 📄 License

MIT © 2026 Prism Media — Built for free press.  
صُنع للصحافة الحرة.

---

## 🙏 Acknowledgements

- [Google Gemini](https://deepmind.google/technologies/gemini/) – Vertex AI team for the `@google/genai` SDK.
- [Tailwind CSS](https://tailwindcss.com/) – Utility‑first CSS framework.
- [marked.js](https://marked.js.org/) – Markdown parser.
- [DOMPurify](https://github.com/cure53/DOMPurify) – XSS sanitizer.
- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) – Client‑side PDF generation.
- [MongoDB Atlas](https://www.mongodb.com/atlas) – Free cloud database.

---

**Happy reporting with PRISM!**  
For questions or contributions, please open an issue on GitHub.
```
