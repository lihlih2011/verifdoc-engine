import torch

class Settings:
    PROJECT_NAME: str = "VerifDoc Backend"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Forensic AI Document Analysis Platform"

class AIConfig:
    DEVICE: str = "cuda" if torch.cuda.is_available() else "cpu"
    
    # Model path placeholders
    DONUT_MODEL_PATH: str = "path/to/donut/model"
    FR_DETR_MODEL_PATH: str = "path/to/fr_detr/model"
    NOISEPRINT_MODEL_PATH: str = "path/to/noiseprint/model"
    DIFFUSION_FORENSICS_MODEL_PATH: str = "path/to/diffusion_forensics/model"
    ELA_PREPROCESSOR_MODEL_PATH: str = "path/to/ela_preprocessor/model"
    COPYMOVE_DETECTOR_MODEL_PATH: str = "path/to/copymove_detector/model"

    # OCR Model
    OCR_MODEL: str = "donut-placeholder"
    # FR-DETR Model
    FR_DETR_MODEL: str = "fr-detr-placeholder"
    # Diffusion Forensics Model
    DIFFUSION_MODEL: str = "diffusion-placeholder"
    # NoisePrint++ Model
    NOISEPRINT_MODEL: str = "noiseprint-placeholder"
    # ELA++ Quality Step
    ELA_QUALITY: int = 95

settings = Settings()
ai_config = AIConfig()