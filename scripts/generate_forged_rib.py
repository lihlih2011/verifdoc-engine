from PIL import Image, ImageDraw, ImageFilter
import os
import numpy as np

def generate_forged_rib(output_path):
    # 1. Background RIB (Clean)
    bg = Image.new('RGB', (600, 300), color=(255, 255, 255))
    d = ImageDraw.Draw(bg)
    d.text((20, 20), "RELEVÉ D'IDENTITÉ BANCAIRE", fill=(0,0,0))
    d.text((20, 50), "Titulaire : ALEXANDRE MARTIN", fill=(0,0,0))
    
    # 2. Spliced IBAN (from a noisy source)
    iban_box = Image.new('RGB', (500, 40), color=(250, 250, 250))
    idraw = ImageDraw.Draw(iban_box)
    idraw.text((10, 10), "IBAN : FR76 3000 1007 9901 2345 6789 012", fill=(0,0,128))
    
    # Add heavy noise to the IBAN box (Splicing signature)
    np_iban = np.array(iban_box)
    noise = np.random.normal(0, 40, np_iban.shape).astype(np.int16)
    np_iban = np.clip(np_iban.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    iban_noisy = Image.fromarray(np_iban)
    
    # 3. Paste onto BG
    bg.paste(iban_noisy, (20, 150))
    
    bg.save(output_path, quality=90)
    print(f"[v] Forged RIB generated at {output_path}")

if __name__ == "__main__":
    path = "test_bank/faked/banking/forged_rib_audit.jpg"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    generate_forged_rib(path)
