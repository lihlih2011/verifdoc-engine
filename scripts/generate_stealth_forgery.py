from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from datetime import datetime, timedelta
import os

def create_stealth_forgery(filename="stealth_attack.pdf"):
    """
    Creates a 'Difficult' Forgery.
    - VISUALLY PROTECTED: No images, pure text (Bypasses ELA).
    - METADATA PROTECTED: Created by standard library (Bypasses Producer blacklist).
    - NIR VALID: Uses a mathematically valid NIR (Bypasses Layer 3).
    
    BUT contains HIDDEN BUSINESS LOGIC FLAWS (Layers 4 & 5):
    - Financial: Net Salary > Gross Salary (Impossible).
    - Time: Document Date is in the future.
    """
    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4

    # 1. Header (Looks official)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 50, "BULLETIN DE PAIE - ENTREPRISE FICTIVE S.A.")
    
    # 2. Add Valid NIR (Layer 3 Bypass attempt)
    # NIR: 1 80 05 78 005 005 32 -> Key 97 - (1800578005005%97) = 97 - 52 = 45
    # Valid NIR: 1 80 05 78 005 005 45
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 100, "Matricule: 45789")
    c.drawString(50, height - 115, "N° Sécu (NIR): 1 80 05 78 005 005 45") # THIS IS VALID!
    
    # 3. Time Paradox Attack (Layer 4)
    # We date the document 1 year in the FUTURE
    future_date = (datetime.now() + timedelta(days=365)).strftime("%d/%m/%Y")
    c.drawString(400, height - 50, f"Date: {future_date}") # Trap for Layer 4
    
    # 4. Financial Incoherence Attack (Layer 5)
    # Gross Salary: 2000
    # Net To Pay: 2500 (Impossible, but forger wants to look rich)
    y = height - 200
    c.drawString(50, y, "RUBRIQUES         BASE      TAUX      MONTANT")
    c.drawString(50, y-20, "Salaire de base   2000.00   100%      2000.00")
    c.drawString(50, y-40, "Indemnités        50.00               50.00")
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y-100, "TOTAL BRUT: 2050.00 €")
    
    # The Trap: Net > Brut
    c.setFont("Helvetica-Bold", 14)
    c.drawString(300, y-150, "NET A PAYER: 3000.00 €") # Trap for Layer 5
    
    c.save()
    print(f"[*] Stealth Forgery created: {filename}")
    print("    - Visual: Clean (Vector PDF)")
    print("    - NIR: Valid")
    print("    - TRAPS: Future Date + Net > Brut")

if __name__ == "__main__":
    create_stealth_forgery("stealth_attack_layer4_5.pdf")
