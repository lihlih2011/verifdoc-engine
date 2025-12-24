import zipfile
import os

zip_path = "dataset.zip"
extract_to = "DATASET_CASIA"

if not os.path.exists(extract_to):
    os.makedirs(extract_to)

print(f"Extracting {zip_path} to {extract_to}...")
with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    # Filter for CASIA2 folder only to save time/space
    # or extract all if structure is unknown
    for file in zip_ref.namelist():
        if "CASIA2" in file:
            zip_ref.extract(file, extract_to)
            
print("Extraction complete.")
