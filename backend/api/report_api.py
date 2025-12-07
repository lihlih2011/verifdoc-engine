from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.models.analysis_record import AnalysisRecord
from backend.engine.report_generator import ReportGenerator
from backend.utils.hash_utils import compute_sha256 # Import the hash utility
import os

router = APIRouter(prefix="/report", tags=["report"])

report_generator = ReportGenerator()

@router.get("/analysis/{record_id}")
async def get_analysis_report(record_id: int, db: Session = Depends(get_db)):
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found")
    
    # Ensure heatmaps are available (they are stored as JSON in the DB)
    heatmaps_data = record.heatmaps if record.heatmaps else {}

    # The record object from SQLAlchemy needs to be converted to a dict for ReportGenerator
    # to access properties like 'filename', 'forensic_score', etc.
    record_dict = {
        "id": record.id,
        "filename": record.filename,
        "forensic_score": record.forensic_score,
        "risk_level": record.risk_level,
        "created_at": record.created_at.isoformat(),
        "full_result": record.full_result,
        "heatmaps": record.heatmaps # Pass heatmaps directly from record
    }

    try:
        # Generate the report and get both the file path and the raw PDF bytes
        report_path, pdf_bytes = report_generator.generate_report(record_dict, heatmaps_data)
        
        # Compute the hash of the generated PDF
        integrity_hash = compute_sha256(pdf_bytes)

        # Update the record in the database with the report file path and its hash
        record.report_file_path = report_path
        record.integrity_hash = integrity_hash
        db.add(record)
        db.commit()
        db.refresh(record)

        return FileResponse(
            path=report_path,
            filename=f"rapport_verifdoc_{record_id}.pdf",
            media_type="application/pdf"
        )
    except Exception as e:
        # Log the error for debugging
        print(f"Error generating report for record {record_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {e}")