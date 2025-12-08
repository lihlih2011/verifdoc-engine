import numpy as np
from PIL import Image
from typing import Tuple, Dict, Any

def preprocess_image(image: Image.Image, target_size: Tuple[int, int], normalize_params: Dict[str, Any]) -> np.ndarray:
    """
    Preprocesses a PIL Image for model inference.

    Args:
        image (PIL.Image.Image): The input image.
        target_size (Tuple[int, int]): The (width, height) to resize the image to.
        normalize_params (Dict[str, Any]): Dictionary containing normalization parameters.
            Expected keys: 'mean' (list of floats), 'std' (list of floats), 'scale' (float, e.g., 255.0).

    Returns:
        np.ndarray: The preprocessed image as a NumPy array, ready for model input.
                    Shape will be (C, H, W) for PyTorch or (H, W, C) for Keras/TensorFlow.
    """
    # Convert to RGB if not already
    if image.mode != 'RGB':
        image = image.convert('RGB')

    # Resize image
    image = image.resize(target_size, Image.Resampling.LANCZOS)

    # Convert PIL Image to NumPy array
    img_array = np.array(image, dtype=np.float32)

    # Normalize pixel values
    scale = normalize_params.get('scale', 255.0)
    mean = np.array(normalize_params.get('mean', [0.0, 0.0, 0.0]), dtype=np.float32)
    std = np.array(normalize_params.get('std', [1.0, 1.0, 1.0]), dtype=np.float32)

    img_array = (img_array / scale - mean) / std

    # Transpose for PyTorch (C, H, W) if needed, or keep (H, W, C) for Keras
    # This decision should ideally be made by the ml_engine based on model type
    # For now, let's assume (H, W, C) and let the engine handle transposition if necessary.
    return img_array