import os
import sys

# Add project root to path
sys.path.append(os.getcwd())

from core.orchestrator import MainAnalyzer
from core.reporting import generate_pdf_report

def test_full_flow():
    analyzer = MainAnalyzer()
    
    # Path to a real test file
    test_file = r"C:\Users\chaou\.gemini\antigravity\scratch\verifdoc\test_bank\real\orange_bill.pdf"
    
    if not os.path.exists(test_file):
        print(f"ERROR: Test file not found at {test_file}")
        return

    print(f"[*] Analyzing {test_file}...")
    try:
        # 1. Analyze
        result = analyzer.analyze_document(test_file)
        print("[OK] Analysis complete.")
        print(f"    Score: {result.get('score')}")
        
        # 2. Generate Report
        print("[*] Generating Sellable Report...")
        report_path = "test_sellable_report.pdf"
        generate_pdf_report(
            filename="orange_bill.pdf",
            score=result.get("score", 0),
            evidence=result.get("evidence", []),
            details=result,
            output_path=report_path
        )
        
        if os.path.exists(report_path):
            print(f"[OK] Report generated at {report_path}")
            print(f"     Size: {os.path.getsize(report_path)} bytes")
            print("SUCCESS: Full pipeline verified.")
        else:
            print("ERROR: Report file not created.")
            
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_full_flow()
