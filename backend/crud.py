# crud.py
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import models, schemas
from fastapi import HTTPException

# ------------------------ User CRUD ------------------------

def create_user(db: Session, user: schemas.UserCreate):
    try:
        db_user = models.User(**user.dict())
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already exists.")

def get_user(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user

def get_all_users(db: Session):
    return db.query(models.User).all()

def update_user(db: Session, user_id: int, user_update: schemas.UserCreate):
    user = get_user(db, user_id)
    for key, value in user_update.dict().items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    user = get_user(db, user_id)
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


def create_task(db: Session, task: schemas.TaskCreate):
    db_task = models.Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_task(db: Session, task_id: int):
    task = db.query(models.Task).filter(models.Task.task_id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    return task

def get_tasks_by_user(db: Session, user_id: int):
    return db.query(models.Task).filter(models.Task.user_id == user_id).all()

def update_task(db: Session, task_id: int, task_update: schemas.TaskUpdate):
    task = get_task(db, task_id)
    for key, value in task_update.dict(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: int):
    task = get_task(db, task_id)
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}


def create_subtask(db: Session, subtask: schemas.SubtaskCreate):
    db_subtask = models.Subtask(**subtask.dict())
    db.add(db_subtask)
    db.commit()
    db.refresh(db_subtask)
    return db_subtask

def get_subtask(db: Session, subtask_id: int):
    subtask = db.query(models.Subtask).filter(models.Subtask.subtask_id == subtask_id).first()
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found.")
    return subtask

def get_subtasks_by_task(db: Session, task_id: int):
    return db.query(models.Subtask).filter(models.Subtask.task_id == task_id).all()


def update_subtask(db: Session, subtask_id: int, subtask_update: schemas.SubtaskUpdate):
    subtask = get_subtask(db, subtask_id)
    for key, value in subtask_update.dict(exclude_unset=True).items():
        setattr(subtask, key, value)
    db.commit()
    db.refresh(subtask)
    return subtask

def delete_subtask(db: Session, subtask_id: int):
    subtask = get_subtask(db, subtask_id)
    db.delete(subtask)
    db.commit()
    return {"message": "Subtask deleted successfully"}


def create_project(db: Session, project: schemas.ProjectCreate):
    db_project = models.Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def get_project(db: Session, project_id: int):
    project = db.query(models.Project).filter(models.Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project

def get_projects_by_user(db: Session, user_id: int):
    return db.query(models.Project).filter(models.Project.user_id == user_id).all()

def update_project(db: Session, project_id: int, project_update: schemas.ProjectUpdate):
    project = get_project(db, project_id)
    for key, value in project_update.dict(exclude_unset=True).items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    return project

def delete_project(db: Session, project_id: int):
    project = get_project(db, project_id)
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}


def create_note(db: Session, note: schemas.NoteCreate):
    db_note = models.Note(**note.dict())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def get_note(db: Session, note_id: int):
    note = db.query(models.Note).filter(models.Note.note_id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found.")
    return note

def get_notes_by_user(db: Session, user_id: int):
    return db.query(models.Note).filter(models.Note.user_id == user_id).all()

def update_note(db: Session, note_id: int, note_update: schemas.NoteUpdate):
    note = get_note(db, note_id)
    for key, value in note_update.dict(exclude_unset=True).items():
        setattr(note, key, value)
    db.commit()
    db.refresh(note)
    return note

def delete_note(db: Session, note_id: int):
    note = get_note(db, note_id)
    db.delete(note)
    db.commit()
    return {"message": "Note deleted successfully"}
