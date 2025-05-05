import uvicorn
from app import app           # <‑‑ this now works; `app` is in the package

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)