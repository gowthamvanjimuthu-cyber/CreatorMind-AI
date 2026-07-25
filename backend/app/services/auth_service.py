import logging
import uuid
from types import SimpleNamespace

from fastapi import HTTPException, status
from supabase import Client, create_client

from app.core.config import settings
from app.schemas.auth import UserCreate, UserLogin

logger = logging.getLogger("creatormind")

LOCAL_USERS = {}
LOCAL_TOKENS = {}

# Graceful initialization for environments missing SUPABASE_URL during early setup.
try:
    supabase: Client | None = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
except Exception as exc:
    logger.warning("Supabase configuration missing or invalid. Falling back to local dev auth: %s", exc)
    supabase = None


class AuthService:
    @staticmethod
    def sign_up(user: UserCreate):
        if supabase:
            try:
                res = supabase.auth.sign_up({"email": user.email, "password": user.password})
                if not res or not res.user:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sign up failed")
                return res
            except Exception as exc:
                logger.error("Signup error: %s", exc)
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

        user_id = str(uuid.uuid4())
        LOCAL_USERS[str(user.email)] = {"id": user_id, "password": user.password}
        return SimpleNamespace(user=SimpleNamespace(id=user_id, email=str(user.email)))

    @staticmethod
    def sign_in(user: UserLogin):
        if supabase:
            try:
                res = supabase.auth.sign_in_with_password({"email": user.email, "password": user.password})
                if not res or not res.session:
                    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credential response")
                return res
            except Exception as exc:
                logger.error("Signin error: %s", exc)
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        stored = LOCAL_USERS.get(str(user.email))
        if not stored or stored["password"] != user.password:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        token = f"local-dev-token::{stored['id']}::{user.email}"
        LOCAL_TOKENS[token] = stored["id"]
        session = SimpleNamespace(access_token=token, refresh_token=token)
        return SimpleNamespace(session=session)

    @staticmethod
    def sign_out(token: str):
        if supabase:
            try:
                pass
            except Exception as exc:
                logger.error("Signout error: %s", exc)
        LOCAL_TOKENS.pop(token, None)
        return True

    @staticmethod
    def get_user(token: str):
        if supabase:
            try:
                res = supabase.auth.get_user(token)
                if not res or not hasattr(res, "user") or not res.user:
                    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
                return res.user
            except Exception as exc:
                logger.error("Get User error: %s", exc)
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

        if token and token.startswith("local-dev-token::"):
            parts = token.split("::", 2)
            if len(parts) == 3:
                user_id, email = parts[1], parts[2]
                return SimpleNamespace(id=user_id, email=email)

        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
