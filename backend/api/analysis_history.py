from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.database import get_db
from backend.models.analysis_record import AnalysisRecord
from sqlalchemy import desc

router = APIRouter(prefix="/analysis", tags=["analysis_history"])

@router.on_after_startup
async def create_db_tables():
    from backend.app.database import Base, engine
    Base.metadata.create_all(bind=engine)

@router.get("/list", response_model=List[Dict[str, Any]])
async def list_analysis_records(db: Session = Depends(get_db)):
    records = db.query(AnalysisRecord).order_by(desc(AnalysisRecord.created_at)).limit(50).all()
    
    # Format records for the list view
    formatted_records = [
        {
            "id": record.id,
            "filename": record.filename,
            "forensic_score": record.forensic_score,
            "risk_level": record.risk_level,
            "created_at": record.created_at.isoformat() # Convert datetime to ISO format string
        }
        for record in records
    ]
    return formatted_records

@router.get("/{record_id}", response_model=Dict[str, Any])
async def get_analysis_detail(record_id: int, db: Session = Depends(get_db)):
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found")
    
    # Return the full result, ensuring datetime is serialized
    return {
        "id": record.id,
        "filename": record.filename,
        "forensic_score": record.forensic_score,
        "risk_level": record.risk_level,
        "created_at": record.created_at.isoformat(),
        "full_result": record.full_result,
        "heatmaps": record.heatmaps # Include heatmap paths
    }