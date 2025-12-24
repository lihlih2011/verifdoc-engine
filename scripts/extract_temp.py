import pikepdf
from PIL import Image
import os

def extract_all(pdf_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    pdf = pikepdf.open(pdf_path)
    count = 0
    for i, page in enumerate(pdf.pages):
        for name, img_obj in page.images.items():
            img = pikepdf.PdfImage(img_obj)
            pil_img = img.as_pil_image()
            path = os.path.join(out_dir, f"extracted_{count}.jpg")
            pil_img.convert("RGB").save(path)
            print(f"[v] Extracted {path}")
            count += 1

if __name__ == "__main__":
    extract_all("test_bank/faked/clones/signature_clone_test.pdf", "temp_extracted")
