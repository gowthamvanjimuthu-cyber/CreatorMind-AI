# Local Development Setup

## Prerequisites
- Python 3.11+
- Node.js 20+
- Docker (optional)

## Backend

```bash
cd CreatorMind/backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your credentials

uvicorn app.main:app --reload
# → http://localhost:8000/docs
```

## Frontend

```bash
cd CreatorMind/frontend
npm install
npm run dev
# → http://localhost:5173
```

## With Docker Compose

```bash
cd CreatorMind
docker-compose up --build
# Backend → http://localhost:8000
# Frontend → http://localhost:3000
```
