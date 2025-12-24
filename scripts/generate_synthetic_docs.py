"""
Synthetic Document Generator for VerifDoc Test Bank
Creates realistic test documents for sectors without public specimens
"""

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from pathlib import Path
from datetime import datetime, timedelta
import random

class SyntheticDocumentGenerator:
    """Generate realistic synthetic documents for testing"""
    
    def __init__(self, output_dir="test_bank/real"):
        self.output_dir = Path(output_dir)
    
    def generate_payslip(self, sector="employment", index=1):
        """Generate a synthetic French payslip"""
        output = self.output_dir / sector / f"synthetic_payslip_{index:03d}.pdf"
        output.parent.mkdir(parents=True, exist_ok=True)
        
        c = canvas.Canvas(str(output), pagesize=A4)
        width, height = A4
        
        # Header
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, height - 50, "BULLETIN DE PAIE")
        
        # Company info
        c.setFont("Helvetica", 10)
        c.drawString(50, height - 80, "Entreprise: ACME CORPORATION")
        c.drawString(50, height - 95, "SIRET: 123 456 789 00012")
        
        # Employee info
        c.drawString(50, height - 120, "Salarié: Jean DUPONT")
        c.drawString(50, height - 135, "Matricule: EMP-2024-001")
        
        # Period
        period = datetime.now().strftime("%B %Y")
        c.drawString(50, height - 160, f"Période: {period}")
        
        # Salary details
        y = height - 200
        c.setFont("Helvetica-Bold", 11)
        c.drawString(50, y, "Salaire Brut:")
        c.drawString(400, y, "3 500,00 €")
        
        y -= 20
        c.setFont("Helvetica", 10)
        c.drawString(50, y, "Cotisations Sociales:")
        c.drawString(400, y, "- 875,00 €")
        
        y -= 30
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, "NET À PAYER:")
        c.drawString(400, y, "2 625,00 €")
        
        # Footer
        c.setFont("Helvetica", 8)
        c.drawString(50, 50, f"Document généré le {datetime.now().strftime('%d/%m/%Y')}")
        
        c.save()
        print(f"✓ Generated: {output.name}")
        return output
    
    def generate_invoice(self, sector="utilities", index=1):
        """Generate a synthetic utility bill"""
        output = self.output_dir / sector / f"synthetic_invoice_edf_{index:03d}.pdf"
        output.parent.mkdir(parents=True, exist_ok=True)
        
        c = canvas.Canvas(str(output), pagesize=A4)
        width, height = A4
        
        # Header
        c.setFont("Helvetica-Bold", 18)
        c.drawString(50, height - 50, "EDF - Facture d'Électricité")
        
        # Customer info
        c.setFont("Helvetica", 10)
        c.drawString(50, height - 90, "Client: Marie MARTIN")
        c.drawString(50, height - 105, "N° Client: 1234567890")
        c.drawString(50, height - 120, "Adresse: 123 Rue de la République, 75001 Paris")
        
        # Invoice details
        invoice_date = datetime.now().strftime("%d/%m/%Y")
        c.drawString(50, height - 150, f"Date de facture: {invoice_date}")
        c.drawString(50, height - 165, "Période: 01/11/2024 - 30/11/2024")
        
        # Consumption
        y = height - 200
        c.setFont("Helvetica-Bold", 11)
        c.drawString(50, y, "Consommation:")
        c.drawString(400, y, "450 kWh")
        
        y -= 30
        c.setFont("Helvetica", 10)
        c.drawString(50, y, "Montant HT:")
        c.drawString(400, y, "67,50 €")
        
        y -= 20
        c.drawString(50, y, "TVA (20%):")
        c.drawString(400, y, "13,50 €")
        
        y -= 30
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, "TOTAL TTC:")
        c.drawString(400, y, "81,00 €")
        
        # Footer
        c.setFont("Helvetica", 8)
        c.drawString(50, 50, "EDF - Service Client: 09 69 32 15 15")
        
        c.save()
        print(f"✓ Generated: {output.name}")
        return output
    
    def generate_bank_statement(self, sector="banking", index=1):
        """Generate a synthetic RIB"""
        output = self.output_dir / sector / f"synthetic_rib_{index:03d}.pdf"
        output.parent.mkdir(parents=True, exist_ok=True)
        
        c = canvas.Canvas(str(output), pagesize=A4)
        width, height = A4
        
        # Header
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, height - 50, "RELEVÉ D'IDENTITÉ BANCAIRE (RIB)")
        
        # Bank info
        c.setFont("Helvetica", 10)
        c.drawString(50, height - 90, "Banque: CRÉDIT MUTUEL")
        c.drawString(50, height - 105, "Agence: Paris Centre - 75001")
        
        # Account holder
        c.drawString(50, height - 135, "Titulaire: Pierre BERNARD")
        c.drawString(50, height - 150, "Adresse: 45 Avenue des Champs-Élysées, 75008 Paris")
        
        # IBAN
        y = height - 190
        c.setFont("Helvetica-Bold", 11)
        c.drawString(50, y, "IBAN:")
        c.setFont("Courier", 10)
        c.drawString(120, y, "FR76 1234 5678 9012 3456 7890 123")
        
        y -= 25
        c.setFont("Helvetica-Bold", 11)
        c.drawString(50, y, "BIC:")
        c.setFont("Courier", 10)
        c.drawString(120, y, "CMCIFR2A")
        
        # Footer
        c.setFont("Helvetica", 8)
        c.drawString(50, 50, f"Document édité le {datetime.now().strftime('%d/%m/%Y')}")
        
        c.save()
        print(f"✓ Generated: {output.name}")
        return output
    
    def generate_all_sectors(self):
        """Generate synthetic documents for all sectors"""
        print("="*60)
        print("SYNTHETIC DOCUMENT GENERATOR")
        print("="*60)
        
        generated = []
        
        # Employment
        print("\n[EMPLOYMENT]")
        for i in range(3):
            generated.append(self.generate_payslip(index=i+1))
        
        # Utilities
        print("\n[UTILITIES]")
        for i in range(3):
            generated.append(self.generate_invoice(index=i+1))
        
        # Banking
        print("\n[BANKING]")
        for i in range(3):
            generated.append(self.generate_bank_statement(index=i+1))
        
        print("\n" + "="*60)
        print(f"SUCCESS: {len(generated)} synthetic documents created")
        print("="*60)
        
        return generated

if __name__ == "__main__":
    generator = SyntheticDocumentGenerator()
    generator.generate_all_sectors()
