from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from datetime import datetime
from backend.app.database import Base

class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)   # for future auth
    filename = Column(String, nullable=False)
    forensic_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    full_result = Column(JSON, nullable=False)
    heatmaps = Column(JSON, nullable=True) # New column for heatmap file paths
    report_file_path = Column(String, nullable=True) # New column for the path to the generated PDF report
    integrity_hash = Column(String, nullable=True) # New column for the SHA-256 hash of the report
    signature_info = Column(JSON, nullable=True) # New column for digital signature analysis results
    created_at = Column(DateTime, default=datetime.utcnow)