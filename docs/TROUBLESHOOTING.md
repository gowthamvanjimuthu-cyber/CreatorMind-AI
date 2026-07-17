# Troubleshooting Guide

## Backend won't start
- Check all required env vars in `.env`
- Run `pip install -r requirements.txt` again
- Ensure Python 3.11+ is active

## IBM Granite returns errors
- Verify `IBM_API_KEY` and `IBM_PROJECT_ID` are correct
- Check the regional `IBM_URL` matches your project region
- Set `AI_PROVIDER=mock` to confirm the rest of the stack works

## ChromaDB errors on startup
- Delete `backend/chroma_data/` and restart — Chroma will rebuild
- Ensure the `./chroma_data` path is writable

## JWT / Auth errors (401)
- Confirm `JWT_SECRET` matches what Supabase uses to sign tokens
- Tokens expire — re-login to get a fresh token

## Upload always returns 400
- Confirm the file extension is `.pdf`, `.docx`, `.md`, or `.txt`
- Check file is under 10 MB

## Rate limit (429) on chat
- Default: 20 requests / 60 seconds per IP
- Adjust `MAX_REQUESTS` in `app/middleware/rate_limit.py`
