from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
import os

def generate_real_situation_forgery(output_path):
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    
    # Simulate a official-looking header
    c.setFont("Helvetica-Bold", 14)
    c.drawString(100, height - 100, "AVIS D'IMPOT 2024 SUR LES REVENUS 2023")
    
    c.setFont("Helvetica", 10)
    c.drawString(100, height - 130, "M. JEAN DUPONT")
    c.drawString(100, height - 145, "123 RUE DE LA PAIX, 75001 PARIS")
    
    # Body text
    c.setFont("Helvetica", 9)
    y = height - 200
    c.drawString(100, y, "Revenu brut global ............................................ 45 000 EUR")
    c.drawString(100, y - 20, "Abattement forfaitaire ......................................... 4 500 EUR")
    
    # THE COPY-PASTE (Phase 9 & 10 detector)
    # Using a slightly different style for the 'Modified' field
    c.setFont("Helvetica-Bold", 10)
    c.drawString(100, y - 60, "REVENU IMPOSABLE .............................................. 125 000 EUR")
    
    # Adding a 'Cloned' official stamp (Phase 10 detector)
    # We'll use a simple circle as a 'stamp'
    def draw_stamp(x, y):
        c.setStrokeColorRGB(0.1, 0.1, 0.6)
        c.setLineWidth(2)
        c.circle(x, y, 30, stroke=1, fill=0)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x, y + 5, "CERTIFIÉ CONFORME")
        c.drawCentredString(x, y - 10, "MINISTÈRE FINANCES")
        
    draw_stamp(450, 150)
    # CLONE: Same stamp elsewhere
    draw_stamp(100, 150)
    
    c.save()
    print(f"[v] Real-world situation forgery generated at {output_path}")

if __name__ == "__main__":
    path = "test_bank/faked/real_world_scenario_tax_forgery.pdf"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    generate_real_situation_forgery(path)
