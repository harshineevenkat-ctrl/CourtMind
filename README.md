# ⚖️ CourtMind — AI Legal Memory Assistant

> **WeMakeDevs x Cognee Hackathon 2026 Submission**
> *"The Hangover Part AI: Where's My Context?"*

CourtMind is an AI-powered legal assistant that **never forgets your cases**. Lawyers handle 20+ cases simultaneously and critical details get missed — CourtMind gives every case a permanent memory using Cognee's hybrid graph-vector memory layer.

---

## 🎯 The Problem

Lawyers lose critical details across cases:
- "What did the opposing counsel argue in hearing 3?"
- "Which clause was disputed last month?"
- "What was the witness contradiction from session 1?"

Every session, they re-read 500-page documents from scratch. CourtMind fixes this.

---

## ✅ The Solution

Upload case documents → CourtMind remembers everything permanently → Ask anything → Get instant answers across infinite sessions.

---

## 🧠 Cognee Memory Lifecycle (All 4 APIs Used)

| Cognee API | CourtMind Usage |
|------------|----------------|
| `remember()` | Lawyer uploads case PDF → stored in knowledge graph |
| `recall()` | Lawyer asks question → AI recalls from case memory |
| `improve()` | After each session → memory enriched automatically |
| `forget()` | Case closed → permanently deleted from memory |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                     USER (Lawyer)                    │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              FRONTEND (React + Tailwind)             │
│   Sign In → Dashboard → Case View → Chat Interface  │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP API calls
                        ▼
┌─────────────────────────────────────────────────────┐
│              BACKEND (FastAPI + Python)              │
│                                                      │
│  POST /cases/{id}/upload  → cognee.remember()       │
│  POST /cases/{id}/ask     → cognee.recall()         │
│  POST /cases/{id}/improve → cognee.improve()        │
│  DELETE /cases/{id}       → cognee.forget()         │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│           COGNEE MEMORY LAYER (Open Source)          │
│                                                      │
│  ┌─────────────┐    ┌──────────────────────────┐   │
│  │ Vector Store │    │     Knowledge Graph       │   │
│  │  (LanceDB)   │    │       (Ladybug/Kuzu)      │   │
│  └─────────────┘    └──────────────────────────┘   │
│                                                      │
│  LLM: Groq (llama-3.3-70b-versatile)               │
│  Embeddings: FastEmbed (local, no API key needed)   │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Features

- 📁 **Upload case documents** (PDF, TXT) — remembered permanently
- ❓ **Ask questions** about any case — instant AI recall
- 🧠 **Improve memory** — knowledge graph enriched after each session
- 🗑️ **Forget cases** — surgically delete closed cases
- ⚖️ **Gold-themed dashboard** — built for legal professionals
- 🔐 **Sign in page** — with courtroom background
- 💬 **Chat interface** — ChatGPT-style conversation per case

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Tailwind CSS + Vite |
| Backend | FastAPI (Python) |
| Memory Layer | Cognee (Open Source) |
| LLM | Groq — llama-3.3-70b-versatile |
| Embeddings | FastEmbed (local) |
| Vector Store | LanceDB |
| Graph Store | Ladybug (Kuzu) |

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key (free at console.groq.com)

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/harshineevenkat-ctrl/CourtMind.git
cd CourtMind

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn cognee python-dotenv fastembed

# Create .env file
cat > .env << EOF
LLM_PROVIDER=openai
LLM_MODEL=groq/llama-3.3-70b-versatile
LLM_API_KEY=your_groq_key_here
LLM_ENDPOINT=https://api.groq.com/openai/v1
EMBEDDING_PROVIDER=fastembed
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
COGNEE_SKIP_CONNECTION_TEST=false
EOF

# Run backend
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### Frontend Setup

```bash
# Install dependencies
npm install

# Run frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/cases/{case_id}/upload` | Upload & remember case document |
| `POST` | `/cases/{case_id}/ask` | Ask question about case |
| `POST` | `/cases/{case_id}/improve` | Improve case memory |
| `DELETE` | `/cases/{case_id}` | Forget/delete case memory |
| `GET` | `/health` | Health check |

---

## 🎬 Demo

> Demo video link here

---

## 👥 Team

| Name | Role |
|------|------|
| Harshinee V | Backend + Cognee Integration |
| Aarthi R | Frontend (React + Tailwind) |
| MuthuLakshmi M | API Integration + Testing |
| Malini Priya V | Demo + Blog + Presentation |

---

## 📝 Blog Post

[> Medium/Dev.to blog link here](https://medium.com/@harshinee.venkat/courtmind-ai-giving-lawyers-a-memory-that-never-forgets-1232a84edd13)

---

## 🏆 Hackathon

**WeMakeDevs x Cognee — "The Hangover Part AI: Where's My Context?"**
June 29 – July 5, 2026

Track: **Best Use of Open Source Cognee**

---

## 📄 License

MIT License
