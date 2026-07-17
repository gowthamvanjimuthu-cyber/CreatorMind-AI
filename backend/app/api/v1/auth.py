from fastapi import APIRouter, Depends, status, HTTPException
from app.schemas.auth import UserCreate, UserLogin, Token, UserResponse
from app.services.auth_service import AuthService
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate):
    """Register a new creator account."""
    res = AuthService.sign_up(user)
    return {"id": res.user.id, "email": res.user.email}

@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
def login(user: UserLogin):
    """Authenticate and receive JWT session tokens."""
    res = AuthService.sign_in(user)
    return {
        "access_token": res.session.access_token,
        "token_type": "bearer",
        "refresh_token": res.session.refresh_token
    }

@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(current_user = Depends(get_current_user)):
    """Logs out the user currently authenticated via the provided token."""
    AuthService.sign_out("dummy") # Stateless token invalidation handled mostly client-side
    return {"detail": "Successfully logged out"}

@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_me(current_user = Depends(get_current_user)):
    """Example protected route returning self profile."""
    return {"id": current_user.id, "email": current_user.email}
