import sys
import os
sys.path.append(os.getcwd())
from core.orchestrator import MainAnalyzer

def test_real_world_scenario():
    analyzer = MainAnalyzer()
    
    path = "test_bank/faked/complex_integrated_forgery.pdf"
    if not os.path.exists(path):
        print(f"[x] File not found: {path}")
        return

    print("\n" + "="*60)
    print("INTEGRATED TEST: REAL-WORLD TAX FORGERY")
    print("="*60)
    
    res = analyzer.analyze_document(path)
    
    print("\nREPORT SUMMARY:")
    print(f" - VERDICT: {res['verdict']}")
    print(f" - RISK SCORE: {res['score']}/100")
    print(f" - DETECTED SECTOR: {res['details']['sector']}")
    
    print("\nEVIDENCE LOG:")
    for ind in res['evidence']:
        print(f" [!] {ind}")
        
    print("\nSHERLOCK INVESTIGATION (Hypotheses):")
    for h in res['hypotheses']:
        print(f" -> {h}")
        
    print("="*60)

if __name__ == "__main__":
    test_real_world_scenario()
