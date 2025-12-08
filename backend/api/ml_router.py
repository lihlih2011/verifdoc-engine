from fastapi import APIRouter, UploadFile, File, HTTPException, status
from PIL import Image
import io
from backend.ml.ml_engine import MLEngine

router = APIRouter(prefix="/ml", tags=["machine_learning"])

# Initialize MLEngine globally to load models once
ml_engine = MLEngine()

@router.post("/efficientnet")
async def analyze_efficientnet(file: UploadFile = File(...)):
    """
    Analyzes an uploaded image using the EfficientNet forensic model.
    Returns a score and an interpretation of potential falsification.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are supported."
        )

    try:
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert("RGB")

        # Run inference using the EfficientNet forensic model
        # Assuming the model returns a single score (probability of forgery)
        model_output = ml_engine.run_inference("efficientnet_forensic", image)
        
        # The model_output is expected to be a NumPy array from postprocess_output
        # For classification, it's typically probabilities, e.g., [prob_authentic, prob_forgery]
        # Or a single value if the model is configured for binary output directly.
        # Let's assume it's a probability array where the second element is forgery probability.
        score = float(model_output[0][1]) if model_output.ndim > 1 and model_output.shape[1] > 1 else float(model_output[0])
        
        interpretation = "falsification probable" if score > 0.5 else "document authentique"

        return {
            "model": "efficientnet_forensic",
            "score": score,
            "interpretation": interpretation
        }

    except HTTPException as e:
        raise e # Re-raise HTTPExceptions from MLEngine
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process image with EfficientNet: {e}"
        )

@router.post("/vit")
async def analyze_vit(file: UploadFile = File(...)):
    """
    Analyzes an uploaded image using the Vision Transformer (ViT) forensic model.
    Returns an anomaly score and an interpretation of structural coherence.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are supported."
        )

    try:
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert("RGB")

        # Run inference using the ViT forensic model
        # The run_inference for "vit_forensic" directly returns {"score": normalized_score}
        result = ml_engine.run_inference("vit_forensic", image)
        anomaly_score = result["score"]
        
        interpretation = "Anomalies détectées" if anomaly_score > 0.6 else "Document structurellement cohérent"

        return {
            "model": "vit_forensic",
            "anomaly_score": anomaly_score,
            "interpretation": interpretation
        }

    except HTTPException as e:
        raise e # Re-raise HTTPExceptions from MLEngine
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process image with ViT: {e}"
        )