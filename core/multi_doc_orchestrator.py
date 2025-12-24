import re
from typing import List, Dict

class MultiDocAnalyzer:
    """
    Analyzes multiple documents simultaneously to detect inconsistencies.
    Used for Phase 8: Multi-Document Cross-Check.
    """
    
    def __init__(self):
        self.consistency_score = 100
        self.findings = []

    def _normalize_name(self, name: str) -> str:
        """Simple name normalization for comparison."""
        if not name: return ""
        # Remove accents, special chars, and lowercase
        name = name.lower()
        name = re.sub(r'[^a-z0-9 ]', ' ', name)
        return " ".join(sorted(name.split())) # Sort words to handle "Doe John" vs "John Doe"

    def analyze_batch(self, reports: List[Dict]) -> Dict:
        """
        Cross-checks multiple document reports.
        """
        self.consistency_score = 100
        self.findings = []
        
        if len(reports) < 2:
            return {
                "consistency_score": 100,
                "status": "INSUFFICIENT_DATA",
                "findings": ["At least two documents required for cross-check."]
            }

        # 1. Identity Consistency (Names)
        names_found = []
        for report in reports:
            # Extract names from metadata, business logic, or OCR
            # This relies on the engines having identified the 'holder_name' or similar
            # For now, we'll look into semantic flags and logic results
            logic = report.get('details', {}).get('logic', {}).get('business', {})
            # Hypothetical: engines should extract 'entity_name'
            # We will use raw_text for a basic match if specific fields aren't present
            # In a real app, we'd have a 'identity_profile' dict in the report
            
            # Let's check for specific extracted entities in logic/business
            name = logic.get('extracted_name')
            if name:
                names_found.append({"doc": report['filename'], "name": name, "normalized": self._normalize_name(name)})

        if len(names_found) >= 2:
            base_name = names_found[0]['normalized']
            for entry in names_found[1:]:
                if entry['normalized'] != base_name:
                    self.consistency_score -= 40
                    self.findings.append(f"IDENTITY_MISMATCH: '{names_found[0]['name']}' ({names_found[0]['doc']}) vs '{entry['name']}' ({entry['doc']})")

        # 2. Address Consistency
        addresses = []
        for report in reports:
            logic = report.get('details', {}).get('logic', {}).get('business', {})
            addr = logic.get('extracted_address')
            if addr:
                addresses.append({"doc": report['filename'], "address": addr, "normalized": self._normalize_name(addr)})

        if len(addresses) >= 2:
            # Address matching is harder, we'll use a partial match or word overlap
            base_words = set(addresses[0]['normalized'].split())
            for entry in addresses[1:]:
                entry_words = set(entry['normalized'].split())
                overlap = base_words.intersection(entry_words)
                if len(overlap) < 2: # Very low overlap
                    self.consistency_score -= 30
                    self.findings.append(f"ADDRESS_INCONSISTENCY: Potential mismatch between {addresses[0]['doc']} and {entry['doc']}")

        # 3. Numeric Identifier Consistency (SSN, IBAN)
        ssns = []
        for report in reports:
             logic = report.get('details', {}).get('logic', {}).get('business', {})
             ssn = logic.get('ssn')
             if ssn:
                 ssns.append({"doc": report['filename'], "ssn": ssn})
        
        if ssns:
            first_ssn = ssns[0]['ssn']
            for s in ssns[1:]:
                if s['ssn'] != first_ssn:
                    self.consistency_score -= 50
                    self.findings.append(f"SSN_MISMATCH: Different Social Security Numbers found between {ssns[0]['doc']} and {s['doc']}")

        # Final Verdict
        verdict = "CONSISTENT" if self.consistency_score >= 80 else "SUSPICIOUS" if self.consistency_score >= 50 else "INCONSISTENT"
        
        return {
            "consistency_score": max(0, self.consistency_score),
            "verdict": verdict,
            "findings": self.findings,
            "document_count": len(reports)
        }
