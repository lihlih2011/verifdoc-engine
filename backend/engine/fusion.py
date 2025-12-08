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
        self.signature_weight = ai_config.FUSION_SIGNATURE_WEIGHT # New weight

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

    def _get_risk_level_text(self, score: int) -> str:
        """
        Determines the risk level text based on the forensic score.
        """
        if score < 40:
            return "Faible"
        if score >= 40 and score <= 70:
            return "Modéré"
        return "Élevé"

    def fuse(self, results: dict):
        # 1. Extract module scores using _safe_extract()
        ocr_s        = self._safe_extract(results, "ocr", "score", 0.0)
        frdetr_s     = self._safe_extract(results, "frdetr", "score", 0.0)
        diffusion_s  = self._safe_extract(results, "diffusion", "score", 0.0)
        noiseprint_s = self._safe_extract(results, "noiseprint", "ai_score", 0.0)
        ela_s        = self._safe_extract(results, "ela", "ela_score", 0.0)
        copymove_s   = self._safe_extract(results, "copymove", "copy_move_score", 0.0)
        
        # New: Signature score
        signature_info = results.get("signature", {})
        signature_s = 0.0
        if signature_info.get("hasSignature"):
            # If signature is present and valid, it reduces forgery risk.
            # If invalid, it increases forgery risk.
            is_valid = signature_info.get("signatureInfo", {}).get("isValid", False)
            if is_valid:
                signature_s = 0.1 # Small positive score for valid signature
            else:
                signature_s = 0.9 # High score for invalid signature
        # If no signature, it doesn't contribute to forgery score directly, or can be neutral.
        # For now, if no signature, it's 0.0 contribution.

        # 2. Normalize all values
        ocr_n        = self._normalize(ocr_s)
        frdetr_n     = self._normalize(frdetr_s)
        diffusion_n  = self._normalize(diffusion_s)
        noiseprint_n = self._normalize(noiseprint_s)
        ela_n        = self._normalize(ela_s)
        copymove_n   = self._normalize(copymove_s)
        signature_n  = self._normalize(signature_s) # Normalize signature score

        # 3. Compute weighted score
        # Adjust weights to sum to 1 if a new module is added
        total_weight = (
            self.ocr_weight + self.frdetr_weight + self.diffusion_weight +
            self.noiseprint_weight + self.ela_weight + self.copymove_weight +
            self.signature_weight
        )
        
        # If total_weight is 0, avoid division by zero.
        # If total_weight is not 1, normalize individual weights.
        if total_weight == 0:
            # Handle case where all weights are zero, perhaps return a default score
            final_score = 0.5 # Neutral score
        else:
            final_score = (
                ocr_n        * self.ocr_weight +
                frdetr_n     * self.frdetr_weight +
                diffusion_n  * self.diffusion_weight +
                noiseprint_n * self.noiseprint_weight +
                ela_n        * self.ela_weight +
                copymove_n   * self.copymove_weight +
                signature_n  * self.signature_weight # Include signature in fusion
            ) / total_weight # Normalize by total weight

        # 4. Convert final_score → 0–100
        final_score_percent = int(final_score * 100)
        risk_level_text = self._get_risk_level_text(final_score_percent)

        # 5. Build explanation
        explanation = {
            "ocr":          "Suspicious text or layout" if ocr_n > 0.5 else "No textual anomalies",
            "visual":       "Altered regions detected" if frdetr_n > 0.5 else "No visual tampering detected",
            "inpainting":   "Possible AI reconstruction" if diffusion_n > 0.5 else "No inpainting traces",
            "ai_noise":     "AI-generated texture inconsistencies" if noiseprint_n > 0.5 else "No AI noise signature",
            "compression":  "Compression anomalies detected" if ela_n > 0.5 else "Normal compression",
            "duplication":  "Copy-move duplication detected" if copymove_n > 0.5 else "No duplication traces",
            "signature":    "Invalid or tampered digital signature" if signature_n > 0.5 else "Valid digital signature detected" if signature_info.get("hasSignature") else "No digital signature detected", # New explanation
            "summary":      "Document likely altered" if final_score_percent > 60 else "Document likely authentic"
        }

        # 6. Prepare clean output JSON
        return {
            "forgery_score": final_score_percent,
            "risk_level": risk_level_text, # Added risk_level here
            "module_scores": {
                "ocr": ocr_n,
                "frdetr": frdetr_n,
                "diffusion": diffusion_n,
                "noiseprint": noiseprint_n,
                "ela": ela_n,
                "copymove": copymove_n,
                "signature": signature_n # Include signature score
            },
            "explanation": explanation,
            "raw_output": "fusion-v1"
        }