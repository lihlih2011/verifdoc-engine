from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from PIL import Image
import io

from backend.engine.ocr_engine import OCREngine
from backend.engine.forgery_transformer import ForgeryTransformer
from backend.engine.diffusion_forensics import DiffusionForensics
from backend.engine.gan_fingerprint import GANFingerprintDetector
from backend.engine.ela_engine import ELAEngine
from backend.engine.copymove_engine import CopyMoveEngine # Corrected import
from backend.engine.fusion import FusionEngine

router = APIRouter(prefix="/analyze", tags=["forensic"])

# Initialize engines once globally
ocr_engine = OCREngine(device="cpu")
frdetr_engine = ForgeryTransformer(device="cpu")
diffusion_engine = DiffusionForensics(device="cpu")
noiseprint_engine = GANFingerprintDetector(device="cpu")
ela_engine = ELAEngine()
copymove_engine = CopyMoveEngine() # Corrected class name
fusion_engine = FusionEngine()

@router.post("")
async def analyze_document(file: UploadFile = File(...)):
    try:
        # Read file
        content = await file.read()
        stream = io.BytesIO(content)

        # Convert input to image
        # This assumes the input is an image file (JPEG, PNG, etc.)
        # For PDF handling, a library like PyPDF2 or pdf2image would be needed.
        image = Image.open(stream).convert("RGB")

        # Run modules
        ocr_res        = ocr_engine.analyze_document(image)
        frdetr_res     = frdetr_engine.analyze(image)
        diffusion_res  = diffusion_engine.analyze(image)
        noiseprint_res = noiseprint_engine.analyze(image)
        ela_res        = ela_engine.analyze(image)
        copymove_res   = copymove_engine.detect_copymove(image) # Using detect_copymove as per copymove_engine.py

        # Fusion
        final_result = fusion_engine.fuse({
            "ocr": ocr_res,
            "frdetr": frdetr_res,
            "diffusion": diffusion_res,
            "noiseprint": noiseprint_res,
            "ela": ela_res,
            "copymove": copymove_res
        })

        return JSONResponse(content=final_result)

    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )