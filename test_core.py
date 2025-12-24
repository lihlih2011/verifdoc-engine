import sys
import os

# Add root to path
sys.path.append(os.path.abspath(os.path.join(os.getcwd(), '..'))

from verifdoc.core.orchestrator import MainAnalyzer
import pikepdf

def create_dummy_pdf():
    pdf = pikepdf.new()
    pdf.add_blank_page()
    pdf.save("test_doc.pdf")
    return "test_doc.pdf"

def test_pipeline():
    print("--- Creating Dummy PDF ---")
    filename = create_dummy_pdf()
    
    print("--- Initializing MainAnalyzer ---")
    analyzer = MainAnalyzer()
    
    print("--- Running Analysis ---")
    results = analyzer.analyze_document(filename)
    
    print("\n--- ANALYSIS RESULT ---")
    import json
    print(json.dumps(results, indent=2, default=str))
    
    # Cleanup
    if os.path.exists(filename):
        os.remove(filename)

if __name__ == "__main__":
    test_pipeline()
