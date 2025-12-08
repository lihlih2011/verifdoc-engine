from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.responses import JSONResponse
from PIL import Image
import io
from sqlalchemy.orm import Session
from datetime import datetime # Import datetime

from backend.engine.ocr_engine import OCREngine
from backend.engine.forgery_transformer import ForgeryTransformer
from backend.engine.diffusion_forensics import DiffusionForensics
from backend.engine.gan_fingerprint import GANFingerprintDetector
from backend.engine.ela_engine import ELAEngine
from backend.engine.copymove_engine import CopyMoveEngine
from backend.engine.signature_engine import SignatureEngine
from backend.engine.embedded_object_engine import EmbeddedObjectEngine # NEW IMPORT
from backend.engine.fusion import FusionEngine
from backend.engine.heatmap_generator import HeatmapGenerator # Import HeatmapGenerator
from backend.app.database import get_db # Import get_db
from backend.models.analysis_record import AnalysisRecord # Import AnalysisRecord

router = APIRouter(prefix="/analyze", tags=["forensic"])

# Initialize engines once globally
ocr_engine = OCREngine(device="cpu")
frdetr_engine = ForgeryTransformer(device="cpu")
diffusion_engine = DiffusionForensics(device="cpu")
noiseprint_engine = GANFingerprintDetector(device="cpu")
ela_engine = ELAEngine()
copymove_engine = CopyMoveEngine()
signature_engine = SignatureEngine()
embedded_object_engine = EmbeddedObjectEngine() # NEW INITIALIZATION
fusion_engine = FusionEngine()
heatmap_gen = HeatmapGenerator() # Initialize HeatmapGenerator

@router.post("")
async def analyze_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        # Read file
        content = await file.read()
        stream = io.BytesIO(content)

        # Convert input to image for image-based engines
        # Note: Some engines might need the raw PDF bytes if it's a PDF
        image = Image.open(stream).convert("RGB")

        # Run modules
        ocr_res        = ocr_engine.analyze_document(image)
        frdetr_res     = frdetr_engine.analyze(image)
        diffusion_res  = diffusion_engine.analyze(image)
        noiseprint_res = noiseprint_engine.analyze(image)
        ela_res        = ela_engine.analyze(image)
        copymove_res   = copymove_engine.detect_copymove(image)
        
        # Run signature analysis if it's a PDF
        signature_res = {"hasSignature": False}
        if file.filename.lower().endswith(".pdf"):
            signature_res = signature_engine.analyze_pdf_signature(content)

        # Run embedded object analysis if it's a PDF
        embedded_objects_res = {"embeddedObjects": []}
        if file.filename.lower().endswith(".pdf"):
            embedded_objects_res["embeddedObjects"] = embedded_object_engine.analyze_pdf_objects(content) # NEW ANALYSIS

        # Fusion
        final_result = fusion_engine.fuse({
            "ocr": ocr_res,
            "frdetr": frdetr_res,
            "diffusion": diffusion_res,
            "noiseprint": noiseprint_res,
            "ela": ela_res,
            "copymove": copymove_res,
            "signature": signature_res,
            "embedded_objects": embedded_objects_res # NEW: Include embedded objects results in fusion
        })

        # Generate heatmaps
        heatmaps = {
            "ela": heatmap_gen.generate_ela_heatmap(image),
            "gan": heatmap_gen.generate_gan_heatmap(image),
            "copymove": heatmap_gen.generate_copymove_heatmap(image),
            "diffusion": heatmap_gen.generate_diffusion_heatmap(image)
        }
        final_result["heatmaps"] = heatmaps # Add heatmaps to final_result

        # Save analysis record to database
        record = AnalysisRecord(
            user_id=None, # Placeholder for actual user ID from auth
            filename=file.filename,
            forensic_score=final_result["forgery_score"],
            risk_level=final_result["risk_level"],
            full_result=final_result,
            heatmaps=heatmaps, # Save heatmap paths
            signature_info=signature_res, # Save signature info
            embedded_objects_info=embedded_objects_res, # NEW: Save embedded objects info
            created_at=datetime.utcnow()
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        # Add record ID to the final result before returning
        final_result["record_id"] = record.id

        return JSONResponse(content=final_result)

    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )