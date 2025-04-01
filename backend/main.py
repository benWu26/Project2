# main.py
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models, schemas, crud
from database import SessionLocal, engine, Base
from fastapi.middleware.cors import CORSMiddleware

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
    finally:
        db.close()

# User Routes
@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)

@app.get("/users/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    return crud.get_user(db, user_id)

@app.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, user_update: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.update_user(db, user_id, user_update)

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    return crud.delete_user(db, user_id)

# Task Routes
@app.post("/tasks/", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db, task)

@app.get("/tasks/{task_id}", response_model=schemas.TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    return crud.get_task(db, task_id)

@app.put("/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db)):
    return crud.update_task(db, task_id, task_update)

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    return crud.delete_task(db, task_id)

@app.post("/projects/", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    return crud.create_project(db, project)

@app.get("/projects/{project_id}", response_model=schemas.ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    return crud.get_project(db, project_id)

@app.put("/projects/{project_id}", response_model=schemas.ProjectResponse)
def update_project(project_id: int, project_update: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    return crud.update_project(db, project_id, project_update)

@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    return crud.delete_project(db, project_id)

# ------------------------ Subtask Routes ------------------------

@app.post("/subtasks/", response_model=schemas.SubtaskResponse)
def create_subtask(subtask: schemas.SubtaskCreate, db: Session = Depends(get_db)):
    return crud.create_subtask(db, subtask)

@app.get("/subtasks/{subtask_id}", response_model=schemas.SubtaskResponse)
def get_subtask(subtask_id: int, db: Session = Depends(get_db)):
    return crud.get_subtask(db, subtask_id)

@app.put("/subtasks/{subtask_id}", response_model=schemas.SubtaskResponse)
def update_subtask(subtask_id: int, subtask_update: schemas.SubtaskUpdate, db: Session = Depends(get_db)):
    return crud.update_subtask(db, subtask_id, subtask_update)

@app.delete("/subtasks/{subtask_id}")
def delete_subtask(subtask_id: int, db: Session = Depends(get_db)):
    return crud.delete_subtask(db, subtask_id)

# ------------------------ Note Routes ------------------------

@app.post("/notes/", response_model=schemas.NoteResponse)
def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db)):
    return crud.create_note(db, note)

@app.get("/notes/{note_id}", response_model=schemas.NoteResponse)
def get_note(note_id: int, db: Session = Depends(get_db)):
    return crud.get_note(db, note_id)

@app.put("/notes/{note_id}", response_model=schemas.NoteResponse)
def update_note(note_id: int, note_update: schemas.NoteUpdate, db: Session = Depends(get_db)):
    return crud.update_note(db, note_id, note_update)

@app.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    return crud.delete_note(db, note_id)

@app.get("/tasks/{task_id}/subtasks/", response_model=list[schemas.SubtaskResponse])
def get_subtasks_by_task(task_id: int, db: Session = Depends(get_db)):
    return crud.get_subtasks_by_task(db, task_id)

@app.get("/users/", response_model=list[schemas.UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return crud.get_all_users(db)

@app.get("/users/{user_id}/tasks/", response_model=list[schemas.TaskResponse])
def get_tasks_by_user(user_id: int, db: Session = Depends(get_db)):
    print("get users")
    return crud.get_tasks_by_user(db, user_id)

@app.get("/users/{user_id}/projects/", response_model=list[schemas.ProjectResponse])
def get_projects_by_user(user_id: int, db: Session = Depends(get_db)):
    return crud.get_projects_by_user(db, user_id)

@app.get("/users/{user_id}/notes/", response_model=list[schemas.NoteResponse])
def get_notes_by_user(user_id: int, db: Session = Depends(get_db)):
    return crud.get_notes_by_user(db, user_id)
