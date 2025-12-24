import sys, os, json
# Add project root to PYTHONPATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

from verifdoc.core.orchestrator import MainAnalyzer

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python run_forged.py <pdf_path>')
        sys.exit(1)
    pdf_path = sys.argv[1]
    analyzer = MainAnalyzer()
    results = analyzer.analyze_document(pdf_path)
    print(json.dumps(results, indent=2, default=str))
