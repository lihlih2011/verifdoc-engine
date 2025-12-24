import sys
import os
from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextContainer, LTChar, LTTextLineHorizontal
from collections import Counter

def analyze_fonts(pdf_path):
    print(f"[*] Analyzing fonts in {pdf_path}...")
    
    font_stats = Counter()
    line_fonts = []
    
    try:
        for page_layout in extract_pages(pdf_path):
            for element in page_layout:
                if isinstance(element, LTTextContainer):
                    for text_line in element:
                        if isinstance(text_line, LTTextLineHorizontal):
                            line_text = text_line.get_text().strip()
                            if not line_text:
                                continue
                            
                            fonts_in_line = set()
                            for char in text_line:
                                if isinstance(char, LTChar):
                                    fonts_in_line.add(char.fontname)
                                    font_stats[char.fontname] += 1
                            
                            if fonts_in_line:
                                line_fonts.append({
                                    "text": line_text[:50],
                                    "fonts": list(fonts_in_line)
                                })
                                
        # Calculate percentages
        total_chars = sum(font_stats.values())
        print(f"\n[+] Total characters analyzed: {total_chars}")
        
        main_font = None
        suspicious_outliers = []
        
        for font, count in font_stats.most_common():
            percentage = (count / total_chars) * 100
            print(f"  - {font}: {percentage:.2f}% ({count} chars)")
            
            if percentage > 70:
                main_font = font
            elif percentage < 5:
                # Potential copy-paste or specialized field edit
                suspicious_outliers.append((font, percentage))
                
        if main_font and suspicious_outliers:
            print("\n[!] SUSPICIOUS: Font outliers detected!")
            for font, perc in suspicious_outliers:
                print(f"    -> Font '{font}' used in only {perc:.2f}% of document.")
                # Find which lines use this font
                for lf in line_fonts:
                    if font in lf['fonts']:
                        print(f"       Loc: \"{lf['text']}...\"")
        else:
            print("\n[v] Font consistency looks normal.")
            
    except Exception as e:
        print(f"[x] Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        analyze_fonts(sys.argv[1])
    else:
        # Test on a known file if exists
        test_file = "test_bank/real/utilities/free_bill.pdf"
        if os.path.exists(test_file):
            analyze_fonts(test_file)
        else:
            print("Usage: python scripts/test_font_scan.py <path_to_pdf>")
