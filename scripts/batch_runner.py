
import os
import requests
import time

DATASET_DIR = "DATASET"
API_URL = "http://localhost:8000/api/v1/batch-analyze"
BATCH_SIZE = 5

def run_batch():
    files = [f for f in os.listdir(DATASET_DIR) if os.path.isfile(os.path.join(DATASET_DIR, f))]
    total = len(files)
    print(f"Found {total} files in {DATASET_DIR}")
    
    start_time = time.time()
    
    for i in range(0, total, BATCH_SIZE):
        batch = files[i:i+BATCH_SIZE]
        print(f"Processing batch {i//BATCH_SIZE + 1} ({len(batch)} files)...")
        
        files_payload = []
        opened_files = []
        
        try:
            for fname in batch:
                fpath = os.path.join(DATASET_DIR, fname)
                f = open(fpath, 'rb')
                opened_files.append(f)
                files_payload.append(('files', f))
            
            # Send Request
            try:
                r = requests.post(API_URL, files=files_payload, data={"sector": "GENERIC"})
                if r.status_code == 200:
                    print(f" -> Success! {len(r.json().get('individual_reports', []))} reports generated.")
                else:
                    print(f" -> Failed: {r.status_code} - {r.text}")
            except Exception as e:
                print(f" -> Request Error: {e}")
                
        finally:
            # Close handles
            for f in opened_files:
                f.close()
                
    duration = time.time() - start_time
    print(f"Total Time: {duration:.2f}s for {total} files.")
    print(f"Avg Time per file: {duration/total:.2f}s")

if __name__ == "__main__":
    run_batch()
