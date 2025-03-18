from fastapi import FastAPI
from app.routes import router

app = FastAPI(title="Lead Scoring API")

# Register Routes
app.include_router(router)

@app.get("/")
def root():
    return {"message": "Lead Scoring API is running!"}
