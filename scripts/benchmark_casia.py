import os
import sys
# Fix path to allow importing 'core' from parent directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import random
import glob
from core.orchestrator import MainAnalyzer as AnalysisOrchestrator
from tqdm import tqdm
import json

# CONFIG
CASIA_DIR = "DATASET_CASIA/CASIA2"
SAMPLE_SIZE = 50 
OUTPUT_FILE = "benchmark_casia_results.md"

def get_images(folder):
    """Get list of images from CASIA folder (jpg, tif, bmp)"""
    exts = ['*.jpg', '*.tif', '*.bmp', '*.png']
    files = []
    for ext in exts:
        files.extend(glob.glob(os.path.join(folder, ext)))
    return files

def run_benchmark():
    print("Initializing VerifDoc Engine v2...")
    orchestrator = AnalysisOrchestrator()
    
    # Paths (Adjust based on actual unzip structure)
    # CASIA2 usually has 'Au' (Authentic) and 'Tp' (Tampered) diretories
    path_au = os.path.join(CASIA_DIR, "Au")
    path_tp = os.path.join(CASIA_DIR, "Tp")
    
    if not os.path.exists(path_au) or not os.path.exists(path_tp):
        # Fallback if structure is different
        print(f"Error: CASIA2 structure not found at {CASIA_DIR}")
        print(f"Subdirs: {os.listdir('DATASET_CASIA') if os.path.exists('DATASET_CASIA') else 'Root not found'}")
        return

    print("Sampling images...")
    files_au = get_images(path_au)
    files_tp = get_images(path_tp)
    
    if not files_au or not files_tp:
        print("Error: No images found in Au or Tp.")
        return

    sample_au = random.sample(files_au, min(len(files_au), SAMPLE_SIZE))
    sample_tp = random.sample(files_tp, min(len(files_tp), SAMPLE_SIZE))
    
    results = {
        "TP": 0, # Altered identified as Altered
        "TN": 0, # Authentic identified as Authentic
        "FP": 0, # Authentic identified as Altered
        "FN": 0  # Altered identified as Authentic
    }
    
    details = []

    print(f"Starting Benchmark (N={len(sample_au) + len(sample_tp)})...")
    
    # Tested AUTHENTIC (Expected: Valid/Green)
    for f in tqdm(sample_au, desc="Benchmarking Authentic"):
        res = orchestrator.analyze_document(f, sector_context="GENERIC")
        verdict = res['verdict'] # VALID, SUSPICIOUS, FRAUDULENT
        score = res['score']
        
        if score < 30: # Benchmark Threshold
            results["TN"] += 1
            status = "CORRECT"
        else:
            results["FP"] += 1
            status = "FALSE_POSITIVE"
        
        details.append(f"| {os.path.basename(f)} | Authentic | {score} | {verdict} | {status} |")

    # Tested TAMPERED (Expected: Suspicious/Fraud)
    for f in tqdm(sample_tp, desc="Benchmarking Tampered"):
        res = orchestrator.analyze_document(f, sector_context="GENERIC")
        verdict = res['verdict']
        score = res['score']
        
        if score >= 30: # Benchmark Threshold
            results["TP"] += 1
            status = "CORRECT"
        else:
            results["FN"] += 1
            status = "FALSE_NEGATIVE"
            
        details.append(f"| {os.path.basename(f)} | Tampered | {score} | {verdict} | {status} |")
        
    # Stats
    total = results["TP"] + results["TN"] + results["FP"] + results["FN"]
    accuracy = (results["TP"] + results["TN"]) / total if total else 0
    precision = results["TP"] / (results["TP"] + results["FP"]) if (results["TP"] + results["FP"]) else 0
    recall = results["TP"] / (results["TP"] + results["FN"]) if (results["TP"] + results["FN"]) else 0
    
    # Report
    md = f"""
# CASIA v2 Benchmark Report
**Date**: {os.popen('date /t').read().strip()}
**Sample Size**: {total} images (50 Authentic, 50 Tampered)
**Engine**: VerifDoc v2 (Forensic Only - No Metadata/Logic for CASIA)

## Key Metrics
| Metric | Score |
| :--- | :--- |
| **Accuracy** | **{accuracy:.2%}** |
| **Precision** | **{precision:.2%}** |
| **Recall** | **{recall:.2%}** |

## Confusion Matrix
| | Predicted Authentic | Predicted Tampered |
| :--- | :---: | :---: |
| **Actual Authentic** | {results['TN']} (TN) | {results['FP']} (FP) |
| **Actual Tampered** | {results['FN']} (FN) | {results['TP']} (TP) |

## Details
| Filename | Ground Truth | Score | Verdict | Status |
| :--- | :--- | :--- | :--- | :--- |
"""
    md += "\n".join(details)
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(md)
        
    print(f"\nBenchmark Complete! Report saved to {OUTPUT_FILE}")
    print(f"Accuracy: {accuracy:.2%} | Recall: {recall:.2%}")

if __name__ == "__main__":
    run_benchmark()
