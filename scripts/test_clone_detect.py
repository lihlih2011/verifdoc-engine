import cv2
import numpy as np
from collections import defaultdict
import os

def detect_clones(image_path, block_size=32, step=8, similarity_threshold=0):
    """
    Detects Copy-Move forgery by comparing hashes of small image blocks.
    """
    print(f"[*] Analyzing {image_path} for clones (Block size: {block_size})...")
    img = cv2.imread(image_path)
    if img is None:
        print("[x] Error reading image")
        return []
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Blur to remove pixel noise and focus on structure
    gray = cv2.GaussianBlur(gray, (3, 3), 0)
    
    h, w = gray.shape
    hashes = defaultdict(list)
    
    # Iterate over overlapping blocks
    for y in range(0, h - block_size, step):
        for x in range(0, w - block_size, step):
            block = gray[y:y+block_size, x:x+block_size]
            
            # Simple average hash
            avg = block.mean()
            # Binary hash: 1 if pixel > avg, else 0
            bool_hash = (block > avg).astype(np.uint8)
            # Flatten to a bit-string or tuple for hashability
            bits = tuple(bool_hash.flatten())
            
            hashes[bits].append((x, y))
            
    suspicious_clusters = []
    
    for bits, locations in hashes.items():
        if len(locations) > 1:
            # Check spatial distance (clones shouldn't be immediately adjacent blocks)
            # Find pairings that are far apart
            for i in range(len(locations)):
                for j in range(i + 1, len(locations)):
                    l1 = locations[i]
                    l2 = locations[j]
                    dist = np.sqrt((l1[0] - l2[0])**2 + (l1[1] - l2[1])**2)
                    
                    if dist > block_size * 2: # Significant distance
                        suspicious_clusters.append((l1, l2))
                        
    print(f"[+] Found {len(suspicious_clusters)} cloned patch pairs.")
    return suspicious_clusters

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        res = detect_clones(sys.argv[1])
        if res:
            print("[!] Clone detection triggered!")
    else:
        print("Usage: python scripts/test_clone_detect.py <path_to_image>")
