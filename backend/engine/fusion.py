from backend.app.config import ai_config

class FusionEngine:
    def __init__(self):
        # Load weights from config
        self.ocr_weight = ai_config.FUSION_OCR_WEIGHT
        self.frdetr_weight = ai_config.FUSION_FRDETR_WEIGHT
        self.diffusion_weight = ai_config.FUSION_DIFFUSION_WEIGHT
        self.noiseprint_weight = ai_config.FUSION_NOISEPRINT_WEIGHT
        self.ela_weight = ai_config.FUSION_ELA_WEIGHT
        self.copymove_weight = ai_config.FUSION_COPYMOVE_WEIGHT

    def _normalize(self, x):
        """
        Normalizes a score to be within the [0, 1] range.
        """
        if x is None:
            return 0.0
        x = float(x)
        if x < 0:
            return 0.0
        if x > 1:
            return 1.0
        return x

    def _safe_extract(self, results: dict, module_name: str, field: str, default):
        """
        Safely extracts a field from nested results, returning a default if not found.
        """
        try:
            return results.get(module_name, {}).get(field, default)
        except Exception:
            # Catch any potential errors during access, though .get() should handle most
            return default

    def fuse_results(self, analysis_results: dict):
        # Placeholder for fusion logic
        return {"overall_verdict": "Fusion result placeholder"}