from sqlalchemy import text
from .database import SessionLocal

db = SessionLocal()

db.execute(text("DELETE FROM users"))
db.execute(text("DELETE FROM tasks"))
db.execute(text("DELETE FROM notes"))

db.commit()
db.close()

print("Database cleared")