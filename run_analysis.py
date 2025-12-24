import sys, os
# Ensure the project root is in PYTHONPATH for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import json
from verifdoc.core.orchestrator import MainAnalyzer

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python run_analysis.py <pdf_path>")
        sys.exit(1)
    pdf_path = sys.argv[1]
    
    # Suppress stdout to avoid corrupting JSON output with debug prints
    original_stdout = sys.stdout
    try:
        sys.stdout = open(os.devnull, 'w')
        analyzer = MainAnalyzer()
        results = analyzer.analyze_document(pdf_path)
    finally:
        sys.stdout.close()
        sys.stdout = original_stdout
        
    print(json.dumps(results, indent=2, default=str))
