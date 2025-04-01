# models.py
from sqlalchemy import Column, Integer, String, ForeignKey, Date, Time, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)

    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    task_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    date_made = Column(Date, default=datetime.utcnow().date(), nullable=False)
    date_finished = Column(Date, nullable=True)
    due_date = Column(Date, nullable=False)
    due_time = Column(Time, nullable=True)
    importance = Column(Integer, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.project_id", ondelete="CASCADE"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    finished = Column(Boolean, default=False)

    user = relationship("User", back_populates="tasks")
    project = relationship("Project", back_populates="tasks", passive_deletes=True)
    subtasks = relationship("Subtask", back_populates="task", cascade="all, delete-orphan")


class Subtask(Base):
    __tablename__ = "subtasks"

    subtask_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    date_made = Column(Date, default=datetime.utcnow().date(), nullable=False)
    date_finished = Column(Date, nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.task_id", ondelete="CASCADE"), nullable=False)

    task = relationship("Task", back_populates="subtasks", passive_deletes=True)


class Project(Base):
    __tablename__ = "projects"

    project_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    color = Column(String, nullable=True, default="blue")

    user = relationship("User", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")


class Note(Base):
    __tablename__ = "notes"

    note_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    user = relationship("User", back_populates="notes")
