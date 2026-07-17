# Installation Guide ⚙️

Below are the instructions to bootstrap the CreatorMind AI application on a local development machine. 

## 1. Prerequisites
- **Python:** 3.10 or higher.
- **Node.js:** 18 or higher.
- **npm** or **yarn**.

## 2. Environment Variables
You must set up environment structures inside the `backend/` folder.
Create a `.env` file in the `backend/` root directory mapping the following:
```env
# SECURITY
JWT_SECRET=your_super_secret_key
DATABASE_URL=sqlite:///./creatormind.db

# IBM AI INTEGRATION
WATSONX_API_KEY=your_ibm_api_key
WATSONX_PROJECT_ID=your_ibm_project_id
CHROMA_DB_DIR=./chroma_data
```

## 3. Backend Setup
The backend utilizes Python dependencies built around FastAPI, SQLAlchemy, and ChromaDB.

1. Navigate to the backend root layer:
   ```bash
   cd backend
   ```
2. Spawn a virtual environment securely:
   ```bash
   python -m venv venv
   source venv/Scripts/activate # Windows
   ```
3. Install necessary pip wheels:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations (SQLite will generate implicitly via Alembic or generic Base metadata hooks mappings). Ensure SQL cascading logic is enforced.
5. Initialize Uvicorn Server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
Your backend now natively responds to `http://localhost:8000/docs`.

## 4. Frontend Setup
The frontend uses Vite driving React + Zustand natively.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Fetch node requirements:
   ```bash
   npm install
   ```
3. Boot the local ESBuild dev runner:
   ```bash
   npm run dev
   ```
The frontend UI will be alive at `http://localhost:5173/`. 
