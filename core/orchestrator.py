import os
import io
from core.forensic.signal_analysis import SignalForensicEngine
from core.forensic.semantic_analysis import SemanticEngine
from core.structure.metadata_analysis import StructureForensicEngine
from core.logic.business_rules import BusinessLogicEngine
from core.logic.gemini_client import GeminiVerifier
from core.structure.mrz_scanner import MRZScanner
from core.security.data_protection import SecurityEngine
from core.scoring import ScoringEngine
from core.investigation import InvestigationEngine

# For Text Extraction
from pdfminer.high_level import extract_text
import pytesseract

# For Image Extraction (Simplified)
import pikepdf
from PIL import Image

class MainAnalyzer:
    """
    Orchestrator for VerifDoc.
    Coordinators Engines A, B, C, D and returns the final report.
    """

    def __init__(self):
        self.engine_a = SignalForensicEngine()
        self.engine_b = StructureForensicEngine()
        self.engine_c = BusinessLogicEngine()
        self.engine_d = SecurityEngine() # Auto-generated key
        self.engine_f = MRZScanner()    # Identity Reader
        self.engine_g = SemanticEngine() # Linguistic Engine
        self.engine_h = GeminiVerifier() # [NEW] AI Logic
        self.engine_e = InvestigationEngine() # Sherlock Layer
        self.scorer = ScoringEngine()

    def _extract_images_from_pdf(self, file_path):
        """
        Extracts images from PDF for Engine A analysis.
        Returns list of temporary image paths.
        """
        image_paths = []
        try:
            pdf = pikepdf.open(file_path)
            for i, page in enumerate(pdf.pages):
                for name, image_obj in page.images.items():
                    try:
                        # Extract basic images
                        img = pikepdf.PdfImage(image_obj) 
                        pil_img = img.as_pil_image()
                        safe_name = name.replace("/", "").replace("\\", "")
                        temp_path = f"{file_path}_img_{i}_{safe_name}.jpg"
                        # Convert to RGB if needed to avoid saving errors
                        if pil_img.mode in ("P", "RGBA", "LA"):
                            pil_img = pil_img.convert("RGB")
                        pil_img.save(temp_path)
                        image_paths.append(temp_path)
                    except:
                        continue
        except Exception as e:
            print(f"Image extraction warning: {e}")
            
        return image_paths

    def _detect_sector(self, text):
        """
        Heuristic-based document sector detection.
        """
        text = text.upper()
        if any(kw in text for kw in ["FACTURE", "BILL", "ELECTRICITE", "ORANGE", "FREE", "INTERNET", "ECHEANCE"]):
            return "utilities"
        if any(kw in text for kw in ["BULLETIN DE PAIE", "SALAIRE", "FICHE DE PAIE", "EMPLOYEUR", "PAYSLIP"]):
            return "employment"
        if any(kw in text for kw in ["RELEVE D'IDENTITE BANCAIRE", "RIB", "IBAN", "BIC", "COMPTE BANCAIRE"]):
            return "banking"
        if any(kw in text for kw in ["IMPOT", "FISCAL", "REVENU", "DECLARATION", "TAX RETURN"]):
            return "government"
        if any(kw in text for kw in ["PASSEPORT", "CARTE NATIONALE D'IDENTITE", "DRIVING LICENSE", "PERMIS DE CONDUIRE"]):
            return "identity"
        if any(kw in text for kw in ["UNIVERSITE", "UNIVERSITY", "DIPLOME", "DIPLOMA", "CERTIFICAT", "CERTIFICATE", "ADMISSION", "ATTESTATION", "ECOLE", "SCHOOL"]):
            return "education"
        return "generic"

    def analyze_document(self, file_path: str, sector_context: str = "GENERIC"):
        print(f"[*] Starting analysis for {file_path}", flush=True)
        
        is_pdf = file_path.lower().endswith(".pdf")
        
        # 1. Structure Analysis (Engine B)
        structure_results = {}
        if is_pdf:
            print("[*] Running Engine B (Structure)...", flush=True)
            try:
                structure_results = self.engine_b.analyze(file_path)
                print(f"   -> Metadata: {structure_results.get('metadata')}", flush=True)
            except Exception as e:
                print(f"   -> Engine B (Structure) Failed: {e}", flush=True)
                structure_results = {"metadata": {"producer": "ERROR", "creation_date": None}}
        else:
            print("[*] Image Input: Skipping Engine B (Structure)...", flush=True)
            structure_results = {"metadata": {"producer": "IMAGE_INPUT", "creation_date": None}}

        
        # 2. Signal Analysis (Engine A)
        # 2. Extract Assets (Images & Text)
        extracted_images = []
        raw_text = ""
        
        if is_pdf:
            print("[*] Running Engine A (Signal) on PDF Images...", flush=True)
            extracted_images = self._extract_images_from_pdf(file_path)
            
            print("[*] Extracting Text from PDF...", flush=True)
            try:
                raw_text = extract_text(file_path)
            except Exception as e:
                print(f"   -> PDFMiner failed: {e}", flush=True)
                
            # OCR Fallback for Scanned PDF
            if not raw_text.strip() and extracted_images:
                print("   -> No text found naturally. Attempting OCR on extracted images...", flush=True)
                tess_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
                if os.path.exists(tess_path):
                    pytesseract.pytesseract.tesseract_cmd = tess_path
                
                for img_path in extracted_images:
                    try:
                        text_chunk = pytesseract.image_to_string(Image.open(img_path))
                        raw_text += text_chunk + "\n"
                    except: pass
        else:
             # Image Input (JPG/PNG)
             print("[*] Processing Image Input...", flush=True)
             # The input is the image for Engine A
             extracted_images = [file_path] 
             
             # OCR Fallback
             import shutil
             # Auto-detect Tesseract Path for Windows
             tess_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
             if os.path.exists(tess_path):
                 pytesseract.pytesseract.tesseract_cmd = tess_path
             
             print("   -> Running OCR on Image Input...", flush=True)
             try:
                raw_text = pytesseract.image_to_string(Image.open(file_path))
             except Exception as e:
                print(f"   -> OCR failed: {e}", flush=True)

        
        # 3. Running Engine A (Signal)
        print(f"   -> Analyzing {len(extracted_images)} images/assets.", flush=True)
        engine_a_results = {}
        if extracted_images:
            max_ela = 0
            has_lum_anomaly = False
            max_clones = 0
            max_noise_score = 0
            small_images_count = 0
            heatmap_paths = []

            for img_path in extracted_images:
                # Prepare context for Engine A (Funnel Logic)
                producer_info = structure_results.get('metadata', {}).get('producer', '').lower()
                is_compressed = any(c in producer_info for c in ["ilovepdf", "smallpdf", "compress", "optimize", "skia", "google"])
                context = {"is_compressed_producer": is_compressed}

                try:
                    # Run Analysis
                    res = self.engine_a.analyze(img_path, context=context)
                    if res["ela_score"] > max_ela:
                        max_ela = res["ela_score"]
                    if res["luminance_anomaly"]:
                        has_lum_anomaly = True
                    if res.get("clones_detected", 0) > max_clones:
                        max_clones = res["clones_detected"]
                    if res.get("noise_score", 0) > max_noise_score:
                        max_noise_score = res["noise_score"]
                    
                    if res.get("heatmap_path"):
                        heatmap_paths.append(res["heatmap_path"])

                    # Check for "Patch" Logic
                    if is_pdf:
                         try:
                            with Image.open(img_path) as im:
                                w, h = im.size
                                if 20 < w < 400 and 10 < h < 200: small_images_count += 1
                         except: pass

                except Exception as e:
                    print(f"   -> Engine A Error on {img_path}: {e}", flush=True)
            
            engine_a_results = {
                "ela_score": max_ela,
                "luminance_anomaly": has_lum_anomaly,
                "clones_detected": max_clones,
                "noise_score": max_noise_score,
                "patch_count": small_images_count,
                "heatmaps": heatmap_paths
            }
        
        print(f"   -> Text Length: {len(raw_text)} chars", flush=True)
        if len(raw_text) < 100:
            print(f"   -> Text Preview: {raw_text}", flush=True)

        # Prepare Logic Context (Layer 4: Temporal Forensics)
        c_date = structure_results.get('metadata', {}).get('creation_date')
        logic_context = {"creation_date": c_date}

        try:
            logic_results = self.engine_c.analyze(raw_text, context=logic_context)
        except Exception as e:
             print(f"   -> Engine C (Business Logic) Failed: {e}", flush=True)
             logic_results = {"error": str(e)}

        # 3.5 ID Scanning (Engine B Upgrade)
        print("[*] Running ID Scanner (MRZ)...", flush=True)
        try:
            mrz_results = self.engine_f.scan(raw_text)
            structure_results["mrz"] = mrz_results
        except Exception as e:
            print(f"   -> MRZ Scanner Failed (Safe Fail): {e}", flush=True)
            structure_results["mrz"] = {"found": False, "error": str(e)}

        # 3.7 Sector Detection
        print("[*] Running Semantic Engine...", flush=True)
        try:
             semantic_results = self.engine_g.analyze(raw_text)
        except Exception as e:
             print(f"   -> Engine G (Semantic) Failed: {e}")
             semantic_results = {"flagged_keywords": []}
         
        # Priority: Explicit Context > Auto-Detection
        # We keep the raw context (e.g. 'RH', 'IMMOBILIER') because ScoringEngine expects these keys.
        auto_detected_sector = self._detect_sector(raw_text)
        
        if sector_context and sector_context != "GENERIC":
             sector = sector_context
        else:
             sector = auto_detected_sector # Returns english keys, might need mapping if auto-detect is used
             # Map auto-detect english keys back to french keys for Scorer?
             # For now, let's keep it simple. If auto-detect says "employment", Scorer will use GENERIC fallback.
             # This encourages using the Admin Context.
             
        print(f"   -> Final Sector Context: {sector} (Auto-Detected: {auto_detected_sector})", flush=True)
        
        # 4. Scoring
        print("[*] Computing Score...", flush=True)
        
        # --- ENGINE H: TEXT COHERENCE (NEW) ---
        print(f"   -> [Engine H] Analyzing text coherence...")
        try:
            coherence_results = self.engine_h.analyze_text_coherence(raw_text, document_type=sector)
        except Exception as e:
            print(f"   -> Engine H (Text Coherence) Failed: {e}", flush=True)
            coherence_results = {"risk_score": 0, "anomalies": [], "summary": "Coherence analysis failed."}

        try:
            full_results = {
                "sector": sector,
                "forensic": engine_a_results, 
                "structure": structure_results,
                "logic": {
                    "business": logic_results,
                    "semantic": semantic_results,
                    "coherence": coherence_results # Merged coherence results
                },
                "stats": {
                    "text_length": len(raw_text),
                    "image_count": len(extracted_images),
                    "text_content": raw_text
                }
            }
            
            score_report = self.scorer.compute_score(full_results)
            print(f"   -> Final Score: {score_report['risk_score']}", flush=True)
            
            # Enrich details with Scoring Outputs for Reporting
            full_results["disclaimer_text"] = score_report.get("disclaimer_text", "")
            full_results["axis_scores"] = score_report.get("axis_scores", {})
            full_results["triage_category"] = score_report.get("triage_category", "C")
            
        except Exception as e:
            print(f"   -> Scoring Failed: {e}", flush=True)
            score_report = {"risk_score": 0, "verdict": "ERROR", "indicators": ["SCORING_FAILED"]}

        
        # 6. Investigation (Engine E - Sherlock)
        print("[*] Generating Hypotheses...", flush=True)
        try:
            hypotheses = self.engine_e.generate_hypothesis(
                evidence=score_report.get('indicators', []),
                metadata=structure_results.get('metadata', {}),
                forensic_data=full_results.get('forensic', {}),
                logic_data=logic_results
            )
        except Exception as e:
            print(f"Investigation error: {e}", flush=True)
            hypotheses = ["Investigation Module Failed"]
        
        # Cleanup Images (Only if extracted from PDF)
        if is_pdf:
            for img_path in extracted_images:
                try:
                    os.remove(img_path)
                except:
                    pass
        
        # 5. Security & Final Package (Engine D)
        print("[*] Securing Proof...", flush=True)
        # Anonymize text for the public report (not full logical processing, just display)
        safe_text_snippet = self.engine_d.anonymize_text(raw_text[:500]) + "..."
        
        # Generate Certificate
        try:
            with open(file_path, "rb") as f:
                content = f.read()
                cert = self.engine_d.generate_proof_certificate(content, score_report)
        except:
            cert = "CERT_GEN_FAILED"

        final_report = {
            "version": "VerifDoc_1.0",
            "filename": os.path.basename(file_path),
            "score": score_report["risk_score"],
            "verdict": score_report["verdict"],
            "evidence": score_report["indicators"],
            "hypotheses": hypotheses,
            "heatmap_url": engine_a_results.get('heatmaps', [''])[0] if engine_a_results.get('heatmaps') else '',
            "details": full_results,
            "proof_certificate": cert,
            "safe_snippet": safe_text_snippet
        }
        
        return final_report
