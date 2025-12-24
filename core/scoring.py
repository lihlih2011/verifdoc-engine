class ScoringEngine:
    """
    VerifDoc Scoring Engine - Production Matrix (v2.0).
    Philosophy: Zero Magic, Explainable, Juridically Defensible.
    """
    
    # --- 1. BASE CONSTANTS ---
    MAX_SCORE = 100
    
    # Thresholds (Official Scale)
    THRESHOLD_GREEN = 29   # 0-29: Clean
    THRESHOLD_YELLOW = 59  # 30-59: Warning
    # 60+: Critical (Red)
    
    # Base Weights (Common Ground)
    W_FORENSIC = 0.40  # Visual anomalies, modifications
    W_STRUCTURE = 0.35 # Metadata, format, consistency
    W_LOGIC = 0.25     # Business logic, dates, amounts
    
    # --- 2. SECTOR MODIFIERS (Anti-False Positive Keys) ---
    SECTOR_MODIFIERS = {
        "RH":         {"forensic": 0.85, "structure": 1.00, "logic": 1.10}, # Tolerance for scans/photos
        "IMMOBILIER": {"forensic": 1.00, "structure": 1.10, "logic": 1.20}, # Criticality of dates/amounts
        "ASSURANCE":  {"forensic": 1.20, "structure": 1.00, "logic": 1.00}, # High fraud risk on visual
        "JURIDIQUE":  {"forensic": 1.10, "structure": 1.20, "logic": 1.20}, # Zero tolerance
        "BANQUE":     {"forensic": 1.10, "structure": 1.10, "logic": 1.10}, # High standard
        "GENERIC":    {"forensic": 1.00, "structure": 1.00, "logic": 1.00}
    }

    def __init__(self):
        pass

    def compute_score(self, analysis_results: dict) -> dict:
        """
        Calculates final risk score using the Production Matrix.
        """
        sector = analysis_results.get("sector", "GENERIC").upper()
        # Fallback for unknown sectors
        modifiers = self.SECTOR_MODIFIERS.get(sector, self.SECTOR_MODIFIERS["GENERIC"])
        
        # --- PHASE 1: AXIS SCORING (0-100) ---
        
        # A. FORENSIC AXIS (Visuals)
        s_forensic = 0
        forensic_data = analysis_results.get("forensic", {})
        
        # ELA (Digital Tampering) -> Strong Signal
        ela = forensic_data.get("ela_score", 0)
        if ela > 5.0: s_forensic += 60
        elif ela > 4.0: s_forensic += 30
        
        # Clones (Copy-Move) -> Critical Signal
        if forensic_data.get("clones_detected", 0) > 0:
            s_forensic += 100 # Direct kill on this axis
            
        # Luminance/Noise -> Weak Signals
        if forensic_data.get("luminance_anomaly"): s_forensic += 20
        s_forensic += forensic_data.get("noise_score", 0)
        
        s_forensic = min(s_forensic, 100)


        # B. STRUCTURE AXIS (Metadata/File)
        s_structure = 0
        struct_data = analysis_results.get("structure", {})
        meta = struct_data.get("metadata", {})
        
        # Producer Blacklist
        producer = meta.get("producer", "").lower()
        if not producer: s_structure += 40 # Suspicious
        elif any(x in producer for x in ["ilovepdf", "photoshop", "gimp", "phantompdf", "editor"]):
             s_structure += 60
             
        # Incremental Updates -> Editing traces
        if struct_data.get("incremental_updates", {}).get("has_incremental_updates"):
             s_structure += 30
             
        # Font Anomalies
        if struct_data.get("suspicious_fonts"):
             s_structure += 40
             
        s_structure = min(s_structure, 100)


        # C. LOGIC AXIS (Content/Business + Gemini AI)
        s_logic = 0
        logic_dict = analysis_results.get("logic", {})
        business_data = logic_dict.get("business", {})
        gemini_data = logic_dict.get("coherence", {}) # [NEW] Gemini Input
        
        # 1. Classical Business Rules
        if business_data.get("date_inconsistency"):
             s_logic += 80 # High impact
        if business_data.get("amount_inconsistency"):
             s_logic += 80
             
        # 2. Gemini Semantic Analysis (AI)
        # We take the Maximum of Rules or AI to avoid missing a signal
        gemini_score = gemini_data.get("risk_score", 0)
        s_logic = max(s_logic, gemini_score)
        
        s_logic = min(s_logic, 100)


        # --- PHASE 2: WEIGHTING & MODIFIERS ---
        
        # Apply Sector Modifiers first (Adjusting sensitivity)
        adj_forensic = s_forensic * modifiers["forensic"]
        adj_structure = s_structure * modifiers["structure"]
        adj_logic = s_logic * modifiers["logic"]
        
        # Weighted Sum (Base Model)
        global_score = (
            (adj_forensic * self.W_FORENSIC) +
            (adj_structure * self.W_STRUCTURE) +
            (adj_logic * self.W_LOGIC)
        )
        
        # --- PHASE 3: BLOCKING RULES (The Legal Shield) ---
        # "Règles bloquantes (non compensables)"
        
        blocking_triggered = []
        is_blocked = False
        
        # Rule 1: Legal Date Modified
        if sector == "JURIDIQUE" and logic_data.get("date_inconsistency"):
            is_blocked = True
            blocking_triggered.append("JURIDIQUE_DATE_MODIFIEE")
            
        # Rule 2: Insurance Amount Modified
        if sector == "ASSURANCE" and logic_data.get("amount_inconsistency"):
            is_blocked = True
            blocking_triggered.append("ASSURANCE_MONTANT_ALTERE")
            
        # Rule 3: Visual & Structural Convergence (Generic)
        if s_forensic > 50 and s_structure > 50:
            is_blocked = True
            blocking_triggered.append("CONVERGENCE_VISUEL_STRUCTURE")
            
            
        # Apply Block
        if is_blocked:
            global_score = 100 # Force Critical
            
        # Final Cap
        final_score = min(max(global_score, 0), 100)
        
        
        # --- PHASE 4: VERDICT & INTERPRETATION ---
        
        # Dynamic Thresholds based on "Secteurs de Rigueur"
        # Default (Generic): Green < 30, Yellow < 60
        t_green = self.THRESHOLD_GREEN
        
        if sector == "BANQUE":
            t_green = 10 # Ultra-strict (User Rule)
        elif sector == "IMMOBILIER":
            t_green = 25 # Strict (User Rule)
        elif sector == "RH":
            t_green = 40 # Tolerant (User Rule)
            
        t_yellow = t_green + 30 # Sliding window for suspicious
            
        verdict = "VALID"
        triage_cat = "C"
        
        if final_score >= t_yellow:
            verdict = "FRAUDULENT" # RED
            triage_cat = "A"
        elif final_score > t_green:
            verdict = "SUSPICIOUS" # YELLOW
            triage_cat = "B"
        else:
            verdict = "VALID" # GREEN
            triage_cat = "C"
            
        # Normalize Indicators for Report
        report_indicators = []
        if s_forensic > 10: report_indicators.append("FORENSIC_SIGNAL")
        if s_structure > 10: report_indicators.append("STRUCTURE_SIGNAL")
        if s_logic > 10: report_indicators.append("LOGIC_SIGNAL")
        if is_blocked: report_indicators.extend(blocking_triggered)

        # Debug Print
        print(f"\n[MATRIX v2] Sector: {sector} | Scores(F/S/L): {s_forensic}/{s_structure}/{s_logic} | Final: {final_score:.1f} ({verdict})")

        return {
            "risk_score": int(final_score),
            "verdict": verdict,
            "triage_category": triage_cat,
            "indicators": report_indicators,
            "axis_scores": {
                "forensic": int(s_forensic),
                "structure": int(s_structure),
                "logic": int(s_logic)
            },
            "disclaimer_text": self._get_disclaimer(verdict)
        }

    def _get_disclaimer(self, verdict):
        if verdict == "FRAUDULENT":
            return "Anomalies critiques incompatibles avec une validation."
        if verdict == "SUSPICIOUS":
            return "Éléments nécessitant une vigilance particulière."
        return "Aucun signal significatif détecté."
