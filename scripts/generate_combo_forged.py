from generate_text_forged import replace_text
from generate_image_forged import add_image
import sys, os

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python generate_combo_forged.py <source_pdf> <output_pdf> <new_text> <image_path>")
        sys.exit(1)
    src, out, txt, img = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    # First replace text
    tmp_pdf = "tmp_combo.pdf"
    replace_text(src, tmp_pdf, txt)
    # Then embed image
    add_image(tmp_pdf, out, img)
    os.remove(tmp_pdf)
    print(f"Created forged PDF with modified text and embedded image at {out}")
