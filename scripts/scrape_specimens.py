"""
Universal Document Specimen Scraper for VerifDoc Test Bank
Downloads public specimens from various categories to build a comprehensive forensic dataset.
"""

import requests
import os
from pathlib import Path

class UniversalSpecimenScraper:
    """Automated scraper for diverse document specimens"""
    
    def __init__(self, output_dir="test_bank/real"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Public specimen URLs (verified sources)
        self.specimen_sources = {
            # Administrative & Legal
            "payslip_fr": "https://www.coover.fr/static-assets/documents/modele-bulletin-paie.pdf",
            "tax_notice_fr": "https://www.impots.gouv.fr/sites/default/files/media/specimen-avis-impot.pdf",
            
            # Identity (MIDV-500 samples - using GitHub mirror)
            "passport_sample": "https://raw.githubusercontent.com/SmartEngines/midv-500/master/dataset/01_alb_id/ground_truth/01_alb_id_01.tif",
            
            # Financial & Commercial
            "invoice_stripe": "https://stripe.com/img/v3/payments/overview/invoice_sample.pdf",
            "bank_statement": "https://www.boursobank.com/files/live/sites/boursorama/files/PDF/Specimen_RIB.pdf",
            
            # Medical (Public templates)
            "medical_cert": "https://www.ameli.fr/sites/default/files/Documents/certificat-medical-type.pdf",
            
            # Academic
            "diploma_sample": "https://www.education.gouv.fr/sites/default/files/specimen-diplome-bac.pdf",
            
            # Real Estate
            "lease_contract": "https://www.service-public.fr/resources/CERFA_10799.pdf",
            
            # Utility Bills
            "edf_bill": "https://www.edf.fr/sites/default/files/specimen-facture-edf.pdf",
            "orange_bill": "https://www.orange.fr/portail/offres/specimen-facture.pdf",
        }
    
    def download_specimen(self, name, url):
        """Download a single specimen"""
        try:
            print(f"[*] Downloading {name} from {url}")
            response = requests.get(url, timeout=30, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            
            if response.status_code == 200:
                # Detect file extension
                content_type = response.headers.get('content-type', '')
                if 'pdf' in content_type or url.endswith('.pdf'):
                    ext = '.pdf'
                elif 'image' in content_type or url.endswith(('.jpg', '.png', '.tif')):
                    ext = Path(url).suffix or '.jpg'
                else:
                    ext = '.pdf'
                
                filename = self.output_dir / f"{name}{ext}"
                with open(filename, 'wb') as f:
                    f.write(response.content)
                print(f"   ✓ Saved to {filename}")
                return True
            else:
                print(f"   ✗ Failed (HTTP {response.status_code})")
                return False
        except Exception as e:
            print(f"   ✗ Error: {e}")
            return False
    
    def scrape_all(self):
        """Download all specimens"""
        print("=" * 60)
        print("UNIVERSAL SPECIMEN SCRAPER - VerifDoc Test Bank")
        print("=" * 60)
        
        success_count = 0
        total = len(self.specimen_sources)
        
        for name, url in self.specimen_sources.items():
            if self.download_specimen(name, url):
                success_count += 1
        
        print("\n" + "=" * 60)
        print(f"Download Complete: {success_count}/{total} specimens acquired")
        print(f"Location: {self.output_dir.absolute()}")
        print("=" * 60)
        
        return success_count

if __name__ == "__main__":
    scraper = UniversalSpecimenScraper()
    scraper.scrape_all()
