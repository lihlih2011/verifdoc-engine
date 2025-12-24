from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="templates")

app = FastAPI(title="VerifDoc SaaS", description="Industrial Grade Forensic Document Analysis", version="2.0.0")

app.mount("/static", StaticFiles(directory="static"), name="static")

from api.v1.router import router as api_router

app.include_router(api_router, prefix="/api/v1")

# --- SAAS ROUTING ---

@app.get("/")
async def root(request: Request):
    """Landing Page (Marketing)"""
    return templates.TemplateResponse("landing.html", {"request": request})

@app.get("/login")
async def login(request: Request):
    """Login Page (Glassmorphism)"""
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/dashboard")
async def dashboard(request: Request):
    """Main App (Upload & Analysis)"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/demo")
async def demo(request: Request):
    """Public Demo (Limited)"""
    from core.config import CLIENT_CONFIG
    return templates.TemplateResponse("demo.html", {
        "request": request,
        "client_config": CLIENT_CONFIG
    })

@app.get("/legal")
async def legal(request: Request):
    """Legal Pages"""
    return templates.TemplateResponse("legal.html", {"request": request})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
