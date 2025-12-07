import os
import uuid
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from backend.app.config import settings

class HeatmapGenerator:
    def __init__(self):
        self.heatmap_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "heatmaps")
        os.makedirs(self.heatmap_dir, exist_ok=True)
        print(f"Heatmap directory: {self.heatmap_dir}")

    def _create_tinted_image(self, original_image: Image.Image, tint_color: tuple = (255, 0, 0, 100)) -> Image.Image:
        """
        Creates a tinted version of the original image with a semi-transparent overlay.
        """
        if original_image.mode != 'RGBA':
            original_image = original_image.convert('RGBA')

        # Create a transparent overlay
        overlay = Image.new('RGBA', original_image.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Simulate an "anomaly" region for the placeholder
        width, height = original_image.size
        
        # Draw a random rectangle for the "anomaly"
        x1 = np.random.randint(0, width // 2)
        y1 = np.random.randint(0, height // 2)
        x2 = np.random.randint(width // 2, width)
        y2 = np.random.randint(height // 2, height)
        
        draw.rectangle([x1, y1, x2, y2], fill=tint_color)
        
        # Blend the overlay with the original image
        return Image.alpha_composite(original_image, overlay)

    def _save_heatmap(self, image: Image.Image, prefix: str) -> str:
        """
        Saves the generated heatmap image and returns its relative URL path.
        """
        unique_id = uuid.uuid4().hex
        filename = f"{prefix}-{unique_id}.png"
        file_path = os.path.join(self.heatmap_dir, filename)
        image.save(file_path, format="PNG")
        
        # Return the URL path relative to the FastAPI static files mount
        return f"/heatmaps/{filename}"

    def generate_ela_heatmap(self, image: Image.Image) -> str:
        print("Generating ELA heatmap placeholder...")
        tinted_image = self._create_tinted_image(image, tint_color=(255, 165, 0, 120)) # Orange tint
        return self._save_heatmap(tinted_image, "ela")

    def generate_gan_heatmap(self, image: Image.Image) -> str:
        print("Generating GAN heatmap placeholder...")
        tinted_image = self._create_tinted_image(image, tint_color=(0, 0, 255, 120)) # Blue tint
        return self._save_heatmap(tinted_image, "gan")

    def generate_copymove_heatmap(self, image: Image.Image) -> str:
        print("Generating Copy-Move heatmap placeholder...")
        tinted_image = self._create_tinted_image(image, tint_color=(255, 0, 0, 120)) # Red tint
        return self._save_heatmap(tinted_image, "copymove")

    def generate_diffusion_heatmap(self, image: Image.Image) -> str:
        print("Generating Diffusion Forensics heatmap placeholder...")
        tinted_image = self._create_tinted_image(image, tint_color=(0, 255, 0, 120)) # Green tint
        return self._save_heatmap(tinted_image, "diffusion")