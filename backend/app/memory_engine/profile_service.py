from typing import Optional
from app.memory_engine.models import CreatorProfile
import datetime
import logging

logger = logging.getLogger("creatormind")

# In-Memory DB Mock referencing the Profile persistence logic (avoids full SQL overhead for story validation)
PROFILE_DB = {}

class CreatorProfileService:
    """Manages retrieval and incremental persistence of the creator's persona metrics."""
    
    def get_profile(self, user_id: str) -> CreatorProfile:
        if user_id in PROFILE_DB:
            return PROFILE_DB[user_id]
        
        # Return a blank new profile dynamically constructed for this user
        new_prof = CreatorProfile(user_id=user_id)
        PROFILE_DB[user_id] = new_prof
        return new_prof
        
    def save_profile(self, profile: CreatorProfile) -> bool:
        profile.updated_at = datetime.datetime.utcnow()
        PROFILE_DB[profile.user_id] = profile
        return True
