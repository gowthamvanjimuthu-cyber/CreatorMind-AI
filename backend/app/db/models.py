from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, UniqueConstraint, Float
from sqlalchemy.orm import declarative_base, relationship
import datetime, uuid

Base = declarative_base()

def _uuid(): return str(uuid.uuid4())
def _now():  return datetime.datetime.utcnow()


class Workspace(Base):
    __tablename__ = "workspaces"
    __table_args__ = (UniqueConstraint("user_id", "name", name="uq_user_workspace_name"),)

    id           = Column(String, primary_key=True, default=_uuid)
    user_id      = Column(String, nullable=False, index=True)
    name         = Column(String, nullable=False)
    description  = Column(String, default="")
    created_at   = Column(DateTime, default=_now)
    updated_at   = Column(DateTime, default=_now, onupdate=_now)

    conversations = relationship("Conversation", back_populates="workspace",
                                 cascade="all, delete-orphan")
    documents     = relationship("Document", back_populates="workspace",
                                 cascade="all, delete-orphan")
    generations   = relationship("WritingGeneration", back_populates="workspace",
                                 cascade="all, delete-orphan")


class Conversation(Base):
    __tablename__ = "conversations"

    id            = Column(String, primary_key=True, default=_uuid)
    user_id       = Column(String, nullable=False, index=True)
    workspace_id  = Column(String, ForeignKey("workspaces.id"), nullable=False, index=True)
    title         = Column(String, nullable=False, default="New Conversation")
    message_count = Column(Integer, default=0)
    created_at    = Column(DateTime, default=_now)
    updated_at    = Column(DateTime, default=_now, onupdate=_now)

    workspace = relationship("Workspace", back_populates="conversations")
    messages  = relationship("Message", back_populates="conversation",
                             cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id              = Column(String, primary_key=True, default=_uuid)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False, index=True)
    role            = Column(String, nullable=False)
    content         = Column(Text, nullable=False)
    sources         = Column(Text, nullable=True)
    latency         = Column(Float, default=0.0)
    created_at      = Column(DateTime, default=_now)

    conversation = relationship("Conversation", back_populates="messages")


class Document(Base):
    __tablename__ = "documents"

    id            = Column(String, primary_key=True, default=_uuid)
    user_id       = Column(String, nullable=False, index=True)
    workspace_id  = Column(String, ForeignKey("workspaces.id"), nullable=False, index=True)
    filename      = Column(String, nullable=False)
    file_type     = Column(String, nullable=False)
    file_size     = Column(Integer, default=0)
    chunk_count   = Column(Integer, default=0)
    status        = Column(String, default="INDEXED") # INDEXED, FAILED
    preview_text  = Column(Text, nullable=True)
    keywords      = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at    = Column(DateTime, default=_now)

    workspace     = relationship("Workspace", back_populates="documents")


class WritingGeneration(Base):
    __tablename__ = "writing_generations"

    id                 = Column(String, primary_key=True, default=_uuid)
    user_id            = Column(String, nullable=False, index=True)
    workspace_id       = Column(String, ForeignKey("workspaces.id"), nullable=False, index=True)
    parent_id          = Column(String, ForeignKey("writing_generations.id"), nullable=True, index=True) # for version history
    version_number     = Column(Integer, default=1)
    status             = Column(String, default="DRAFT") # DRAFT, SAVED
    is_favorite        = Column(Integer, default=0) # boolean 0/1
    content_type       = Column(String, nullable=False) # linkedin_post, blog, etc.
    topic              = Column(Text, nullable=False)
    instructions       = Column(Text, nullable=True)
    generated_content  = Column(Text, nullable=False)
    generation_time    = Column(Float, default=0.0)
    confidence_score   = Column(Float, default=0.0)
    style_match_score  = Column(Float, default=0.0)
    citations          = Column(Text, nullable=True) # JSON list of citations
    source_documents   = Column(Text, nullable=True) # JSON list of doc IDs/names
    created_at         = Column(DateTime, default=_now)

    workspace          = relationship("Workspace", back_populates="generations")
    parent             = relationship("WritingGeneration", remote_side=[id], backref="versions")

