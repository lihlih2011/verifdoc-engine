import numpy as np
from PIL import Image
from typing import Tuple

def preprocess_image(image: Image.Image, target_size: Tuple[int, int]) -> np.ndarray:
    """
    Preprocesses a PIL Image for model inference, resizing and converting to NumPy array.
    Does NOT apply mean/std normalization here. Returns array in [0, 255] range.

    Args:
        image (PIL.Image.Image): The input image.
        target_size (Tuple[int, int]): The (width, height) to resize the image to.

    Returns:
        np.ndarray: The preprocessed image as a NumPy array, ready for model input.
                    Shape will be (H, W, C) with pixel values in [0, 255].
    """
    if image.mode != 'RGB':
        image = image.convert('RGB')

    image = image.resize(target_size, Image.Resampling.LANCZOS)
    img_array = np.array(image, dtype=np.float32) # Keep in [0, 255] range
    return img_array