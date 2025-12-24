import cv2
import numpy as np
import os

def analyze_noise_variance(image_path, block_size=16):
    """
    Detects regional noise inconsistencies. 
    Added objects (signatures from other sources) often have different variance.
    """
    print(f"[*] Analyzing noise variance in {image_path}...")
    img = cv2.imread(image_path)
    if img is None:
        print("[x] Error reading image")
        return None
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float64)
    h, w = gray.shape
    
    # Calculate local variance for each block
    variance_map = np.zeros((h // block_size, w // block_size))
    
    for y in range(0, h - block_size, block_size):
        for x in range(0, w - block_size, block_size):
            block = gray[y:y+block_size, x:x+block_size]
            variance = np.var(block)
            variance_map[y // block_size, x // block_size] = variance
            
    # Normalize for visualization
    v_min, v_max = np.min(variance_map), np.max(variance_map)
    norm_variance = (variance_map - v_min) / (v_max - v_min + 1e-5)
    
    # Global statistics
    mean_var = np.mean(variance_map)
    std_var = np.std(variance_map)
    
    print(f"[+] Global Noise Mean: {mean_var:.2f}, Std: {std_var:.2f}")
    
    # Find outliers (Splicing candidates)
    # Regions with very high or very low variance compared to background
    threshold = mean_var + 3 * std_var
    outliers = np.where(variance_map > threshold)
    
    print(f"[!] Found {len(outliers[0])} high-variance noise blocks.")
    
    return {
        "mean_variance": mean_var,
        "outlier_count": len(outliers[0]),
        "variance_map_shape": variance_map.shape
    }

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        analyze_noise_variance(sys.argv[1])
    else:
        # Test on existing forged file
        test_file = "test_bank/faked/clones/signature_clone_test.pdf_img_0_Im0.jpg"
        if os.path.exists(test_file):
            analyze_noise_variance(test_file)
        else:
            print("Usage: python scripts/test_noise_detect.py <path_to_image>")
