from PIL import Image
import numpy as np
import io
from backend.app.config import ai_config

class ELAEngine:
    def __init__(self, quality_step: int = ai_config.ELA_QUALITY):
        print(f"Initializing ELAEngine with quality step: {quality_step}")
        self.quality_step = quality_step

    def analyze(self, image: Image):
        """
        Analyzes an image using ELA++ to produce a refined compression anomaly heatmap.
        """
        print("Performing ELA++ analysis...")

        # 1. Convert image to RGB for consistent processing
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        original_np = np.array(image, dtype=np.float32)

        # 2. Recompress image to JPEG using quality_step
        output_buffer = io.BytesIO()
        try:
            image.save(output_buffer, format="JPEG", quality=self.quality_step)
            output_buffer.seek(0)
            recompressed_image = Image.open(output_buffer)
            if recompressed_image.mode != 'RGB':
                recompressed_image = recompressed_image.convert('RGB')
            recompressed_np = np.array(recompressed_image, dtype=np.float32)
        except Exception as e:
            print(f"Error during JPEG recompression: {e}. Returning empty results.")
            return {
                "ela_map": np.zeros(image.size[::-1], dtype=np.uint8).tolist(),
                "ela_score": 0.0,
                "raw_output": "ELA++ recompression failed"
            }

        # 3. Compute the absolute difference between original and recompressed
        diff = np.abs(original_np - recompressed_np)

        # 4. Normalize and amplify differences
        # Convert to a single channel heatmap by averaging across color channels
        ela_map_2d = np.mean(diff, axis=2) # Average R, G, B differences

        # Normalize to 0-255 range
        max_diff_val = np.max(ela_map_2d)
        if max_diff_val > 0:
            ela_map = (ela_map_2d / max_diff_val * 255).astype(np.uint8)
        else:
            ela_map = np.zeros_like(ela_map_2d, dtype=np.uint8)
        
        # 5. Generate ela_map and ela_score
        ela_score = np.mean(ela_map) / 255.0 # Global anomaly intensity (mean normalized pixel value)

        return {
            "ela_map": ela_map.tolist(), # Convert to list for JSON serialization
            "ela_score": float(ela_score),
            "raw_output": "ELA++ raw output placeholder"
        }