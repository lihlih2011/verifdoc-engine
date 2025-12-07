from fastapi import FastAPI
from backend.api.vision_api import router as vision_router
from backend.api.analysis_history import router as analysis_history_router # Import new router
from backend.app.config import settings
from backend.app.database import Base, engine # Import Base and engine

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)

app.include_router(vision_router)
app.include_router(analysis_history_router) # Include new router

@app.get("/")
async def read_root():
    return {"message": "Welcome to VerifDoc Backend"}