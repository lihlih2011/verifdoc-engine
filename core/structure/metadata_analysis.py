import pikepdf
from datetime import datetime
import re

class StructureForensicEngine:
    """
    Moteur B : Forensic de Structure (PDF/Container)
    Analyzes PDF structure, metadata, and incremental updates.
    """

    def __init__(self):
        pass

    def analyze_metadata_timeline(self, pdf):
        """
        Extracts dates from PDF Dictionary and XMP Metadata to check for inconsistencies.
        """
        doc_info = pdf.docinfo
        xmp_meta = getattr(pdf, "xmp_metadata", None)
        
        creation_date = str(doc_info.get("/CreationDate", ""))
        mod_date = str(doc_info.get("/ModDate", ""))
        producer = str(doc_info.get("/Producer", ""))
        
        issues = []
        if creation_date and mod_date:
            # Normalize strings roughly (ignore slight timezone diffs if needed, but strict for now)
            # Standard PDF date format: D:YYYYMMDDHHmmSS...
            cd = creation_date[:14] # Up to minutes
            md = mod_date[:14]
            if cd != md:
                issues.append("TIMELINE_MODIFIED")
            
            # Check for "Freshness" (Created < 24h ago)
            # Format D:YYYYMMDDHHmmSS
            try:
                # Remove D: prefix and potential timezone suffix (simplified)
                clean_cd = cd.replace("D:", "").replace("'", "")[:14]
                dt_cd = datetime.strptime(clean_cd, "%Y%m%d%H%M%S")
                if (datetime.now() - dt_cd).total_seconds() < 86400: # 24h
                     issues.append("METADATA_RECENTLY_CREATED")
            except:
                pass
             
        if xmp_meta:
            pass
            
        return {
            "creation_date": creation_date,
            "mod_date": mod_date,
            "producer": producer,
            "xmp_present": bool(xmp_meta),
            "issues": issues
        }

    def detect_incremental_updates(self, file_path):
        """
        Checks if the PDF has been incrementally updated (saved multiple times).
        """
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
                # Count EOF markers, usually one per revision
                eof_count = content.count(b'%%EOF')
            
            return {
                "has_incremental_updates": eof_count > 1,
                "revision_count": eof_count
            }
        except Exception:
            return {"error": "Could not analyze incremental updates"}

    def detect_structural_clones(self, pdf):
        """
        Detects if the same Image object (XObject) is reused multiple times on the same page.
        This is a strong signal for cloned signatures or stamps.
        """
        clones = []
        try:
            for i, page in enumerate(pdf.pages):
                img_usage = {}
                # In pikepdf, page.images is a mapping of local name to object
                # We want to check the underlying object ID (the shared resource)
                for name, img_obj in page.images.items():
                    obj_id = img_obj.objgen
                    if obj_id not in img_usage:
                        img_usage[obj_id] = []
                    img_usage[obj_id].append(name)
                
                for obj_id, names in img_usage.items():
                    if len(names) > 1:
                        clones.append({
                            "page": i + 1,
                            "object_id": str(obj_id),
                            "count": len(names),
                            "usage_names": names
                        })
        except:
             pass
        return clones

    def check_fonts_and_structure(self, file_path, pdf=None):
        """
        In-depth font analysis using pdfminer to detect copy-paste/editing artifacts.
        """
        from pdfminer.high_level import extract_pages
        from pdfminer.layout import LTTextContainer, LTChar, LTTextLineHorizontal
        from collections import Counter

        font_stats = Counter()
        font_map = {} # fontname -> list of text snippets
        
        try:
            for page_layout in extract_pages(file_path):
                for element in page_layout:
                    if isinstance(element, LTTextContainer):
                        for text_line in element:
                            if isinstance(text_line, LTTextLineHorizontal):
                                line_text = text_line.get_text().strip()
                                if not line_text: continue
                                
                                for char in text_line:
                                    if isinstance(char, LTChar):
                                        f = char.fontname
                                        font_stats[f] += 1
                                        if f not in font_map: font_map[f] = []
                                        if len(font_map[f]) < 3: # Keep a few samples
                                            font_map[f].append(line_text[:30])

            total_chars = sum(font_stats.values())
            if total_chars == 0: return {"suspicious_fonts": [], "fonts_found": []}

            suspicious_fonts = []
            font_list = []
            
            # 1. Detect Outliers (< 5% usage)
            for font, count in font_stats.items():
                perc = (count / total_chars) * 100
                font_list.append({"name": font, "usage": f"{perc:.1f}%"})
                
                if perc < 5:
                    # Ignore very short common doc fragments (like single special chars)
                    if count > 3: 
                        # Check if it's a different family than the majority
                        main_font = font_stats.most_common(1)[0][0].lower()
                        if main_font[:4] not in font.lower(): # e.g. 'helv' not in 'courier'
                            suspicious_fonts.append({
                                "type": "FONT_OUTLIER",
                                "font": font,
                                "usage": f"{perc:.1f}%",
                                "sample": font_map.get(font, [""])[0]
                            })
            
            # 2. Detect Anachronisms (Modern fonts in old docs)
            # Placeholder: would check metadata creation year vs. font release
            
            return {
                "suspicious_fonts": suspicious_fonts,
                "fonts_found": font_list,
                "total_analyzed_chars": total_chars
            }

        except Exception as e:
            return {"error": f"Font analysis failed: {str(e)}", "suspicious_fonts": [], "fonts_found": []}

    def analyze(self, file_path: str) -> dict:
        try:
            results = {}
            with pikepdf.open(file_path) as pdf:
                results["metadata"] = self.analyze_metadata_timeline(pdf)
                results["structural_clones"] = self.detect_structural_clones(pdf)
            
            # Deep Scan
            results["structure"] = self.check_fonts_and_structure(file_path)
            results["incremental_updates"] = self.detect_incremental_updates(file_path)
            
            return results
        except Exception as e:
            return {"error": str(e)}
