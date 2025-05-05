# main.py
from fastapi import FastAPI, Depends
from .index import create_indexes
from sqlalchemy.orm import Session
from . import models, schemas, crud

from .database import SessionLocal, engine, Base
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import date


Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

def get_db():
    db = SessionLocal()
    try:
        yield db
        create_indexes(db)
    finally:
        db.close()

# ------------------------ User Routes ------------------------

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    return crud.get_user(db, user_id)

@app.get("/users/", response_model=List[schemas.User])
def read_users(db: Session = Depends(get_db)):
    return crud.get_all_users(db)

@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user_update: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.update_user(db, user_id, user_update)

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    return crud.delete_user(db, user_id)

# ------------------------ Task Routes ------------------------

@app.post("/tasks/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db, task)

@app.get("/tasks/{task_id}", response_model=schemas.Task)
def read_task(task_id: int, db: Session = Depends(get_db)):
    return crud.get_task(db, task_id)

@app.get("/tasks/user/{user_id}", response_model=List[schemas.Task])
def read_tasks_by_user(user_id: int, db: Session = Depends(get_db)):
    return crud.get_tasks_by_user(db, user_id)

@app.put("/tasks/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db)):
    return crud.update_task(db, task_id, task_update)

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    return crud.delete_task(db, task_id)

# ------------------------ Note Routes ------------------------

@app.post("/notes/", response_model=schemas.Note)
def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db)):
    return crud.create_note(db, note)

@app.get("/notes/{note_id}", response_model=schemas.Note)
def read_note(note_id: int, db: Session = Depends(get_db)):
    return crud.get_note(db, note_id)

@app.get("/notes/user/{user_id}", response_model=List[schemas.Note])
def read_notes_by_user(user_id: int, db: Session = Depends(get_db)):
    return crud.get_notes_by_user(db, user_id)

@app.put("/notes/{note_id}", response_model=schemas.Note)
def update_note(note_id: int, note_update: schemas.NoteUpdate, db: Session = Depends(get_db)):
    return crud.update_note(db, note_id, note_update)

@app.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    return crud.delete_note(db, note_id)

# ------------------------ Custom Utility Routes ------------------------

@app.delete("/notes/cleanup/{user_id}/{days}")
def cleanup_old_notes(user_id: int, days: int, db: Session = Depends(get_db)):
    crud.delete_old_notes(db, user_id, days)
    return {"message": f"Deleted notes older than {days} days for user {user_id}"}

@app.delete("/tasks/cleanup/{user_id}/{days}")
def cleanup_old_tasks(user_id: int, days: int, db: Session = Depends(get_db)):
    crud.delete_old_tasks(db, user_id, days)
    return {"message": f"Deleted tasks older than {days} days for user {user_id}"}

@app.get("/tasks/filter/{user_id}/{target_date}/{finished}")
def get_filtered_tasks(user_id: int, target_date: date, finished: bool, db: Session = Depends(get_db)):
    return crud.get_tasks_by_date_and_status(db, user_id, target_date, finished)

@app.post("/tasks/{task_id}/complete")
def mark_complete(task_id: int, db: Session = Depends(get_db)):
    crud.mark_task_complete(db, task_id)
    return {"message": f"Task {task_id} marked as complete"}

@app.get("/tasks/range/{user_id}/{start_date}/{end_date}")
def get_tasks_range(user_id: int, start_date: date, end_date: date, db: Session = Depends(get_db)):
    return crud.get_tasks_in_date_range(db, user_id, start_date, end_date)


@app.get("/reports/tasks/completion")
def get_task_completion_report(
    user_id: int,
    start_date: date,
    end_date: date,
    finished: Optional[bool] = None,
    importance: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return crud.task_completion_report(db, user_id, start_date, end_date, finished, importance)


@app.get("/reports/notes/activity")
def get_note_activity_report(
    user_id: int,
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db)
):
    return crud.note_activity_report(db, user_id, start_date, end_date)