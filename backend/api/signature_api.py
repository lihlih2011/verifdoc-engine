from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import io

from backend.engine.signature_engine import SignatureEngine

router = APIRouter(prefix="/signature", tags=["digital_signature"])

signature_engine = SignatureEngine()

@router.post("/analyze")
async def analyze_signature(file: UploadFile = File(...)):
    """
    Analyzes a PDF file for digital signatures and returns detailed information.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for signature analysis.")

    try:
        content = await file.read()
        
        result = signature_engine.analyze_pdf_signature(content)
        
        return JSONResponse(content=result)

    except Exception as e:
        print(f"Error during signature analysis API call: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze signature: {e}")