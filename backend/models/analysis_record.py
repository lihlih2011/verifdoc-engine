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
    created_at = Column(DateTime, default=datetime.utcnow)