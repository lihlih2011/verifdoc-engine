from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.models.analysis_record import AnalysisRecord
from backend.utils.hash_utils import compute_sha256
import os

router = APIRouter(prefix="/verify", tags=["integrity_verification"])

@router.get("/{record_id}")
async def verify_report_integrity(record_id: int, db: Session = Depends(get_db)):
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found")

    if not record.report_file_path or not record.integrity_hash:
        raise HTTPException(
            status_code=404,
            detail="Report file path or integrity hash not found for this record. "
                   "Please generate the report first."
        )

    # Construct the absolute path to the report file
    # Assuming report_file_path is relative to the backend root or a known reports directory
    # The report_generator saves reports in backend/reports
    base_report_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "reports")
    full_report_path = os.path.join(base_report_dir, os.path.basename(record.report_file_path))

    if not os.path.exists(full_report_path):
        raise HTTPException(status_code=404, detail="Report file not found on server.")

    try:
        with open(full_report_path, "rb") as f:
            pdf_bytes = f.read()
        
        recomputed_hash = compute_sha256(pdf_bytes)
        
        is_valid = recomputed_hash == record.integrity_hash

        return {
            "valid": is_valid,
            "storedHash": record.integrity_hash,
            "computedHash": recomputed_hash,
            "message": "Report integrity verified successfully." if is_valid else "Report integrity check failed: content mismatch."
        }
    except Exception as e:
        print(f"Error during report integrity verification for record {record_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to verify report integrity: {e}")