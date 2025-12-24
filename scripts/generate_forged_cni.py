from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
import os

def generate_forged_cni(output_path):
    c = canvas.Canvas(output_path, pagesize=(400, 250)) # Format CNI-ish
    
    # 1. Background / Header
    c.setFont("Helvetica-Bold", 12)
    c.drawString(20, 220, "RÉPUBLIQUE FRANÇAISE")
    c.setFont("Helvetica", 10)
    c.drawString(20, 205, "CARTE NATIONALE D'IDENTITÉ")
    
    # 2. Identity Data
    c.setFont("Helvetica", 8)
    c.drawString(20, 170, "Nom :")
    
    # FORGERY 1: Font Outlier (Patchwork)
    # Using 'Courier' which stands out against 'Helvetica'
    c.setFont("Courier-Bold", 11)
    c.drawString(60, 170, "MARTIN-FORGER") 
    
    c.setFont("Helvetica", 8)
    c.drawString(20, 155, "Prénom(s) :")
    c.drawString(60, 155, "ALEXANDRE")
    
    c.drawString(20, 140, "Né le : 14/05/1985")
    c.drawString(150, 140, "à : LYON (69)")
    
    # 3. MRZ Area (Phase 4 detector)
    # FORGERY 2: Invalid Checksum MRZ
    # Line 1: Type, Country, Name
    mrz1 = "IDFRA75001<<<<<<<<<<<<<<<<<<<<"
    mrz2 = "8505147M2401015FRA<<<<<<<<<<<8" # Wrong checksum at end
    mrz3 = "MARTIN<<ALEXANDRE<<<<<<<<<<<<<"
    
    c.setFont("Courier", 10)
    c.drawString(20, 45, mrz1)
    c.drawString(20, 30, mrz2)
    c.drawString(20, 15, mrz3)
    
    c.save()
    print(f"[v] Forged CNI generated at {output_path}")

if __name__ == "__main__":
    path = "test_bank/faked/identity/forged_cni_audit.pdf"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    generate_forged_cni(path)
