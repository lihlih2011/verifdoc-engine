from fastapi import APIRouter, UploadFile, File, Request, HTTPException, Form
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.templating import Jinja2Templates
import shutil
import os
import tempfile
from typing import List
from core.reporting import generate_pdf_report
from core.orchestrator import MainAnalyzer
from core.multi_doc_orchestrator import MultiDocAnalyzer
import uuid # For unique report filenames

router = APIRouter()
templates = Jinja2Templates(directory="templates")

analyzer = MainAnalyzer()
multi_analyzer = MultiDocAnalyzer()

# Store latest report path for demo purposes (simple state)
LATEST_REPORT_PATH = None

@router.get("/", response_class=HTMLResponse)
async def landing_page(request: Request):
    return templates.TemplateResponse("landing.html", {"request": request})

@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@router.get("/pricing", response_class=HTMLResponse)
async def pricing_page(request: Request):
    return templates.TemplateResponse("pricing.html", {"request": request})

@router.get("/upload")
async def upload_page():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/demo")

@router.get("/demo", response_class=HTMLResponse)
async def demo_page(request: Request):
    from core.config import CLIENT_CONFIG
    return templates.TemplateResponse("demo.html", {
        "request": request,
        "client_config": CLIENT_CONFIG
    })

@router.get("/report/latest", response_class=FileResponse)
async def download_latest_report():
    global LATEST_REPORT_PATH
    if LATEST_REPORT_PATH and os.path.exists(LATEST_REPORT_PATH):
        return FileResponse(LATEST_REPORT_PATH, filename="Rapport_VerifDoc.pdf", media_type="application/pdf")
    raise HTTPException(status_code=404, detail="No report available.")

@router.get("/report/example", response_class=HTMLResponse)
async def report_example(request: Request):
    """
    Shows a static, high-value example of what the tool detects.
    """
    return templates.TemplateResponse("report_example.html", {"request": request})

@router.post("/analyze")
async def analyze_file(request: Request, file: UploadFile = File(...)):
    global LATEST_REPORT_PATH
    if not any(file.filename.lower().endswith(ext) for ext in [".pdf", ".jpg", ".jpeg", ".png"]):
        raise HTTPException(status_code=400, detail="Supported formats: PDF, JPG, JPEG, PNG.")
    
    # Save temp file
    ext = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    
    try:
        # Run Analysis
        result = analyzer.analyze_document(tmp_path)
        
        # Generate PDF Report
        report_filename = f"report_{os.path.basename(tmp_path)}.pdf"
        report_path = os.path.join(tempfile.gettempdir(), report_filename)
        
        generate_pdf_report(
            filename=file.filename,
            score=result.get("score", 0),
            evidence=result.get("evidence", []),
            details=result.get("details", {}),
            output_path=report_path
        )
        LATEST_REPORT_PATH = report_path
        
        # Cleanup input file
        try:
             os.remove(tmp_path)
        except: pass
        
        # Add report URL to result
        result["report_url"] = "/report/latest"
        
        return JSONResponse(content=result)
        
    except Exception as e:
        if os.path.exists(tmp_path):
             try: os.remove(tmp_path)
             except: pass
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch-analyze")
async def batch_analyze(
    files: List[UploadFile] = File(...),
    sector: str = Form("GENERIC")
):
    """
    Analyzes one or multiple documents. For multiple docs, runs cross-consistency checks.
    """
    if len(files) == 0:
        raise HTTPException(status_code=400, detail="Please upload at least one document.")
    
    reports = []
    temp_files = []
    
    try:
        for file in files:
            if not any(file.filename.lower().endswith(ext) for ext in [".pdf", ".jpg", ".jpeg", ".png"]):
                continue 
            
            # Save to temp
            ext = os.path.splitext(file.filename)[1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                shutil.copyfileobj(file.file, tmp)
                tmp_path = tmp.name
                temp_files.append(tmp_path)
            
            # Analyze with Sector Context
            result = analyzer.analyze_document(tmp_path, sector_context=sector)
            
            # Generate Sellable Report (Phase 19)
            # PROACTIVE: Better filename branding
            report_filename = f"VerifDoc_Analyse_{uuid.uuid4().hex[:8]}.pdf"
            report_path = os.path.join("static", "reports", report_filename)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(report_path), exist_ok=True)
            
            # Inject verdict into details for correct report generation
            report_details = result.get("details", {}).copy()
            report_details["verdict"] = result.get("verdict", "VALID")
            report_details["triage_category"] = result.get("triage_category", "A") 
            report_details["refusal_reason"] = result.get("refusal_reason", "")

            generate_pdf_report(
                filename=file.filename,
                score=result.get("score", 0),
                evidence=result.get("evidence", []),
                details=report_details,
                output_path=report_path,
                sector_context=sector # Pass sector to report generator
            )
            
            # Update Global State for /report/latest fallback
            global LATEST_REPORT_PATH
            LATEST_REPORT_PATH = report_path
            
            reports.append({
                "filename": file.filename,
                "score": result.get("score", 0),
                "verdict": result.get("verdict", "N/A"),
                "evidence": result.get("evidence", []),
                "details": result.get("details", {}),
                "report_url": f"/static/reports/{report_filename}",
                "triage_category": result.get("triage_category", "A"),
                "refusal_reason": result.get("refusal_reason", "")
            })
        
        # Cross-check logic
        batch_logic = None
        if len(files) >= 2:
            batch_logic = multi_analyzer.analyze_batch(reports)
        
        return JSONResponse(content={
            "individual_reports": reports,
            "batch_logic": batch_logic
        })
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        for tmp_path in temp_files:
            if os.path.exists(tmp_path):
                try: os.remove(tmp_path)
                except: pass
