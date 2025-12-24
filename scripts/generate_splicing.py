from PIL import Image, ImageDraw, ImageFilter
import os

def generate_spliced_forgery(output_path):
    # 1. Create a "Background" document (Low Noise)
    bg = Image.new('RGB', (600, 800), color=(240, 240, 240))
    d = ImageDraw.Draw(bg)
    d.text((50, 50), "CONTRAT DE TRAVAIL - BACKGROUND", fill=(0,0,0))
    # Add very subtle noise to BG
    bg = bg.filter(ImageFilter.GaussianBlur(radius=0.5))
    
    # 2. Create the "Spliced Object" (High Noise)
    # This simulates a signature 'Added' from a noisy mobile photo
    obj = Image.new('RGB', (200, 100), color=(255, 255, 255))
    od = ImageDraw.Draw(obj)
    od.line([(20, 80), (180, 20)], fill=(0, 0, 128), width=5)
    
    # Add significant noise to the object
    np_obj = np.array(obj)
    noise = np.random.normal(0, 50, np_obj.shape).astype(np.int16)
    np_obj = np.clip(np_obj.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    obj_noisy = Image.fromarray(np_obj)
    
    # 3. Splice it onto the background
    bg.paste(obj_noisy, (350, 600))
    
    bg.save(output_path, quality=95)
    print(f"[v] Spliced forgery generated at {output_path}")

if __name__ == "__main__":
    import numpy as np
    path = "test_bank/faked/splicing/spliced_signature.jpg"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    generate_spliced_forgery(path)
