import sys
import os
sys.path.append(os.getcwd())
from core.orchestrator import MainAnalyzer

def test_splicing_pipeline():
    analyzer = MainAnalyzer()
    
    # Test Spliced Forgery (Added signature from noisy source)
    print("\n--- Testing SPLICED FORGERY (Copy-Add) ---")
    fraud_path = "test_bank/faked/splicing/spliced_signature.jpg"
    if os.path.exists(fraud_path):
        res_fraud = analyzer.analyze_document(fraud_path)
        print(f"Score: {res_fraud['score']} | Verdict: {res_fraud['verdict']}")
        print(f"Evidence: {res_fraud['evidence']}")
        
        # Check for Noise or Splicing indicators
        found_logic = False
        for ind in res_fraud['evidence']:
            if "SPLICING" in ind or "NOISE" in ind:
                print(f"[v] Logic confirmed: {ind}")
                found_logic = True
        
        if found_logic:
            print("[v] SUCCESS: Splicing forgery detected via noise floor analysis.")
        else:
            print("[x] FAILURE: Splicing missed.")
            
        print("\nHypotheses:")
        for h in res_fraud['hypotheses']:
            if "COMPOSITION" in h:
                print(f" -> {h}")

if __name__ == "__main__":
    test_splicing_pipeline()
