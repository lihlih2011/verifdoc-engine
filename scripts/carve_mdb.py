
import os
import re
import mmap

MDB_PATH = r"DATASET_REAL\data.mdb"
OUT_DIR = r"DATASET_REAL\extracted_carved"

def carve_media_mmap(file_path, out_dir):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    os.makedirs(out_dir, exist_ok=True)
    file_size = os.path.getsize(file_path)
    print(f"Scanning {file_path} ({file_size / 1024 / 1024:.2f} MB) using mmap...")
    
    # Signatures (RELAXED for JPG)
    sigs = {
        'pdf': (b'%PDF-', b'%%EOF'),
        'jpg': (b'\xFF\xD8', b'\xFF\xD9'), # Just Start/End of Image, ignore App markers
        'png': (b'\x89PNG\r\n\x1a\n', b'IEND\xAE\x42\x60\x82')
    }
    
    found_total = 0
    
    with open(file_path, 'rb') as f:
        # Memory Map the file (zero memory usage in Python process)
        with mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ) as mm:
            
            for ext, (start_sig, end_sig) in sigs.items():
                print(f"Scanning for {ext.upper()}...")
                
                # regex on mmap can be slow or unsupported in older python for bytes
                # We'll use find() loop which is efficient on mmap
                
                last_pos = 0
                count = 0
                while True:
                    start = max(mm.find(start_sig, last_pos), last_pos)
                    # If find returns -1 (not found) and last_pos > 0, we must break
                    # Fix: find returns -1 on failure.
                    # Correct logic:
                    start = mm.find(start_sig, last_pos)
                    if start == -1:
                        break
                    
                    # Found start, look for end
                    end = mm.find(end_sig, start)
                    if end != -1:
                        end += len(end_sig)
                        size = end - start
                        
                        # Validate Size (5KB to 20MB) - Ignore too small icons
                        if 5000 < size < 20 * 1024 * 1024:
                            content = mm[start:end]
                            # Unique Name using Offset
                            out_name = os.path.join(out_dir, f"carved_{found_total}_offset_{start}.{ext}")
                            with open(out_name, "wb") as out_f:
                                out_f.write(content)
                            count += 1
                            found_total += 1
                            
                            if count % 100 == 0:
                                print(f" -> Extracted {count} {ext} files...")
                                
                    last_pos = start + 1
                    
                    # Safety Cap (Increased for User 4000 docs)
                    if count >= 10000: 
                        print("Hit safety limit of 10000 per type.")
                        break

                print(f" -> Total {ext} extracted: {count}")

if __name__ == "__main__":
    carve_media_mmap(MDB_PATH, OUT_DIR)
