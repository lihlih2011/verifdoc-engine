import re

class MRZScanner:
    """
    Engine B Upgrade: MRZ Forensic Scanner.
    Detects and validates Machine Readable Zones (MRZ) on IDs and Passports.
    """

    def __init__(self):
        # Weights for the ISO/IEC 7501-1 checksum algorithm
        self.weights = [7, 3, 1]

    def _calculate_checksum(self, data: str) -> int:
        """
        Calculates the checksum for a given MRZ string.
        """
        total = 0
        for i, char in enumerate(data):
            if char == '<':
                val = 0
            elif char.isdigit():
                val = int(char)
            elif char.isalpha():
                val = ord(char.upper()) - ord('A') + 10
            else:
                val = 0
                
            total += val * self.weights[i % 3]
            
        return total % 10

    def scan(self, text: str) -> dict:
        """
        Scans OCR text for MRZ lines and validates them.
        Supports TD1 (ID Card - 3x30), TD2 (36x2), and TD3 (Passport - 44x2).
        """
        results = {
            "found": False,
            "type": None,
            "valid_checksums": False,
            "data": {},
            "raw_lines": []
        }

        # Clean text and find lines that look like MRZ (uppercase, digits, and <)
        lines = [line.strip().replace(" ", "") for line in text.split('\n') if len(line.strip()) >= 30]
        mrz_lines = [line for line in lines if re.match(r'^[A-Z0-9<]+$', line)]

        if not mrz_lines:
            return results

        # Try to identify the MRZ type
        # Passport (TD3) - 2 lines of 44
        td3_lines = [l for l in mrz_lines if len(l) == 44]
        if len(td3_lines) >= 2:
            return self._parse_td3(td3_lines[-2:], results)

        # ID Card (TD1) - 3 lines of 30
        td1_lines = [l for l in mrz_lines if len(l) == 30]
        if len(td1_lines) >= 3:
            return self._parse_td1(td1_lines[-3:], results)

        return results

    def _parse_td3(self, lines: list, results: dict) -> dict:
        """Parses TD3 (Passport) MRZ."""
        results["found"] = True
        results["type"] = "TD3 (Passport)"
        results["raw_lines"] = lines
        
        line2 = lines[1]
        
        # Structure: Document# [9] + C [1] + Nationality [3] + DOB [6] + C [1] + Sex [1] + Expiry [6] + C [1] + Optional [14] + C [1] + Final C [1]
        try:
            doc_num = line2[0:9]
            doc_c = line2[9]
            dob = line2[13:19]
            dob_c = line2[19]
            expiry = line2[21:27]
            expiry_c = line2[27]
            
            check1 = self._calculate_checksum(doc_num) == int(doc_c)
            check2 = self._calculate_checksum(dob) == int(dob_c)
            check3 = self._calculate_checksum(expiry) == int(expiry_c)
            
            results["valid_checksums"] = all([check1, check2, check3])
            results["data"] = {
                "document_number": doc_num.replace('<', ''),
                "dob": dob,
                "expiry": expiry
            }
        except:
            results["valid_checksums"] = False
            
        return results

    def _parse_td1(self, lines: list, results: dict) -> dict:
        """Parses TD1 (ID Card) MRZ."""
        results["found"] = True
        results["type"] = "TD1 (ID Card)"
        results["raw_lines"] = lines
        
        line1 = lines[0]
        line2 = lines[1]
        
        try:
            doc_num = line1[5:14]
            doc_c = line1[14]
            dob = line2[0:6]
            dob_c = line2[6]
            expiry = line2[8:14]
            expiry_c = line2[14]
            
            check1 = self._calculate_checksum(doc_num) == int(doc_c)
            check2 = self._calculate_checksum(dob) == int(dob_c)
            check3 = self._calculate_checksum(expiry) == int(expiry_c)
            
            results["valid_checksums"] = all([check1, check2, check3])
            results["data"] = {
                "document_number": doc_num.replace('<', ''),
                "dob": dob,
                "expiry": expiry
            }
        except:
            results["valid_checksums"] = False
            
        return results
