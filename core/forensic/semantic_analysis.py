import re
from typing import Dict, List, Any

class SemanticEngine:
    """
    Engine for Linguistic and Semantic Forensic Analysis.
    Detects suspicious keywords, "sample" artifacts, and linguistic inconsistencies.
    """
    
    def __init__(self):
        # Keywords that indicate the document might be a template or fake
        self.BLACK_LIST = [
            r"\bSPECIMEN\b", 
            r"\bSAMPLE\b", 
            r"\bVOID\b", 
            r"\bDRAFT\b", 
            r"\bBROUILLON\b",
            r"\bFAUX\b",
            r"\bTEST\b",
            r"\bTEMPLATE\b",
            r"\bEXAMPLE\b",
            r"\bEXEMPLE\b",
            r"\bFAKE\b",
            r"INVALID DOCUMENT",
            r"COPY-PASTE",
            r"COLLE-COPIER",
            r"NON VALIDE"
        ]
        
        # Patterns for suspicious strings (e.g., gibberish or template placehodlers)
        self.PLACEHOLDER_PATTERNS = [
            r"\[NOM\]", r"\[PRENOM\]", r"\[ADRESSE\]",
            r"\{\{NAME\}\}", r"\{\{SURNAME\}\}",
            r"__NAME__", r"__SURNAME__",
            r"John Doe", r"Jane Doe"
        ]

    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Runs semantic analysis on extracted text.
        """
        if not text or len(text) < 10:
            return {
                "flagged_keywords": [],
                "quality_score": 0.0,
                "linguistic_anomalies": ["NO_TEXT_TO_ANALYZE"]
            }

        results = {
            "flagged_keywords": [],
            "found_placeholders": [],
            "quality_score": 100.0,
            "linguistic_anomalies": []
        }

        # 1. Keyword Blacklist Check
        for pattern in self.BLACK_LIST:
            if re.search(pattern, text, re.IGNORECASE):
                results["flagged_keywords"].append(pattern.replace(r"\b", ""))
                results["linguistic_anomalies"].append("SUSPICIOUS_KEYWORD_FOUND")

        # 2. Placeholder Check
        for pattern in self.PLACEHOLDER_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                results["found_placeholders"].append(pattern)
                results["linguistic_anomalies"].append("TEMPLATE_PLACEHOLDER_DETECTED")

        # 3. Quality Analysis (Simple)
        # Check for "Garbage" (Excessive symbols)
        symbols = re.findall(r"[^a-zA-Z0-9\s.,€$£\-\/]", text)
        garbage_ratio = len(symbols) / len(text) if len(text) > 0 else 0
        
        if garbage_ratio > 0.15:
            results["linguistic_anomalies"].append("HIGH_GARBAGE_RATIO")
            results["quality_score"] -= (garbage_ratio * 100)

        # 4. Case Consistency
        caps_letters = len(re.findall(r"[A-Z]", text))
        total_letters = len(re.findall(r"[a-zA-Z]", text))
        caps_ratio = caps_letters / total_letters if total_letters > 0 else 0
        
        if caps_ratio > 0.8:
            results["linguistic_anomalies"].append("EXCESSIVE_CAPS")
            results["quality_score"] -= 20

        results["quality_score"] = max(0.0, results["quality_score"])
        
        return results
