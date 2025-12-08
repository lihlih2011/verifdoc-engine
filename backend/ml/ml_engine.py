import os
import json
import logging
import time
from typing import Any, Dict, Optional, Tuple
from PIL import Image
import numpy as np
from fastapi import HTTPException, status

# Added imports for PyTorch and UNet
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms

# NEW IMPORTS for ViT
from transformers import ViTModel, ViTFeatureExtractor

# Import loaders
from backend.ml.loaders.base_loader import BaseModelLoader
from backend.ml.loaders.torch_loader import TorchModelLoader, UNetModel # Import UNetModel from torch_loader
from backend.ml.loaders.keras_loader import KerasModelLoader

# Import processors
from backend.ml.processors.preprocess import preprocess_image
from backend.ml.processors.postprocess import postprocess_output

# Keras specific imports
try:
    import tensorflow as tf
    from tensorflow.keras.applications.efficientnet import preprocess_input as efficientnet_preprocess_input
except ImportError:
    tf = None
    efficientnet_preprocess_input = None
    logging.warning("TensorFlow/Keras not installed. Keras-specific preprocessing will be skipped.")


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
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Model '{model_name}' not found in registry."
            )

        model_type = config.get("type")
        model_path = config.get("path")

        loader = self.loaders.get(model_type)
        if not loader:
            logger.error(f"No loader found for model type '{model_type}'.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"No loader found for model type '{model_type}'."
            )

        start_time = time.perf_counter()
        try:
            logger.info(f"Loading model '{model_name}' (type: {model_type}, path: {model_path})...")
            loaded_components = loader.load_model(model_path) # Can be model or dict for ViT
            self.loaded_models[model_name] = loaded_components
            end_time = time.perf_counter()
            logger.info(f"Model '{model_name}' loaded successfully in {end_time - start_time:.4f} seconds.")
            return loaded_components
        except Exception as e:
            logger.error(f"Failed to load model '{model_name}': {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to load model '{model_name}': {e}"
            )

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
        model_components = self.load_model(model_name) # Can be model or dict for ViT

        config = self.model_configs.get(model_name)
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Configuration for model '{model_name}' not found."
            )

        original_image_size = image.size # Store original size for segmentation mask resizing
        target_size = config.get("input_size", (224, 224))
        model_type = config.get("type")
        output_type = config.get("output_type", "classification") # Get output_type from config
        device = ai_config.DEVICE

        start_preprocess_time = time.perf_counter()
        try:
            input_for_model = None
            raw_output = None

            if model_name == "vit_forensic":
                vit_model = model_components["model"]
                feature_extractor = model_components["feature_extractor"]
                
                # Preprocess image using ViTFeatureExtractor
                inputs = feature_extractor(images=image, return_tensors="pt").to(device)
                input_for_model = inputs # Store for logging/debugging if needed
                
                with torch.no_grad():
                    vit_model.eval()
                    outputs = vit_model(**inputs)
                    # Get mean pooled embedding (last_hidden_state[:, 0] is the CLS token embedding)
                    embedding = outputs.pooler_output # This is the pooled output for classification
                    
                    # Compute anomaly score based on the norm of the embedding
                    # A higher norm might indicate a more "unusual" or "out-of-distribution" input
                    anomaly_score = torch.norm(embedding).item()
                    
                    # Normalize the score to be between 0 and 1 (heuristic)
                    # Max norm can vary, using a heuristic max of 10 for normalization
                    normalized_score = min(1.0, anomaly_score / 10.0) 
                    
                    return {"score": normalized_score} # Return directly for ViT
            
            # --- Generic preprocessing for other models ---
            preprocessed_input_np = preprocess_image(image, target_size)
            
            if model_name == "efficientnet_forensic" and tf is not None and efficientnet_preprocess_input is not None:
                logger.debug(f"Applying EfficientNet specific preprocessing for '{model_name}'.")
                input_for_model = efficientnet_preprocess_input(preprocessed_input_np)
            elif model_type == "keras":
                default_normalize_params = {
                    'mean': [0.485, 0.456, 0.406],
                    'std': [0.229, 0.224, 0.225],
                    'scale': 255.0
                }
                mean = np.array(default_normalize_params['mean'], dtype=np.float32)
                std = np.array(default_normalize_params['std'], dtype=np.float32)
                scale = default_normalize_params['scale']
                input_for_model = (preprocessed_input_np / scale - mean) / std
            elif model_type == "torch":
                default_normalize_params = {
                    'mean': [0.485, 0.456, 0.406],
                    'std': [0.229, 0.224, 0.225],
                    'scale': 255.0
                }
                mean = np.array(default_normalize_params['mean'], dtype=np.float32)
                std = np.array(default_normalize_params['std'], dtype=np.float32)
                scale = default_normalize_params['scale']
                normalized_np = (preprocessed_input_np / scale - mean) / std

                if normalized_np.ndim == 3 and normalized_np.shape[2] == 3:
                    normalized_np = np.transpose(normalized_np, (2, 0, 1))
                input_for_model = np.expand_dims(normalized_np, axis=0)
                input_for_model = torch.from_numpy(input_for_model).to(model_components.device if hasattr(model_components, 'device') else 'cpu')
            else:
                input_for_model = np.expand_dims(preprocessed_input_np, axis=0)

            end_preprocess_time = time.perf_counter()
            logger.debug(f"Preprocessing for model '{model_name}' completed in {end_preprocess_time - start_preprocess_time:.4f} seconds.")
        except Exception as e:
            logger.error(f"Preprocessing failed for model '{model_name}': {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Preprocessing failed for model '{model_name}': {e}"
            )

        if model_type == "keras" and input_for_model.ndim == 3:
            input_for_model = np.expand_dims(input_for_model, axis=0)

        start_inference_time = time.perf_counter()
        try:
            if model_type == "torch":
                with torch.no_grad():
                    model_components.eval()
                    raw_output = model_components(input_for_model) # Keep as tensor for segmentation post-processing
            elif model_type == "keras":
                raw_output = model_components.predict(input_for_model)
            else:
                logger.warning(f"Inference for model type '{model_type}' not explicitly handled. Returning dummy output.")
                raw_output = np.random.rand(1, 2)
            end_inference_time = time.perf_counter()
            logger.info(f"Inference for model '{model_name}' completed in {end_inference_time - start_inference_time:.4f} seconds.")
        except Exception as e:
            logger.error(f"Inference failed for model '{model_name}': {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Inference failed for model '{model_name}': {e}"
            )

        logger.debug(f"Post-processing output for model '{model_name}' with output_type={output_type}")
        
        # NEW: Segmentation specific post-processing
        if output_type == "segmentation" and model_type == "torch":
            # raw_output is a torch.Tensor here
            sigmoid_output = torch.sigmoid(raw_output)
            # Threshold at 0.5 to get binary mask
            binary_mask = (sigmoid_output > 0.5).float()
            
            # Resize mask to original image size
            # Interpolate expects (N, C, H, W)
            resized_mask = F.interpolate(
                binary_mask,
                size=(original_image_size[1], original_image_size[0]), # (H, W)
                mode='bilinear',
                align_corners=False
            )
            # Convert to NumPy array and remove batch/channel dimensions if they are 1
            processed_output = resized_mask.squeeze().cpu().numpy()
        else:
            # For other output types, convert raw_output to numpy if it's a tensor
            if isinstance(raw_output, torch.Tensor):
                raw_output = raw_output.cpu().numpy()
            processed_output = postprocess_output(raw_output, output_type, postprocess_params)

        logger.info(f"Full inference pipeline for model '{model_name}' completed.")
        return processed_output

# Example usage (can be removed or adapted for actual API integration)
if __name__ == "__main__":
    # Create dummy model files for testing
    os.makedirs("backend/ml_models", exist_ok=True)
    with open("backend/ml_models/efficientnet.h5", "w") as f: f.write("dummy keras model")
    with open("backend/ml_models/efficientnet_forensic.h5", "w") as f: f.write("dummy efficientnet forensic model") # Added for testing
    with open("backend/ml_models/unet.pth", "w") as f: f.write("dummy torch model")
    with open("backend/ml_models/vit.pth", "w") as f: f.write("dummy torch model")
    with open("backend/ml_models/siamese.pth", "w") as f: f.write("dummy torch model")
    with open("backend/ml_models/gan_fp.pth", "w") as f: f.write("dummy torch model")
    with open("backend/ml_models/unet_forgery.pth", "w") as f: f.write("dummy unet forgery model") # Added for testing
    with open("backend/ml_models/vit_forensic.bin", "w") as f: f.write("dummy vit forensic model") # Added for testing

    ml_engine = MLEngine()

    # Create a dummy image
    dummy_image = Image.new('RGB', (500, 500), color = 'red')

    try:
        # Test Keras model inference
        efficientnet_output = ml_engine.run_inference("efficientnet", dummy_image)
        print(f"EfficientNet Output: {efficientnet_output}")

        # Test EfficientNet Forensic model inference
        efficientnet_forensic_output = ml_engine.run_inference("efficientnet_forensic", dummy_image)
        print(f"EfficientNet Forensic Output: {efficientnet_forensic_output}")

        # Test PyTorch classification model inference
        vit_output = ml_engine.run_inference("vit", dummy_image)
        print(f"ViT Output: {vit_output}")

        # Test PyTorch segmentation model inference (UNet)
        unet_forgery_output = ml_engine.run_inference("unet_forgery", dummy_image)
        print(f"UNet Forgery Output (mask shape): {unet_forgery_output.shape}, unique values: {np.unique(unet_forgery_output)}")

        # Test ViT Forensic model inference
        vit_forensic_output = ml_engine.run_inference("vit_forensic", dummy_image)
        print(f"ViT Forensic Output: {vit_forensic_output}")

        # Test non-existent model
        try:
            ml_engine.run_inference("non_existent_model", dummy_image)
        except HTTPException as e:
            print(f"Caught expected error for non-existent model: {e.detail}")

    except Exception as e:
        print(f"An error occurred during example usage: {e}")

    finally:
        # Clean up dummy model files
        os.remove("backend/ml_models/efficientnet.h5")
        os.remove("backend/ml_models/efficientnet_forensic.h5")
        os.remove("backend/ml_models/unet.pth")
        os.remove("backend/ml_models/vit.pth")
        os.remove("backend/ml_models/siamese.pth")
        os.remove("backend/ml_models/gan_fp.pth")
        os.remove("backend/ml_models/unet_forgery.pth")
        os.remove("backend/ml_models/vit_forensic.bin")
        os.rmdir("backend/ml_models")