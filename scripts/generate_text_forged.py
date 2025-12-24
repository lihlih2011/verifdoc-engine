import sys, os, pikepdf
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def replace_text(pdf_path: str, out_path: str, new_text: str):
    # Create a temporary PDF with the new text
    tmp_pdf = "tmp_text.pdf"
    c = canvas.Canvas(tmp_pdf, pagesize=letter)
    c.drawString(100, 750, new_text)
    c.save()
    # Merge the temporary page into the original PDF (overlay first page content)
    with pikepdf.open(pdf_path) as src, pikepdf.open(tmp_pdf) as txt:
        # Overlay the text page onto the first page of source
        pikepdf.Page(src.pages[0]).add_overlay(pikepdf.Page(txt.pages[0]))
        src.save(out_path)
    os.remove(tmp_pdf)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python generate_text_forged.py <source_pdf> <output_pdf> <new_text>")
        sys.exit(1)
    src, out, txt = sys.argv[1], sys.argv[2], sys.argv[3]
    replace_text(src, out, txt)
    print(f"Created forged PDF with modified text at {out}")
