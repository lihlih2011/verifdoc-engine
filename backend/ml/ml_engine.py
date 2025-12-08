import os
import json
import logging
from typing import Any, Dict, Optional, Tuple
from PIL import Image
import numpy as np

# Import loaders
from backend.ml.loaders.base_loader import BaseModelLoader
from backend.ml.loaders.torch_loader import TorchModelLoader
from backend.ml.loaders.keras_loader import KerasModelLoader

# Import processors
from backend.ml.processors.preprocess import preprocess_image
from backend.ml.processors.postprocess import postprocess_output

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MLEngine:
    """
    Central ML Engine to manage model loading, preprocessing, inference, and post-processing.
    """
    def __init__(self, model_registry_path: str = "backend/ml/model_registry.json", base_model_dir: str = "backend"):
        self.model_registry_path = model_registry_path
        self.base_model_dir = base_model_dir
        self.model_configs: Dict[str, Any] = self._load_model_registry()
        self.loaded_models: Dict[str, Any] = {}
        self.loaders: Dict[str, BaseModelLoader] = {
            "torch": TorchModelLoader(base_path=self.base_model_dir),
            "keras": KerasModelLoader(base_path=self.base_model_dir),
            # Add other loaders here (e.g., "onnx": ONNXModelLoader(base_path=self.base_model_dir))
        }
        logger.info(f"MLEngine initialized with registry: {model_registry_path}")

    def _load_model_registry(self) -> Dict[str, Any]:
        """Loads the model registry JSON file."""
        if not os.path.exists(self.model_registry_path):
            logger.error(f"Model registry file not found: {self.model_registry_path}")
            return {}
        with open(self.model_registry_path, 'r') as f:
            return json.load(f)

    def load_model(self, model_name: str) -> Any:
        """
        Loads a model by name, caching it if not already loaded.
        """
        if model_name in self.loaded_models:
            logger.debug(f"Model '{model_name}' already loaded from cache.")
            return self.loaded_models[model_name]

        config = self.model_configs.get(model_name)
        if not config:
            logger.error(f"Model '{model_name}' not found in registry.")
            raise ValueError(f"Model '{model_name}' not found in registry.")

        model_type = config.get("type")
        model_path = config.get("path")

        loader = self.loaders.get(model_type)
        if not loader:
            logger.error(f"No loader found for model type '{model_type}'.")
            raise ValueError(f"No loader found for model type '{model_type}'.")

        logger.info(f"Loading model '{model_name}' (type: {model_type}, path: {model_path})...")
        model = loader.load_model(model_path)
        self.loaded_models[model_name] = model
        logger.info(f"Model '{model_name}' loaded and cached.")
        return model

    def run_inference(self, model_name: str, image: Image.Image, preprocess_params: Optional[Dict[str, Any]] = None, postprocess_params: Optional[Dict[str, Any]] = None) -> Any:
        """
        Runs inference on an image using the specified model.

        Args:
            model_name (str): The name of the model to use.
            image (PIL.Image.Image): The input image.
            preprocess_params (Optional[Dict[str, Any]]): Custom preprocessing parameters.
            postprocess_params (Optional[Dict[str, Any]]): Custom post-processing parameters.

        Returns:
            Any: The post-processed output from the model.
        """
        model = self.load_model(model_name)
        config = self.model_configs.get(model_name)

        if not config:
            raise ValueError(f"Configuration for model '{model_name}' not found.")

        # Determine preprocessing parameters
        target_size = config.get("input_size", (224, 224)) # Default to 224x224
        # Default normalization for ImageNet-trained models (common)
        default_normalize_params = {
            'mean': [0.485, 0.456, 0.406],
            'std': [0.229, 0.224, 0.225],
            'scale': 255.0
        }
        final_preprocess_params = {**default_normalize_params, **(preprocess_params or {})}

        logger.debug(f"Preprocessing image for model '{model_name}' with target_size={target_size} and params={final_preprocess_params}")
        preprocessed_input = preprocess_image(image, target_size, final_preprocess_params)

        # Adjust input shape for PyTorch (NCHW) vs Keras (NHWC) if necessary
        model_type = config.get("type")
        if model_type == "torch":
            # PyTorch expects (Batch, Channels, Height, Width)
            # If preprocessed_input is (H, W, C), convert to (C, H, W) and add batch dim
            if preprocessed_input.ndim == 3 and preprocessed_input.shape[2] == 3: # (H, W, C)
                preprocessed_input = np.transpose(preprocessed_input, (2, 0, 1)) # (C, H, W)
            preprocessed_input = np.expand_dims(preprocessed_input, axis=0) # Add batch dimension (1, C, H, W)
            # Convert to torch tensor
            import torch
            input_tensor = torch.from_numpy(preprocessed_input).to(model.device if hasattr(model, 'device') else 'cpu')
        elif model_type == "keras":
            # Keras expects (Batch, Height, Width, Channels)
            preprocessed_input = np.expand_dims(preprocessed_input, axis=0) # Add batch dimension (1, H, W, C)
            input_tensor = preprocessed_input # Keras predict can often take numpy directly
        else:
            input_tensor = preprocessed_input # Fallback

        logger.debug(f"Running inference for model '{model_name}' with input shape: {input_tensor.shape}")
        
        # Run inference
        raw_output = None
        if model_type == "torch":
            import torch
            with torch.no_grad():
                model.eval()
                raw_output = model(input_tensor).cpu().numpy()
        elif model_type == "keras":
            raw_output = model.predict(input_tensor)
        else:
            logger.warning(f"Inference for model type '{model_type}' not explicitly handled. Returning dummy output.")
            raw_output = np.random.rand(1, 2) # Dummy output

        # Post-process output
        output_type = config.get("output_type", "classification")
        logger.debug(f"Post-processing output for model '{model_name}' with output_type={output_type}")
        processed_output = postprocess_output(raw_output, output_type, postprocess_params)

        logger.info(f"Inference for model '{model_name}' completed.")
        return processed_output

# Example usage (can be removed or adapted for actual API integration)
if __name__ == "__main__":
    # Create dummy model files for testing
    os.makedirs("backend/ml_models", exist_ok=True)
    with open("backend/ml_models/efficientnet.h5", "w") as f: f.write("dummy keras model")
    with open("backend/ml_models/unet.pth", "w") as f: f.write("dummy torch model")
    with open("backend/ml_models/vit.pth", "w") as f: f.write("dummy torch model")
    with open("backend/ml_models/siamese.pth", "w") as f: f.write("dummy torch model")
    with open("backend/ml_models/gan_fp.pth", "w") as f: f.write("dummy torch model")

    ml_engine = MLEngine()

    # Create a dummy image
    dummy_image = Image.new('RGB', (500, 500), color = 'red')

    try:
        # Test Keras model inference
        efficientnet_output = ml_engine.run_inference("efficientnet", dummy_image)
        print(f"EfficientNet Output: {efficientnet_output}")

        # Test PyTorch classification model inference
        vit_output = ml_engine.run_inference("vit", dummy_image)
        print(f"ViT Output: {vit_output}")

        # Test PyTorch segmentation model inference
        unet_output = ml_engine.run_inference("unet", dummy_image, postprocess_params={"threshold": 0.7})
        print(f"UNet Output (mask shape): {unet_output.shape}, unique values: {np.unique(unet_output)}")

    except Exception as e:
        print(f"An error occurred during example usage: {e}")

    # Clean up dummy model files
    os.remove("backend/ml_models/efficientnet.h5")
    os.remove("backend/ml_models/unet.pth")
    os.remove("backend/ml_models/vit.pth")
    os.remove("backend/ml_models/siamese.pth")
    os.remove("backend/ml_models/gan_fp.pth")
    os.rmdir("backend/ml_models")