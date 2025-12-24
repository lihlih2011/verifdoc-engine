import re
from datetime import datetime

class BusinessLogicEngine:
    """
    Moteur C : Cohérence Métier (Logic & Cross-Check)
    Validates arithmetic, IBANs, and business logic.
    """

    def __init__(self):
        # Regex basics
        self.iban_regex = re.compile(r"[A-Z]{2}[0-9]{2}(?:[ ]?[0-9]{4}){4}(?:[ ]?[0-9]{1,2})?")
        self.number_regex = re.compile(r"[\d]+[.,][\d]{2}")

    def check_arithmetic(self, text_content: str) -> list:
        """
        Attempts to find pattern like HT + TVA = TTC in the text.
        This is a probabilistic check for MVP.
        """
        # Simplistic extraction of all currency-like numbers
        import re
        nums = re.findall(r"\b\d{1,3}(?:[ \.,]\d{3})*(?:[\.,]\d{2})?\b", text_content)
        # Normalize to float
        clean_nums = []
        for n in nums:
            try:
                # Remove spaces, replace comma with dot
                val = float(n.replace(' ', '').replace(',', '.'))
                clean_nums.append(val)
            except:
                continue
        
        warnings = []
        # sort desc to find largest (potential TTC)
        clean_nums.sort(reverse=True)
        
        # very basic check: if we find A + B = C roughly
        # This is O(N^3) but N is small
        if len(clean_nums) >= 3:
            found_logic = False
            for i in range(len(clean_nums)):
                for j in range(i + 1, len(clean_nums)):
                    for k in range(j + 1, len(clean_nums)):
                        a, b, c = clean_nums[i], clean_nums[j], clean_nums[k]
                        # check if b + c = a (approx)
                        if abs(a - (b + c)) < 0.05:
                            found_logic = True
                            # Could interpret as valid math
            
            if not found_logic and len(clean_nums) > 5:
                 # If many numbers but no sum matches, might be suspicious or just complex
                 pass

        return warnings

    def validate_iban(self, iban_str: str) -> bool:
        """
        Validates IBAN using Modulo 97 check.
        """
        iban = iban_str.replace(" ", "").upper()
        if not re.match(r"^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$", iban):
            return False
            
        # Move first 4 chars to end
        rearranged = iban[4:] + iban[:4]
        
        # Replace letters with numbers (A=10, B=11, ...)
        numeric_iban = ""
        for char in rearranged:
            if char.isdigit():
                numeric_iban += char
            else:
                numeric_iban += str(ord(char) - 55)
                
        try:
            return int(numeric_iban) % 97 == 1
        except:
            return False

    def check_dates(self, creation_date: datetime, text_content: str) -> bool:
        """
        Checks if document date is after file creation (Time Paradox).
        Returns True if inconsistent (Paradox Detected).
        """
        # Finds dates like DD/MM/YYYY or YYYY-MM-DD
        import re
        date_patterns = [
            r"\b(\d{2})/(\d{2})/(\d{4})\b", # 25/12/2023
            r"\b(\d{4})-(\d{2})-(\d{2})\b"  # 2023-12-25
        ]
        
        found_inconsistency = False
        
        for pat in date_patterns:
            matches = re.findall(pat, text_content)
            for m in matches:
                try:
                    if len(m[0]) == 4: # YYYY-MM-DD
                         d = datetime(int(m[0]), int(m[1]), int(m[2]))
                    else: # DD/MM/YYYY
                         d = datetime(int(m[2]), int(m[1]), int(m[0]))
                    
                    # Check: If Document Date > Creation Date + buffer (e.g. 1 day), it's a paradox.
                    # A file created on Jan 1st cannot validly contain "Date: Feb 1st" unless it's a future prediction.
                    if creation_date and d > creation_date and (d - creation_date).days > 1:
                        found_inconsistency = True
                except:
                    continue
                    
        return found_inconsistency

    def scan_for_ibans(self, text: str) -> list:
        found_ibans = self.iban_regex.findall(text)
        results = []
        for ib in found_ibans:
            valid = self.validate_iban(ib)
            results.append({"iban": ib, "valid": valid})
        return results

    def _detect_document_type(self, text: str) -> str:
        """
        Heuristic detection of document type based on keywords.
        """
        text_upper = text.upper()
        if "BULLETIN DE PAIE" in text_upper or "SALAIRE" in text_upper:
            return "PAYSLIP"
        if "AVIS D'IMPOT" in text_upper or "REVENUS" in text_upper:
            return "TAX_RETURN"
        if "FACTURE" in text_upper or "INVOICE" in text_upper:
            return "INVOICE"
        if "CARTE NATIONALE D'IDENTITE" in text_upper or "PASSEPORT" in text_upper:
            return "ID_CARD"
        return "UNKNOWN"

    def _validate_nir(self, nir_str: str) -> bool:
        """
        Validates French Social Security Number (NIR) using Modulo 97.
        Format: 1 80 05 92 ... (13 digits + 2 key)
        """
        # Clean string (keep only digits)
        digits = "".join(filter(str.isdigit, nir_str))
        
        # NIR is 13 digits + 2 key digits = 15 digits
        if len(digits) != 15:
            return False
            
        try:
            nir = int(digits[:13])
            key = int(digits[13:])
            
            # Corsica Check (2A/2B handling) - Skipped for MVP (assumes standard digits)
            
            # Algo: Key = 97 - (NIR % 97)
            # Exception : if calculated key is 0, it means 97. No, key is always 01-97. 
            # Wait, formula is Key = 97 - (Number % 97).
            
            calculated_key = 97 - (nir % 97)
            return calculated_key == key
        except:
            return False

    def check_salary_coherence(self, text_content: str) -> list:
        """
        Layer 5: Financial Coherence
        Checks if 'Net to Pay' seems consistent with 'Gross Salary'.
        """
        warnings = []
        import re
        
        # Heuristic extraction (very simplified for MVP)
        # Look for "Net à payer" followed by a number (handles "NET A PAYER AVANT IMPOT ...." etc)
        net_pattern = re.search(r"(?:NET A PAYER|NET PAYÉ|NET À PAYER)[^0-9]*?(\d[\d\s]{0,15}(?:[.,]\d{2})?)", text_content, re.IGNORECASE)
        # Look for "Total Brut"
        brut_pattern = re.search(r"(?:TOTAL BRUT|SALAIRE BRUT)[^0-9]*?(\d[\d\s]{0,15}(?:[.,]\d{2})?)", text_content, re.IGNORECASE)
        
        if net_pattern and brut_pattern:
            try:
                # Clean number: remove spaces, convert comma to dot
                net_raw = net_pattern.group(1).replace(' ', '').replace(',', '.')
                brut_raw = brut_pattern.group(1).replace(' ', '').replace(',', '.')
                
                net_val = float(net_raw)
                brut_val = float(brut_raw)
                
                # Rule 1: Net > Brut is impossible
                if net_val > brut_val:
                    warnings.append(f"IMPOSSIBLE_NET_SALARY_HIGHER_THAN_GROSS (Net: {net_val}, Brut: {brut_val})")
                
                # Rule 2: Net > 95% of Brut is very suspicious in France
                elif net_val > (brut_val * 0.95):
                     warnings.append(f"SUSPICIOUS_HIGH_NET_SALARY (Net > 95% Brut)")

                # Rule 3: Net < 40% Brut is suspicious
                elif net_val < (brut_val * 0.4):
                     warnings.append(f"SUSPICIOUS_LOW_NET_SALARY (Net < 40% Brut)")
            except:
                pass
                
        return warnings

    def check_payslip_consistency(self, text_content: str) -> list:
        """
        Runs specific checks for Payslips (NIR validation + Financial).
        """
        warnings = []
        # Find potential NIRs: 1 or 2 followed by 12 digits roughly
        # Regex for NIR: [12] \d{2} \d{2} \d{2} \d{3} \d{3} \d{2} (with optional spaces)
        nir_regex = re.compile(r"\b[12][0-9\s]{13,20}\b") 
        candidates = nir_regex.findall(text_content)
        
        for cand in candidates:
            # Check length of digits
            if len("".join(filter(str.isdigit, cand))) == 15:
                if not self._validate_nir(cand):
                    warnings.append(f"INVALID_SOCIAL_SECURITY_NUMBER_{cand}")
        
        # Add Financial Layer
        warnings.extend(self.check_salary_coherence(text_content))
                    
        return warnings

    def _extract_entities(self, text: str) -> dict:
        """
        Extracts key entities (Name, Address, SSN) for Multi-Document Cross-Check.
        Uses simplistic regex/heuristics for MVP.
        """
        entities = {}
        
        # 1. SSN / NIR Extraction (French format)
        nir_match = re.search(r"\b[12][0-9\s]{13,20}\b", text)
        if nir_match:
            entities["ssn"] = "".join(filter(str.isdigit, nir_match.group(0)))

        # 2. Name Extraction (Heuristic: Look for 'M.' or 'Mme' or 'Nom :')
        name_match = re.search(r"(?:M\.|Mme|Mlle|Nom\s*[:.\-])\s*([A-Z][A-Z\s\-]+)", text)
        if name_match:
            entities["extracted_name"] = name_match.group(1).strip()

        # 3. Address Extraction (Heuristic: Look for Zip Codes + City)
        # matches: "123 Rue de la Paix 75000 Paris"
        address_match = re.search(r"(\d+[\w\s,]+(?:[0-9]{5})\s*[A-Z\s]+)", text, re.IGNORECASE)
        if address_match:
            entities["extracted_address"] = address_match.group(1).strip()

        return entities

    def analyze(self, text_content: str, context: dict = None) -> dict:
        results = {}
        if context is None: context = {}
        
        # 1. Classify
        doc_type = self._detect_document_type(text_content)
        results["document_type"] = doc_type
        
        # 2. Extract Entities (For Multi-Doc)
        results.update(self._extract_entities(text_content))
        
        # 3. General Checks
        results["ibans"] = self.scan_for_ibans(text_content)
        results["math_consistency"] = self.check_arithmetic(text_content)
        
        # Check Time Paradox (Layer 4)
        creation_date_str = context.get('creation_date')
        if creation_date_str:
            try:
                if isinstance(creation_date_str, datetime):
                     c_date = creation_date_str
                else: 
                     import dateutil.parser
                     c_date = dateutil.parser.parse(creation_date_str, fuzzy=True)
                
                if self.check_dates(c_date, text_content):
                    results["business_warnings"] = ["TIME_PARADOX_DETECTED"]
            except:
                pass
        
        # 4. Specific Checks
        if "business_warnings" not in results:
             results["business_warnings"] = []
             
        if doc_type == "PAYSLIP":
            nir_warnings = self.check_payslip_consistency(text_content)
            results["business_warnings"].extend(nir_warnings)
        
        elif doc_type == "TAX_RETURN":
            import re
            year_matches = re.findall(r"\b20\d{2}\b", text_content)
            if len(year_matches) >= 2:
                years = sorted(list(set([int(y) for y in year_matches])))
                if len(years) > 1 and (years[-1] - years[-2]) != 1:
                     results["business_warnings"].append(f"TAX_YEAR_INCONSISTENCY (Years found: {years})")

        return results

    def check_universal_quality(self, text: str) -> list:
        """
        Layer 6: Universal Forensic Checks.
        Analyzes text quality, specific patterns, and entities for ANY document.
        """
        warnings = []
        if not text or len(text) < 50:
            return ["DOCUMENT_CONTENT_TOO_SPARSE"]

        # 1. OCR Garbage Detection (High ratio of non-alphanumeric)
        cleaned = re.sub(r'\s+', '', text)
        if len(cleaned) == 0: return []
        non_alnum = sum(1 for c in cleaned if not c.isalnum())
        ratio = non_alnum / len(cleaned)
        if ratio > 0.4: # >40% symbols = Bad OCR or binary dump
            warnings.append("SUSPICIOUS_TEXT_QUALITY_GARBAGE")

        # 2. Excessive CAPS Lock (Phishing often uses all-caps)
        # We ignore short texts
        letters = [c for c in text if c.isalpha()]
        if len(letters) > 50: # Lowered threshold to catch shorter phishing emails
            caps = sum(1 for c in letters if c.isupper())
            if (caps / len(letters)) > 0.8:
                warnings.append("SUSPICIOUS_PATTERN_EXCESSIVE_CAPS")

        # 3. Email Validity Check (Universal Hygiene)
        # Regex to find emails and check their structure
        emails = re.findall(r'[\w.+-]+@[\w-]+\.[\w.-]+', text)
        for email in emails:
            if "example.com" in email or "test.com" in email:
                warnings.append(f"SUSPICIOUS_EMAIL_DOMAIN_{email}")

        return warnings
            
        return results
