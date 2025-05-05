from sqlalchemy import text
from sqlalchemy.orm import Session

def create_indexes(db: Session):
    db.execute(text("CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)"))
    db.execute(text("CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)"))
    db.execute(text("CREATE INDEX IF NOT EXISTS idx_tasks_user_due ON tasks(user_id, due_date)"))
    db.execute(text("CREATE INDEX IF NOT EXISTS idx_tasks_finished ON tasks(finished)"))
    db.execute(text("CREATE INDEX IF NOT EXISTS idx_tasks_importance ON tasks(importance)"))
    db.execute(text("CREATE INDEX IF NOT EXISTS idx_tasks_dates ON tasks(date_made, date_finished)"))
    db.execute(text("CREATE INDEX IF NOT EXISTS idx_notes_user_date ON notes(user_id, date_created)"))
    db.commit()