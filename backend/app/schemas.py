# schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import date, time

from pydantic import BaseModel
from typing import Optional
from datetime import date

# -------------------- User --------------------

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    user_id: int

    class Config:
        orm_mode = True


# -------------------- Task --------------------

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: date
    due_time: Optional[time] = None  # use `time` type here
    importance: Optional[int] = None
    user_id: int
    finished: Optional[bool] = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[time] = None  # use `time` type here
    importance: Optional[int] = None
    finished: Optional[bool] = None

class Task(TaskBase):
    task_id: int
    date_made: date
    date_finished: Optional[date] = None

    class Config:
        orm_mode = True


# -------------------- Note --------------------

class NoteBase(BaseModel):
    title: str
    description: Optional[str] = None
    user_id: int

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class Note(NoteBase):
    note_id: int
    date_created: date

    class Config:
        orm_mode = True
