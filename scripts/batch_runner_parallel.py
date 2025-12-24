
import os
import requests
import time
import concurrent.futures
from pathlib import Path
import glob

# Config
DATASET_DIR = "DATASET"
REPORTS_DIR = "static/reports"
API_URL = "http://localhost:8000/api/v1/batch-analyze"
MAX_WORKERS = 4 

def analyze_file(file_path):
    """Worker function to analyze a single file"""
    fname = Path(file_path).name
    
    # 1. SMART RESUME: Check if report exists
    # The API generates reports named "VerifDoc_Analyse_[HASH].pdf", 
    # but for resume logic, we need to know if THIS file was processed.
    # Since the hash is unpredictable here without the logic, we rely on the API.
    # A better approach for the user is to check if *enough* reports exist, 
    # OR we can assume the API is idempotent and fast if cached? 
    # No, true resume needs us to check.
    # Hack: Let's check if there's a corresponding report file? 
    # Actually, the file naming scheme is obscure (random hash).
    # Plan B: We will check a local "processed.log" file.
    
    log_file = "processed_files.log"
    if os.path.exists(log_file):
        with open(log_file, "r") as f:
            if fname in f.read():
                return (True, fname, "SKIPPED (Already Done)")

    try:
        with open(file_path, 'rb') as f:
            files = {'files': (fname, f, 'application/pdf')}
            # Increased timeout for large files/Colab latency
            r = requests.post(API_URL, files=files, data={"sector": "GENERIC"}, timeout=120)
            
            if r.status_code == 200:
                # Mark as done
                with open(log_file, "a") as log:
                    log.write(f"{fname}\n")
                return (True, fname, "OK")
            else:
                return (False, fname, f"Status {r.status_code}")
    except Exception as e:
        return (False, fname, str(e))

def run_parallel():
    if not os.path.exists(DATASET_DIR):
        print(f"❌ Error: {DATASET_DIR} not found.")
        return

    files = [os.path.join(DATASET_DIR, f) for f in os.listdir(DATASET_DIR) 
             if os.path.isfile(os.path.join(DATASET_DIR, f))]
    
    total = len(files)
    
    # Check already processed
    processed_count = 0
    if os.path.exists("processed_files.log"):
        with open("processed_files.log", "r") as f:
            processed_count = len(f.readlines())
    
    remaining = total - processed_count
    
    print(f"🚀 Starting PARALLEL analysis.")
    print(f"   - Total Files: {total}")
    print(f"   - Already Done: {processed_count}")
    print(f"   - Remaining: {remaining}")
    
    if remaining == 0:
        print("✅ All files processed! Nothing to do.")
        return

    start_time = time.time()
    success_count = 0
    
    print(f"⚡ Launching {MAX_WORKERS} workers...")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Submit all tasks
        future_to_file = {executor.submit(analyze_file, f): f for f in files}
        
        for i, future in enumerate(concurrent.futures.as_completed(future_to_file)):
            f_path = future_to_file[future]
            try:
                success, fname, msg = future.result()
                if success:
                    success_count += 1
                    if "SKIPPED" not in msg:
                        # Simple progress bar
                        if i % 10 == 0:
                            print(f"[{i}/{total}] Processed {fname}...", flush=True)
                else:
                    print(f"❌ Failed {fname}: {msg}")
            except Exception as exc:
                print(f"❌ System Error on {f_path}: {exc}")
                
    duration = time.time() - start_time
    print("-" * 40)
    print(f"🏁 Finished batch in {duration:.2f}s")
    print(f"✅ Successful analyses: {success_count}/{total}")
    print("-" * 40)

if __name__ == "__main__":
    run_parallel()
