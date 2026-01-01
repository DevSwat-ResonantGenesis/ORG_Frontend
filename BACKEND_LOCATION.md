# Backend Repository Locations

## 📍 Local Development

### Main Backend Folder
**Path:** `/Applications/ResonantGraphAIV0.1/`

### Backend Code
**Path:** `/Applications/ResonantGraphAIV0.1/backend/fastapi_app/`

### Key Files
- **Main Entry:** `/Applications/ResonantGraphAIV0.1/backend/fastapi_app/main.py`
- **Code Router:** `/Applications/ResonantGraphAIV0.1/backend/fastapi_app/routers/code.py`
- **Code Services:**
  - `/Applications/ResonantGraphAIV0.1/backend/fastapi_app/services/code_context.py`
  - `/Applications/ResonantGraphAIV0.1/backend/fastapi_app/services/code_indexer.py`
  - `/Applications/ResonantGraphAIV0.1/backend/fastapi_app/services/code_parser.py`
- **Docker Compose:** `/Applications/ResonantGraphAIV0.1/docker-compose.yml`

### Structure
```
/Applications/ResonantGraphAIV0.1/
├── backend/
│   ├── fastapi_app/
│   │   ├── main.py              # FastAPI app entry
│   │   ├── routers/
│   │   │   └── code.py          # Code features API
│   │   ├── services/
│   │   │   ├── code_context.py  # Code context service
│   │   │   ├── code_indexer.py  # Code indexing service
│   │   │   └── code_parser.py   # Code parsing service
│   │   └── models/
│   │       └── governance/
│   │           └── code.py      # Code model
│   └── tests/
├── ml/                          # ML worker
├── docker-compose.yml           # Docker setup
└── README.md
```

---

## 🌐 Production (Droplet)

### Backend Directory
**Path:** `/root/ResonantGraphAIV0.1/`

### Backend URL
- **Direct:** `http://137.184.234.252:8001`
- **Proxied:** `https://dev-swat.com/api`
- **Docs:** `http://137.184.234.252:8001/docs`

---

## 🔗 GitHub Repository

### Backend Repo
**URL:** `https://github.com/louienemesh/ResonantGenesis_Graph.git` (likely)
**Branch:** `main`

---

## 🚀 Quick Commands

### Local Development

#### Start Backend
```bash
cd /Applications/ResonantGraphAIV0.1
docker compose up -d
```

#### Or Run Locally (without Docker)
```bash
cd /Applications/ResonantGraphAIV0.1/backend/fastapi_app
python -m venv .venv
source .venv/bin/activate
pip install -r ../fastapi_requirements.txt
uvicorn fastapi_app.main:app --reload --port 8001
```

#### Check Status
```bash
cd /Applications/ResonantGraphAIV0.1
docker compose ps
```

#### View Logs
```bash
cd /Applications/ResonantGraphAIV0.1
docker compose logs api -f
```

### Production (Droplet)

#### Navigate to Backend
```bash
cd /root/ResonantGraphAIV0.1
```

#### Pull Latest Code
```bash
git pull origin main
```

#### Restart Services
```bash
docker compose restart api
```

---

## 📝 Code Features Already Implemented

Based on the file structure, the backend already has:

1. **Code Router** (`routers/code.py`)
   - Handles `/code/*` endpoints

2. **Code Services:**
   - `code_context.py` - Code context management
   - `code_indexer.py` - Code indexing
   - `code_parser.py` - Code parsing

3. **Code Model** (`models/governance/code.py`)
   - Database model for code features

4. **Migrations:**
   - `db/migrations/add_code_features.sql` - Code features schema

---

## 🔧 Next Steps for Project Building

To add project-building features, we need to:

1. **Check existing code endpoints** in `routers/code.py`
2. **Enhance code generation** to support multi-file projects
3. **Add project context** understanding
4. **Add file operations** (create/edit/delete)
5. **Add project templates** system

Let's start by examining what's already there!

