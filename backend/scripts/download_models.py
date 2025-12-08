import os
import requests
import json

MODEL_DIR = "backend/ml_models"
MODEL_URL = "https://huggingface.co/google/vit-base-patch16-224/resolve/main/pytorch_model.bin"
MODEL_FILENAME = "vit_forensic.bin"
MODEL_PATH = os.path.join(MODEL_DIR, MODEL_FILENAME)

def download_vit_forensic_model():
    """
    Downloads the pre-trained Vision Transformer forensic model.
    """
    os.makedirs(MODEL_DIR, exist_ok=True)
    print(f"Ensured directory exists: {MODEL_DIR}")

    if os.path.exists(MODEL_PATH):
        print(f"Model already exists at {MODEL_PATH}. Skipping download.")
        return

    print(f"Downloading model from {MODEL_URL}...")
    try:
        response = requests.get(MODEL_URL, stream=True)
        response.raise_for_status() # Raise an exception for HTTP errors

        with open(MODEL_PATH, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Model downloaded and saved to {MODEL_PATH}")
    except requests.exceptions.RequestException as e:
        print(f"Error downloading model: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    download_vit_forensic_model()