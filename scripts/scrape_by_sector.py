"""
Sector-Based Universal Document Scraper for VerifDoc
Organizes specimens by industry sector for comprehensive testing
"""

import requests
import os
from pathlib import Path
from typing import Dict, List

class SectorSpecimenScraper:
    """Automated scraper organized by industry sector"""
    
    def __init__(self, base_dir="test_bank/real"):
        self.base_dir = Path(base_dir)
        
        # Sector-based specimen catalog
        self.specimens = {
            "banking": {
                "rib_boursobank": "https://www.boursobank.com/files/live/sites/boursorama/files/PDF/Specimen_RIB.pdf",
                "rib_bnp": "https://mabanque.bnpparibas/rsc/contrib/document/specimen-rib.pdf",
            },
            "government": {
                "tax_notice": "https://www.impots.gouv.fr/sites/default/files/media/specimen-avis-impot.pdf",
                "passport_sample": "https://www.consilium.europa.eu/prado/documents/FRA/passport-specimen.pdf",
            },
            "employment": {
                "payslip_coover": "https://www.coover.fr/static-assets/documents/modele-bulletin-paie.pdf",
                "payslip_eurecia": "https://www.eurecia.com/documents/specimen-fiche-paie.pdf",
            },
            "utilities": {
                "edf_bill": "https://www.edf.fr/sites/default/files/specimen-facture-edf.pdf",
                "orange_bill": "https://www.orange.fr/portail/offres/specimen-facture.pdf",
                "free_bill": "https://www.free.fr/assistance/documents/specimen-facture.pdf",
            },
            "legal": {
                "lease_contract": "https://www.service-public.fr/resources/CERFA_10799.pdf",
                "work_contract": "https://www.service-public.fr/resources/CERFA_12156.pdf",
            },
            "education": {
                "diploma_bac": "https://www.education.gouv.fr/sites/default/files/specimen-diplome-bac.pdf",
                "transcript": "https://www.education.gouv.fr/sites/default/files/specimen-releve-notes.pdf",
            },
            "healthcare": {
                "medical_cert": "https://www.ameli.fr/sites/default/files/Documents/certificat-medical-type.pdf",
                "prescription": "https://www.ameli.fr/sites/default/files/Documents/specimen-ordonnance.pdf",
            },
            "identity": {
                # Using MIDV-500 GitHub mirror for identity docs
                "id_card_sample": "https://raw.githubusercontent.com/SmartEngines/midv-500/master/dataset/01_alb_id/ground_truth/01_alb_id_01.tif",
            },
            "real_estate": {
                "dpe_diagnostic": "https://www.ecologie.gouv.fr/sites/default/files/specimen-DPE.pdf",
                "property_title": "https://www.service-public.fr/resources/specimen-titre-propriete.pdf",
            }
        }
    
    def download_specimen(self, sector: str, name: str, url: str) -> bool:
        """Download a specimen to its sector directory"""
        sector_dir = self.base_dir / sector
        sector_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            print(f"[{sector.upper()}] Downloading {name}...")
            response = requests.get(url, timeout=30, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            
            if response.status_code == 200:
                # Detect extension
                ext = '.pdf'
                if url.endswith(('.jpg', '.png', '.tif', '.jpeg')):
                    ext = Path(url).suffix
                
                filename = sector_dir / f"{name}{ext}"
                with open(filename, 'wb') as f:
                    f.write(response.content)
                print(f"   ✓ {filename.name}")
                return True
            else:
                print(f"   ✗ HTTP {response.status_code}")
                return False
        except Exception as e:
            print(f"   ✗ {str(e)[:50]}")
            return False
    
    def scrape_sector(self, sector: str) -> int:
        """Download all specimens for a specific sector"""
        if sector not in self.specimens:
            print(f"[ERROR] Unknown sector: {sector}")
            return 0
        
        print(f"\n{'='*60}")
        print(f"SECTOR: {sector.upper()}")
        print(f"{'='*60}")
        
        success = 0
        for name, url in self.specimens[sector].items():
            if self.download_specimen(sector, name, url):
                success += 1
        
        print(f"Result: {success}/{len(self.specimens[sector])} downloaded\n")
        return success
    
    def scrape_all(self):
        """Download all specimens across all sectors"""
        print("="*60)
        print("UNIVERSAL SECTOR-BASED SCRAPER")
        print("="*60)
        
        total_success = 0
        total_files = sum(len(docs) for docs in self.specimens.values())
        
        for sector in self.specimens.keys():
            total_success += self.scrape_sector(sector)
        
        print("="*60)
        print(f"FINAL RESULT: {total_success}/{total_files} specimens acquired")
        print(f"Location: {self.base_dir.absolute()}")
        print("="*60)
        
        # Generate summary
        self.generate_summary()
    
    def generate_summary(self):
        """Generate a summary of downloaded files"""
        summary_file = self.base_dir.parent / "acquisition_summary.txt"
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write("VerifDoc Test Bank - Acquisition Summary\n")
            f.write("="*60 + "\n\n")
            
            for sector in self.specimens.keys():
                sector_dir = self.base_dir / sector
                if sector_dir.exists():
                    files = list(sector_dir.glob("*"))
                    f.write(f"{sector.upper()}: {len(files)} files\n")
                    for file in files:
                        f.write(f"  - {file.name}\n")
                    f.write("\n")
        
        print(f"\n✓ Summary saved to: {summary_file}")

if __name__ == "__main__":
    import sys
    
    scraper = SectorSpecimenScraper()
    
    if len(sys.argv) > 1:
        # Scrape specific sector
        sector = sys.argv[1]
        scraper.scrape_sector(sector)
    else:
        # Scrape all sectors
        scraper.scrape_all()
