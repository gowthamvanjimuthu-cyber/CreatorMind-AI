# Production Deployment Guide

## IBM Code Engine (Recommended)

```bash
# 1. Login
ibmcloud login
ibmcloud ce project select --name creatormind

# 2. Backend
ibmcloud ce application create \
  --name creatormind-backend \
  --image icr.io/<namespace>/creatormind-backend:latest \
  --port 8000 \
  --env-from-secret creatormind-secrets

# 3. Frontend
ibmcloud ce application create \
  --name creatormind-frontend \
  --image icr.io/<namespace>/creatormind-frontend:latest \
  --port 80
```

## Render.com (Quick Deploy)

1. Create a new **Web Service** → connect your GitHub repo
2. **Root Directory:** `backend`
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add all env vars from `.env.example` in the Render dashboard

## Required Production Environment Variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `JWT_SECRET` | Strong random secret (32+ chars) |
| `AI_PROVIDER` | `granite` for production |
| `IBM_API_KEY` | IBM Cloud API key |
| `IBM_PROJECT_ID` | watsonx.ai project ID |
| `IBM_URL` | watsonx regional endpoint |
| `IBM_MODEL_ID` | e.g. `ibm/granite-13b-chat-v2` |
| `ALLOWED_ORIGINS` | Your frontend URL |
