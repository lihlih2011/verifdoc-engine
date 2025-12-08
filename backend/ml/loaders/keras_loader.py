import os
from typing import Any
from backend.ml.loaders.base_loader import BaseModelLoader
import logging
import numpy as np # Import numpy for dummy model output

logger = logging.getLogger(__name__)

try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model as keras_load_model
except ImportError:
    tf = None
    keras_load_model = None
    logger.warning("TensorFlow/Keras not installed. Keras models will use dummy loaders.")

class KerasModelLoader(BaseModelLoader):
    """
    Loads Keras/TensorFlow models.
    """
    def load_model(self, model_path: str) -> Any:
        full_path = self._resolve_path(model_path)
        if not os.path.exists(full_path):
            logger.warning(f"Keras model file not found: {full_path}. Returning placeholder.")
            class DummyKerasModel:
                def predict(self, x):
                    logger.debug("Dummy Keras model predict called.")
                    # Simulate a binary classification output
                    return np.array([[0.5]])
            return DummyKerasModel()

        if tf is None or keras_load_model is None:
            logger.error("TensorFlow/Keras is not installed, cannot load real Keras model. Returning placeholder.")
            class DummyKerasModel:
                def predict(self, x):
                    logger.debug("Dummy Keras model predict called (TF not installed).")
                    return np.array([[0.5]])
            return DummyKerasModel()

        logger.info(f"Loading Keras model from: {full_path}")
        try:
            model = keras_load_model(full_path)
            logger.info(f"Keras model '{model_path}' loaded successfully.")
            return model
        except Exception as e:
            logger.error(f"Error loading Keras model {full_path}: {e}. Returning placeholder.")
            class DummyKerasModel:
                def predict(self, x):
                    logger.debug("Dummy Keras model predict called (error during load).")
                    return np.array([[0.5]])
            return DummyKerasModel()