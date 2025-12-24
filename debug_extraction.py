import pikepdf
import sys
from PIL import Image

def test_extract(file_path):
    print(f"Opening {file_path}...")
    try:
        pdf = pikepdf.open(file_path)
        print(f"Pages: {len(pdf.pages)}")
        for i, page in enumerate(pdf.pages):
            print(f"Page {i} images key: {page.images.keys()}")
            for name, image_obj in page.images.items():
                print(f"Processing image {name}...")
                try:
                    img = pikepdf.PdfImage(image_obj) 
                    pil_img = img.as_pil_image()
                    print(f" - Extraction success: {pil_img.size}")
                except Exception as e:
                    print(f" - Extraction failed: {e}")
    except Exception as e:
        print(f"PDF Open failed: {e}")

if __name__ == "__main__":
    test_extract("tests/image_forged.pdf")
