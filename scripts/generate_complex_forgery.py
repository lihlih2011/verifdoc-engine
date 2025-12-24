from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from PIL import Image, ImageDraw
import os
import numpy as np

def generate_complex_forgery(output_path):
    # 1. Create a "Signature" IMAGE with noise (Simulates external source)
    sig_w, sig_h = 150, 60
    sig_img = Image.new('RGB', (sig_w, sig_h), color=(255, 255, 255))
    d = ImageDraw.Draw(sig_img)
    d.line([(10, 50), (140, 10)], fill=(0, 0, 128), width=3)
    
    # Add noise
    np_sig = np.array(sig_img)
    noise = np.random.normal(0, 30, np_sig.shape).astype(np.int16)
    np_sig = np.clip(np_sig.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    sig_final = Image.fromarray(np_sig)
    
    sig_path = "temp_noisy_sig.jpg"
    sig_final.save(sig_path, quality=80)
    
    # 2. Create PDF
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    
    # Header - Official Font
    c.setFont("Helvetica-Bold", 14)
    c.drawString(70, height - 70, "REPUBLIQUE FRANCAISE - DIRECTION DES FINANCES")
    
    c.setFont("Helvetica", 11)
    c.drawString(70, height - 100, "AVIS D'IMPOT SUR LES REVENUS")
    c.drawString(70, height - 115, "NOM : DUPONT JEAN")
    
    # Body
    c.setFont("Helvetica", 10)
    c.drawString(70, height - 200, "Revenu imposable declare ........................... 35 000 EUR")
    
    # FORGERY 1: Font Patchwork (Copy-Paste style)
    # Using 'Times-Roman' which is a mismatch for 'Helvetica'
    c.setFont("Times-Bold", 11)
    c.drawString(70, height - 230, "MONTANT NET A PAYER ................................. 1 200 EUR")
    
    # FORGERY 2: Image Cloning & Splicing (Copy-Move + Noise)
    # We paste the SAME noisy signature twice
    c.drawImage(sig_path, 400, 100, width=120, height=45)
    c.setFont("Helvetica", 8)
    c.drawString(400, 90, "Signature Signature (Bailleur)")
    
    # CLONE IT
    c.drawImage(sig_path, 70, 100, width=120, height=45)
    c.drawString(70, 90, "Signature Signature (Locataire)")
    
    c.save()
    os.remove(sig_path)
    print(f"[v] Complex real-world forgery generated at {output_path}")

if __name__ == "__main__":
    path = "test_bank/faked/complex_integrated_forgery.pdf"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    generate_complex_forgery(path)
