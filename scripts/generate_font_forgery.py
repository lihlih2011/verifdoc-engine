from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
import os

def generate_font_forgery(output_path):
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    
    # Header in Helvetica (Main Font)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "FICHE DE PAIE - DECEMBRE 2025")
    
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 80, "Employeur: TECH SOLUTIONS SAS")
    c.drawString(50, height - 100, "Salarie: JOHN DOE")
    
    # Body
    for i in range(10):
        c.drawString(50, height - 150 - (i*20), f"Ligne de detail de paie numero {i+1} ................... 100.00 EUR")
        
    # THE FORGERY: Salary in 'Courier' (Different font family)
    # This simulates someone using an online editor to "type over" the net salary
    c.setFont("Courier-Bold", 14)
    c.drawString(50, height - 400, "NET A PAYER : 5500.00 EUR")
    
    c.save()
    print(f"[v] Font forgery generated at {output_path}")

if __name__ == "__main__":
    path = "test_bank/faked/employment/font_forgery_payslip.pdf"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    generate_font_forgery(path)
