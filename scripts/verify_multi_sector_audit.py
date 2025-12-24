import sys
import os
sys.path.append(os.getcwd())
from core.orchestrator import MainAnalyzer

def run_multi_sector_audit():
    analyzer = MainAnalyzer()
    
    test_cases = [
        {
            "name": "IDENTITY (CNI)",
            "path": "test_bank/faked/identity/forged_cni_audit.pdf",
            "target_indicators": ["FONT_OUTLIER", "FRAUD_MRZ_CHECKSUM_INVALID"]
        },
        {
            "name": "EMPLOYMENT (PAYSLIP)",
            "path": "test_bank/faked/employment/forged_payslip_audit.pdf",
            "target_indicators": ["CLONE", "IMPOSSIBLE_NET_SALARY", "COMBO_PRODUCER_PLUS_IMAGES"]
        },
        {
            "name": "BANKING (RIB)",
            "path": "test_bank/faked/banking/forged_rib_audit.jpg",
            "target_indicators": ["NOISE_INCONSISTENCY"]
        }
    ]
    
    with open("multi_sector_audit_log.txt", "w", encoding="utf-8") as f:
        f.write("PHASE 13: MULTI-SECTOR FORENSIC AUDIT\n")
        f.write("="*40 + "\n")
        
        successful = 0
        for case in test_cases:
            f.write(f"\n[*] CASE: {case['name']}\n")
            res = analyzer.analyze_document(case['path'])
            f.write(f" -> SCORE: {res['score']} | VERDICT: {res['verdict']}\n")
            f.write(f" -> EVIDENCE: {res['evidence']}\n")
            if "EMPLOYMENT" in case['name']:
                f.write(f" -> RAW TEXT PREVIEW: {res['details']['stats']['text_content'][:500]!r}\n")
            
            found = False
            for target in case['target_indicators']:
                if any(target in e for e in res['evidence']):
                    f.write(f" [v] Detected: {target}\n")
                    found = True
            if found: successful += 1
            
        f.write(f"\nFINAL STATS: {successful}/{len(test_cases)} SUCCESSFUL\n")

if __name__ == "__main__":
    run_multi_sector_audit()
