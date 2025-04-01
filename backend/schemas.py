# schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import date, time

# User Schemas
class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    user_id: int

    class Config:
        from_attributes = True

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: date
    due_time: Optional[time] = None
    importance: Optional[int] = None
    project_id: Optional[int] = None
    user_id: int
    finished: Optional[bool] = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    pass

class TaskResponse(TaskBase):
    task_id: int
    date_made: date
    date_finished: Optional[date] = None

    class Config:
        from_attributes = True

# Subtask Schemas
class SubtaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    task_id: int

class SubtaskCreate(SubtaskBase):
    pass

class SubtaskUpdate(SubtaskBase):
    pass

class SubtaskResponse(SubtaskBase):
    subtask_id: int
    date_made: date
    date_finished: Optional[date] = None

    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    title: str
    user_id: int
    color: Optional[str] = "blue"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    project_id: int

    class Config:
        from_attributes = True

# Note Schemas
class NoteBase(BaseModel):
    title: str
    description: Optional[str] = None
    user_id: int

class NoteCreate(NoteBase):
    pass

class NoteUpdate(NoteBase):
    pass

class NoteResponse(NoteBase):
    note_id: int

    class Config:
        from_attributes = True
