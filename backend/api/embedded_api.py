from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import io

from backend.engine.embedded_object_engine import EmbeddedObjectEngine

router = APIRouter(prefix="/embedded", tags=["embedded_objects"])

embedded_object_engine = EmbeddedObjectEngine()

@router.post("/scan")
async def scan_embedded_objects(file: UploadFile = File(...)):
    """
    Analyzes a PDF file for embedded objects and detects suspicious ones.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for embedded object analysis.")

    try:
        content = await file.read()
        
        results = embedded_object_engine.analyze_pdf_objects(content)
        
        return JSONResponse(content={"embeddedObjects": results})

    except Exception as e:
        print(f"Error during embedded object analysis API call: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze embedded objects: {e}")