
import sys
import os
# Add root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from pdfminer.high_level import extract_text
except ImportError:
    print("PDFMiner not installed. Installing...")
    os.system("pip install pdfminer.six")
    from pdfminer.high_level import extract_text

def inspect(pdf_path):
    print(f"--- Inspecting {os.path.basename(pdf_path)} ---")
    try:
        text = extract_text(pdf_path)
        print(text)
    except Exception as e:
        print(f"Failed to read PDF: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        inspect(sys.argv[1])
    else:
        # Default test
        target = r"c:\Users\chaou\Desktop\VerifDoc Beta\final_results_extracted\static\reports\report_01064901.pdf"
        if os.path.exists(target):
            inspect(target)
        else:
            print(f"File not found: {target}")
