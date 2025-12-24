from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from PIL import Image, ImageDraw
import os

def generate_forged_payslip(output_path):
    # 1. Create a "Company Logo" IMAGE and clone it
    logo_path = "temp_company_logo.jpg"
    logo = Image.new('RGB', (100, 40), color=(200, 200, 200))
    d = ImageDraw.Draw(logo)
    d.text((10, 10), "CORP-X", fill=(0,0,0))
    logo.save(logo_path)
    
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    
    # 2. Header with CLONED LOGOS (Phase 10 detector)
    # We paste the logo twice, which is unusual for a single page unless it's a clone
    c.drawImage(logo_path, 50, height - 80, width=80, height=32)
    c.drawImage(logo_path, 450, height - 80, width=80, height=32)
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(200, height - 60, "BULLETIN DE PAIE")
    
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 120, "Entreprise : CORP-X TECHNOLOGIES")
    c.drawString(50, height - 135, "Employé : ALEXANDRE MARTIN")
    
    # 3. Financial Data (Layer 5: Financial Coherence detector)
    # FORGERY: HT + TVA != TTC logic (or Net/Gross logic)
    # SALAIRE BRUT: 5000
    # SALAIRE NET: 6000 (Definitively Impossible)
    c.drawString(50, height - 200, "SALAIRE BRUT .................................... 5 000,00 EUR")
    c.drawString(50, height - 220, "COTISATIONS SOCIALES ............................   200,00 EUR")
    
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, height - 260, "NET A PAYER AVANT IMPOT ......................... 6 000,00 EUR")
    
    c.save()
    os.remove(logo_path)
    print(f"[v] Forged payslip generated at {output_path}")

if __name__ == "__main__":
    path = "test_bank/faked/employment/forged_payslip_audit.pdf"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    generate_forged_payslip(path)
