from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles # Import StaticFiles
from backend.api.vision_api import router as vision_router
from backend.api.analysis_history import router as analysis_history_router
from backend.api.report_api import router as report_router
from backend.api.verify_api import router as verify_router
from backend.api.signature_api import router as signature_router
from backend.api.embedded_api import router as embedded_router # NEW IMPORT
from backend.app.config import settings
from backend.app.database import Base, engine
import os # Import os

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)

# Mount static files directory for heatmaps
# Ensure the 'heatmaps' directory exists relative to the backend/app directory
heatmaps_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "heatmaps")
os.makedirs(heatmaps_dir, exist_ok=True)
app.mount("/heatmaps", StaticFiles(directory=heatmaps_dir), name="heatmaps")

app.include_router(vision_router)
app.include_router(analysis_history_router)
app.include_router(report_router)
app.include_router(verify_router)
app.include_router(signature_router)
app.include_router(embedded_router) # NEW: Register the new router

@app.get("/")
async def read_root():
    return {"message": "Welcome to VerifDoc Backend"}