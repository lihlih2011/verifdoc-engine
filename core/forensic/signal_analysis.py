import cv2
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
import os

class SignalForensicEngine:
    """
    Moteur A : Forensic de Signal (Image Analysis)
    Analyzes images for signs of tampering using ELA, DCT, and Luminance analysis.
    """

    def __init__(self):
        pass

    def perform_ela(self, image_path: str, quality: int = 90, context: dict = None) -> tuple[float, str]:
        """
        Error Level Analysis (ELA).
        Returns (score, heatmap_path).
        """
        if context is None: context = {}
        is_compressed = context.get("is_compressed_producer", False)

        try:
            original = Image.open(image_path).convert('RGB')
            
            # Save as temporary resaved image
            resaved_path = image_path + ".resaved.jpg"
            original.save(resaved_path, 'JPEG', quality=quality)
            resaved = Image.open(resaved_path)

            # Calculate difference
            ela_image = ImageChops.difference(original, resaved)
            extrema = ela_image.getextrema()
            max_diff = max([ex[1] for ex in extrema])
            
            # Scale for better visualization
            scale = 255.0 / max_diff if max_diff > 0 else 1
            ela_image = ImageEnhance.Brightness(ela_image).enhance(scale)
            
            # Generate Heatmap for UI
            # ----------------------
            np_ela = np.array(ela_image)
            # Create a JET heatmap using OpenCV
            gray_ela = cv2.cvtColor(np_ela, cv2.COLOR_RGB2GRAY)
            heatmap = cv2.applyColorMap(gray_ela, cv2.COLORMAP_JET)
            
            # Blend with original for context
            original_np = np.array(original)
            original_cv = cv2.cvtColor(original_np, cv2.COLOR_RGB2BGR)
            # Resize original to match heatmap if needed (should match already)
            blended = cv2.addWeighted(original_cv, 0.4, heatmap, 0.6, 0)
            
            # Save heatmap in static folder
            filename = os.path.basename(image_path) + "_heatmap.jpg"
            static_dir = os.path.join(os.getcwd(), "static")
            if not os.path.exists(static_dir): os.makedirs(static_dir)
            heatmap_save_path = os.path.join(static_dir, filename)
            cv2.imwrite(heatmap_save_path, blended)
            
            # Calculate Score
            p99 = np.percentile(gray_ela, 99.5)
            mean_score = np.mean(gray_ela)
            score = (p99 * 0.7) + (mean_score * 0.3)
            
            if is_compressed:
                score = max(0, score - 15.0)
            
            # Cleanup resaved
            if os.path.exists(resaved_path):
                os.remove(resaved_path)
                
            return float(score), f"/static/{filename}"
        except Exception as e:
            print(f"Error in ELA: {e}")
            return 0.0, ""

    def perform_noise_analysis(self, image_path: str) -> float:
        """
        Detects anomalies in the image noise floor.
        Added objects from external sources often have mismatched noise profiles.
        """
        try:
            img = cv2.imread(image_path)
            if img is None: return 0.0
            
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float64)
            h, w = gray.shape
            block_size = 16
            
            variances = []
            for y in range(0, h - block_size, block_size):
                for x in range(0, w - block_size, block_size):
                    block = gray[y:y+block_size, x:x+block_size]
                    variances.append(np.var(block))
            
            if not variances: return 0.0
            
            vars_np = np.array(variances)
            mean_v = np.mean(vars_np)
            std_v = np.std(vars_np)
            
            # Count blocks that are extreme outliers (> 4 sigma)
            # This indicates 'Splicing' or local retouching
            outliers = np.sum(vars_np > (mean_v + 4 * std_v))
            
            # Normalized score based on outlier density
            score = (outliers / len(variances)) * 1000
            return float(score)
        except Exception as e:
            print(f"Error in Noise Analysis: {e}")
            return 0.0

    def analyze_luminance_gradient(self, image_path: str) -> bool:
        """
        Detects abnormal lighting changes on text areas.
        This is a simplified implementation looking for global inconsistencies.
        Returns True if suspicious.
        """
        try:
            img = cv2.imread(image_path)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Calculate gradient magnitude
            sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=5)
            sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=5)
            magnitude = np.sqrt(sobelx**2 + sobely**2)
            
            mean_mag = np.mean(magnitude)
            std_mag = np.std(magnitude)
            
            # Heuristic: High variance in gradients on a document might indicate patching
            # This is a very rough heuristic for the MVP.
            if std_mag > 50: # Threshold would need calibration
                return True
            return False
        except Exception as e:
            print(f"Error in Luminance Analysis: {e}")
            return False

    def detect_clones(self, image_path: str) -> int:
        """
        Detects Copy-Move forgery by comparing hashes of small image blocks.
        """
        from collections import defaultdict
        block_size = 32
        step = 16 # Larger step for speed in production
        
        try:
            img = cv2.imread(image_path)
            if img is None: return 0
            
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            gray = cv2.GaussianBlur(gray, (3, 3), 0)
            
            h, w = gray.shape
            hashes = defaultdict(list)
            
            for y in range(0, h - block_size, step):
                for x in range(0, w - block_size, step):
                    block = gray[y:y+block_size, x:x+block_size]
                    
                    # IGNORE FLAT AREAS (White background, solid colors)
                    # This prevents false positives on page margins/headers
                    if np.std(block) < 15:
                        continue
                        
                    avg = block.mean()
                    bool_hash = tuple((block > avg).flatten())
                    hashes[bool_hash].append((x, y))
                    
            match_count = 0
            for locs in hashes.values():
                if len(locs) > 1:
                    # Check spatial distance
                    for i in range(len(locs)):
                        for j in range(i + 1, len(locs)):
                            dist = ((locs[i][0] - locs[j][0])**2 + (locs[i][1] - locs[j][1])**2)**0.5
                            if dist > block_size * 3:
                                match_count += 1
                                break # Stop at first match for this hash to avoid combinatorial explosion
            
            return match_count
        except Exception as e:
            print(f"Error in Clone Detection: {e}")
            return 0

    def analyze(self, image_path: str, context: dict = None) -> dict:
        ela_score, heatmap_path = self.perform_ela(image_path, context=context)
        luminance_suspicious = self.analyze_luminance_gradient(image_path)
        noise_score = self.perform_noise_analysis(image_path)
        
        results = {
            "ela_score": ela_score,
            "heatmap_path": heatmap_path,
            "luminance_anomaly": luminance_suspicious,
            "clones_detected": self.detect_clones(image_path),
            "noise_score": noise_score
        }
        return results
