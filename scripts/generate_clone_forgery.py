from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from PIL import Image, ImageDraw
import os

def generate_clone_forgery(output_path):
    # 1. Create a "Signature" image
    sig_img = Image.new('RGB', (200, 100), color=(255, 255, 255))
    d = ImageDraw.Draw(sig_img)
    # Draw some random "Signature" lines
    d.line([(20, 80), (180, 20)], fill=(0, 0, 128), width=3)
    d.line([(30, 70), (170, 30)], fill=(0, 0, 128), width=2)
    d.ellipse([(50, 40), (70, 60)], outline=(0, 0, 128), width=2)
    
    sig_path = "temp_signature.png"
    sig_img.save(sig_path)
    
    # 2. Create PDF with TWO identical signatures (cloned)
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 50, "CONTRAT DE LOCATION - CLONE TEST")
    
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 100, "Bailleur: .....................")
    c.drawString(50, height - 130, "Locataire: JOHN DOE")
    
    # Signature 1 (Legit location)
    c.drawImage(sig_path, 50, 100, width=150, height=75)
    c.drawString(50, 80, "Signature 1 (Bailleur)")
    
    # Signature 2 (CLONED to the other side - Fraud signal)
    # Using the EXACT SAME IMAGE FILE/PATCH
    c.drawImage(sig_path, 350, 100, width=150, height=75)
    c.drawString(350, 80, "Signature 2 (Locataire - CLONE)")
    
    c.save()
    os.remove(sig_path)
    print(f"[v] Clone forgery generated at {output_path}")

if __name__ == "__main__":
    path = "test_bank/faked/clones/signature_clone_test.pdf"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    generate_clone_forgery(path)
