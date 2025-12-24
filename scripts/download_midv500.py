"""
MIDV-500 Dataset Downloader for VerifDoc Test Bank
Downloads identity document samples from the MIDV-500 public dataset
"""

import urllib.request
import os
from pathlib import Path
import zipfile

class MIDV500Downloader:
    """Download and extract MIDV-500 identity documents"""
    
    def __init__(self, output_dir="test_bank/real/identity"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # MIDV-500 FTP mirror (using HTTP mirror for easier access)
        self.dataset_url = "https://github.com/SmartEngines/midv-500/archive/refs/heads/master.zip"
        self.temp_zip = "midv500_temp.zip"
    
    def download_dataset(self):
        """Download the MIDV-500 dataset"""
        print("="*60)
        print("MIDV-500 Dataset Downloader")
        print("="*60)
        print(f"\n[*] Downloading from GitHub mirror...")
        print(f"    URL: {self.dataset_url}")
        print(f"    This may take a few minutes (dataset is ~500MB)...\n")
        
        try:
            urllib.request.urlretrieve(
                self.dataset_url,
                self.temp_zip,
                reporthook=self._progress_hook
            )
            print("\n✓ Download complete!")
            return True
        except Exception as e:
            print(f"\n✗ Download failed: {e}")
            return False
    
    def _progress_hook(self, block_num, block_size, total_size):
        """Progress callback for download"""
        downloaded = block_num * block_size
        if total_size > 0:
            percent = min(100, (downloaded / total_size) * 100)
            print(f"\r    Progress: {percent:.1f}% ({downloaded // 1024 // 1024}MB / {total_size // 1024 // 1024}MB)", end='')
    
    def extract_samples(self, max_samples=50):
        """Extract a subset of identity document samples"""
        print(f"\n[*] Extracting {max_samples} sample documents...")
        
        try:
            with zipfile.ZipFile(self.temp_zip, 'r') as zip_ref:
                # Get all image files from the dataset
                all_files = [f for f in zip_ref.namelist() 
                            if f.endswith(('.jpg', '.png', '.tif', '.jpeg'))]
                
                # Extract first N samples
                extracted = 0
                for file in all_files[:max_samples]:
                    filename = Path(file).name
                    zip_ref.extract(file, "temp_extract")
                    
                    # Move to identity folder
                    src = Path("temp_extract") / file
                    dst = self.output_dir / filename
                    src.rename(dst)
                    extracted += 1
                    
                    if extracted % 10 == 0:
                        print(f"    Extracted {extracted}/{max_samples}...")
            
            print(f"✓ Extracted {extracted} identity documents")
            
            # Cleanup
            os.remove(self.temp_zip)
            import shutil
            shutil.rmtree("temp_extract", ignore_errors=True)
            
            return extracted
        except Exception as e:
            print(f"✗ Extraction failed: {e}")
            return 0
    
    def run(self, max_samples=50):
        """Full download and extraction pipeline"""
        if self.download_dataset():
            count = self.extract_samples(max_samples)
            print("\n" + "="*60)
            print(f"SUCCESS: {count} identity documents ready for testing")
            print(f"Location: {self.output_dir.absolute()}")
            print("="*60)
            return count
        return 0

if __name__ == "__main__":
    downloader = MIDV500Downloader()
    downloader.run(max_samples=50)
