from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from datetime import date, timedelta
from sqlalchemy import text
from .models import Task as TaskModel
from .schemas import Task as TaskSchema
from . import schemas
from . import models

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


# ------------------------ Task CRUD ------------------------

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

# ------------------------ Note CRUD ------------------------

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



# ------------------------ Custom Prepared Queries ------------------------

def delete_old_notes(db: Session, user_id: int, days: int):
    cutoff_date = date.today() - timedelta(days=days)
    stmt = text("DELETE FROM notes WHERE user_id = :user_id AND date_created < :cutoff")
    db.execute(stmt, {"user_id": user_id, "cutoff": cutoff_date})
    db.commit()


def delete_old_tasks(db: Session, user_id: int, days: int):
    cutoff_date = date.today() - timedelta(days=days)
    stmt = text("DELETE FROM tasks WHERE user_id = :user_id AND date_made < :cutoff")
    db.execute(stmt, {"user_id": user_id, "cutoff": cutoff_date})
    db.commit()


def get_tasks_by_date_and_status(db: Session, user_id: int, target_date: date, finished: bool):
    stmt = text("SELECT * FROM tasks WHERE user_id = :user_id AND due_date = :date AND finished = :finished")
    return db.execute(stmt, {"user_id": user_id, "date": target_date, "finished": int(finished)}).fetchall()


def mark_task_complete(db: Session, task_id: int):
    stmt = text("UPDATE tasks SET finished = 1, date_finished = :today WHERE task_id = :task_id")
    db.execute(stmt, {"task_id": task_id, "today": date.today()})
    db.commit()



def task_completion_report(
    db: Session,
    user_id: int,
    start_date: date,
    end_date: date,
    finished: Optional[bool] = None,
    importance: Optional[int] = None
):
    # start with user + date filters
    conditions = [
        "user_id = :user_id",
        "due_date BETWEEN :start AND :end"
    ]
    params = {
        "user_id": user_id,
        "start": start_date,
        "end": end_date
    }

    if finished is not None:
        conditions.append("finished = :finished")
        params["finished"] = int(finished)  # SQLite stores booleans as integers

    if importance is not None:
        conditions.append("importance >= :importance")  # Changed to >= for importance filter
        params["importance"] = importance

    where_clause = " AND ".join(conditions)

    stmt = text(f"""
        SELECT
            COUNT(*) AS total_tasks,
            SUM(CASE WHEN finished = 1 THEN 1 ELSE 0 END) AS completed_tasks,
            AVG(CASE WHEN finished = 1 AND date_finished IS NOT NULL AND date_made IS NOT NULL
                THEN JULIANDAY(date_finished) - JULIANDAY(date_made) 
                ELSE NULL END) AS avg_completion_days,
            COALESCE(AVG(importance), 0) AS avg_importance,
            CASE WHEN COUNT(*) > 0 
                THEN ROUND(SUM(CASE WHEN finished = 1 THEN 1.0 ELSE 0 END) / COUNT(*), 2)
                ELSE 0 END AS completion_rate
        FROM tasks
        WHERE {where_clause}
    """)

    result = db.execute(stmt, params).mappings().first()
    
    # Convert any None values to appropriate defaults in the result
    result_dict = dict(result)
    if result_dict["total_tasks"] == 0:
        return {
            "total_tasks": 0,
            "completed_tasks": 0,
            "avg_completion_days": 0,
            "avg_importance": 0,
            "completion_rate": 0
        }
    
    # Handle potential NULL values
    result_dict["completed_tasks"] = result_dict["completed_tasks"] or 0
    result_dict["avg_completion_days"] = result_dict["avg_completion_days"] or 0
    result_dict["avg_importance"] = result_dict["avg_importance"] or 0
    result_dict["completion_rate"] = result_dict["completion_rate"] or 0
    
    return result_dict


def note_activity_report(db: Session, user_id: int, start_date: date, end_date: date):
    stmt = text("""
        SELECT COUNT(*) AS total_notes
        FROM notes
        WHERE user_id = :user_id AND date_created >= :start AND date_created <= :end
    """)
    result = db.execute(
        stmt,
        {"user_id": user_id, "start": start_date, "end": end_date}
    ).mappings().first()
    return dict(result)


def get_tasks_in_date_range(db: Session, user_id: int, start_date: date, end_date: date):
    stmt = text("""
        SELECT * FROM tasks 
        WHERE user_id = :user_id 
        AND due_date BETWEEN :start AND :end
    """)
    result = db.execute(stmt, {
        "user_id": user_id,
        "start": start_date,
        "end": end_date
    }).fetchall()

    # Convert each row to a dictionary (safe and clean)
    return [dict(row._mapping) for row in result]

