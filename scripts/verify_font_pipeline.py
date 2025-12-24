import sys
import os
sys.path.append(os.getcwd())
from core.orchestrator import MainAnalyzer

def test_font_pipeline():
    analyzer = MainAnalyzer()
    
    # 1. Test Clean Payslip
    print("\n--- Testing CLEAN Payslip ---")
    clean_path = "test_bank/real/employment/synthetic_payslip_001.pdf"
    if os.path.exists(clean_path):
        res_ok = analyzer.analyze_document(clean_path)
        print(f"Score: {res_ok['score']} | Verdict: {res_ok['verdict']}")
        print(f"Evidence: {res_ok['evidence']}")
    
    # 2. Test Font Forgery
    print("\n--- Testing FONT FORGERY (Patchwork) ---")
    fraud_path = "test_bank/faked/employment/font_forgery_payslip.pdf"
    if os.path.exists(fraud_path):
        res_fraud = analyzer.analyze_document(fraud_path)
        print(f"Score: {res_fraud['score']} | Verdict: {res_fraud['verdict']}")
        print(f"Evidence: {res_fraud['evidence']}")
        print(f"Hypotheses Count: {len(res_fraud['hypotheses'])}")
        for h in res_fraud['hypotheses']:
            if "PATCHWORK" in h or "polices" in h:
                print(f"[v] Logic confirmed: {h}")

if __name__ == "__main__":
    test_font_pipeline()
