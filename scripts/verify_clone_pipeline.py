import sys
import os
sys.path.append(os.getcwd())
from core.orchestrator import MainAnalyzer

def test_clone_pipeline():
    analyzer = MainAnalyzer()
    
    # Test Clone Forgery (Signature duplication)
    print("\n--- Testing CLONE FORGERY (Signature Duplication) ---")
    fraud_path = "test_bank/faked/clones/signature_clone_test.pdf"
    if os.path.exists(fraud_path):
        res_fraud = analyzer.analyze_document(fraud_path)
        print(f"Score: {res_fraud['score']} | Verdict: {res_fraud['verdict']}")
        print(f"Evidence: {res_fraud['evidence']}")
        
        # Check for Structural or Internal Clone indicators
        found_logic = False
        for ind in res_fraud['evidence']:
            if "CLONE" in ind or "CLONING" in ind:
                print(f"[v] Logic confirmed: {ind}")
                found_logic = True
        
        if found_logic:
            print("[v] SUCCESS: Clone forgery detected.")
        else:
            print("[x] FAILURE: Clone forgery missed.")
            
        print("\nHypotheses:")
        for h in res_fraud['hypotheses']:
            if "CLONAGE" in h:
                print(f" -> {h}")

if __name__ == "__main__":
    test_clone_pipeline()
