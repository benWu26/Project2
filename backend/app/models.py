# models.py
from sqlalchemy import Column, Integer, String, ForeignKey, Date, Time, Boolean, Text, func, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)

    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    task_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    date_made = Column(Date, default=datetime.now(), nullable=False)
    date_finished = Column(Date, nullable=True)
    due_date = Column(Date, nullable=False)
    due_time = Column(Time, nullable=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    finished = Column(Boolean, default=False)
    importance = Column(Integer, nullable=True)  # Optional importance field

    user = relationship("User", back_populates="tasks")

    __table_args__ = (
        Index('idx_tasks_user_due', 'user_id', 'due_date'),
        Index('idx_tasks_dates', 'date_made', 'date_finished'),
    )

class Note(Base):
    __tablename__ = "notes"

    note_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    date_created = Column(Date, server_default=func.date('now'))

    user = relationship("User", back_populates="notes")  # This requires User.notes to exist

    __table_args__ = (
        Index('idx_notes_user_date', 'user_id', 'date_created'),
    )