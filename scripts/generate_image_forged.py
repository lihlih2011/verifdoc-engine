import sys, os, pikepdf
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def add_image(pdf_path: str, out_path: str, image_path: str):
    # Create a temporary PDF containing the image on a page
    tmp_pdf = "tmp_image.pdf"
    c = canvas.Canvas(tmp_pdf, pagesize=letter)
    c.drawImage(image_path, 100, 500, width=200, height=200)  # position & size
    c.save()
    # Merge the image page as a new page at the end of the original PDF
    with pikepdf.open(pdf_path) as src, pikepdf.open(tmp_pdf) as img_pdf:
        src.pages.append(img_pdf.pages[0])
        src.save(out_path)
    os.remove(tmp_pdf)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python generate_image_forged.py <source_pdf> <output_pdf> <image_path>")
        sys.exit(1)
    src, out, img = sys.argv[1], sys.argv[2], sys.argv[3]
    add_image(src, out, img)
    print(f"Created forged PDF with embedded image at {out}")
