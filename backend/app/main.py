from fastapi import FastAPI
from backend.api.vision_api import router as vision_router
from backend.app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
)

app.include_router(vision_router)

@app.get("/")
async def read_root():
    return {"message": "Welcome to VerifDoc Backend"}