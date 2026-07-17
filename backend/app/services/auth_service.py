from supabase import create_client, Client
from app.core.config import settings
from app.schemas.auth import UserCreate, UserLogin
from fastapi import HTTPException, status
import logging

logger = logging.getLogger("creatormind")

# Graceful initialization for environments missing SUPABASE_URL during early setup.
try:
    supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
except Exception as e:
    logger.warning("Supabase configuration missing or invalid. Auth endpoints will fail if called.")
    supabase = None

class AuthService:
    @staticmethod
    def sign_up(user: UserCreate):
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured in backend.")
        try:
            res = supabase.auth.sign_up({"email": user.email, "password": user.password})
            if not res or not res.user:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sign up failed")
            return res
        except Exception as e:
            logger.error(f"Signup error: {e}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    @staticmethod
    def sign_in(user: UserLogin):
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured in backend.")
        try:
            res = supabase.auth.sign_in_with_password({"email": user.email, "password": user.password})
            if not res or not res.session:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credential response")
            return res
        except Exception as e:
            logger.error(f"Signin error: {e}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    @staticmethod
    def sign_out(token: str):
        # Supabase stateless JWTs are generally managed client-side, 
        # but we can trigger a sign out server-side if tracking sessions.
        if supabase:
            try:
                # Assuming the client sets the auth header correctly inside the SDK,
                # though usually logout is simply clearing the token on the frontend.
                pass
            except Exception as e:
                logger.error(f"Signout error: {e}")
        return True

    @staticmethod
    def get_user(token: str):
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured in backend.")
        try:
            res = supabase.auth.get_user(token)
            if not res or not hasattr(res, 'user') or not res.user:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
            return res.user
        except Exception as e:
            logger.error(f"Get User error: {e}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
