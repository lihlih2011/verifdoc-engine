import numpy as np
from typing import Any, Dict

def softmax(x: np.ndarray) -> np.ndarray:
    """Applies softmax to a NumPy array."""
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum(axis=-1, keepdims=True)

def postprocess_output(model_output: Any, output_type: str, params: Dict[str, Any] = None) -> Any:
    """
    Post-processes raw model output based on the specified output type.

    Args:
        model_output (Any): The raw output from the ML model.
        output_type (str): Type of output ('classification', 'segmentation', 'embedding', etc.).
        params (Dict[str, Any], optional): Additional parameters for post-processing.
            For 'classification': None.
            For 'segmentation': 'threshold' (float).

    Returns:
        Any: The post-processed result.
    """
    if params is None:
        params = {}

    if output_type == "classification":
        # Assuming model_output is logits or probabilities
        if isinstance(model_output, list): # Keras predict often returns list of arrays
            model_output = np.array(model_output[0])
        elif not isinstance(model_output, np.ndarray):
            model_output = np.array(model_output)

        if model_output.ndim == 1 or model_output.shape[-1] > 1: # Likely logits or multi-class probabilities
            return softmax(model_output)
        else: # Single output neuron (e.g., sigmoid output)
            return model_output

    elif output_type == "segmentation":
        # Assuming model_output is a probability map (e.g., 0-1)
        if isinstance(model_output, list):
            model_output = np.array(model_output[0])
        elif not isinstance(model_output, np.ndarray):
            model_output = np.array(model_output)

        threshold = params.get("threshold", 0.5)
        binary_mask = (model_output > threshold).astype(np.uint8)
        return binary_mask

    elif output_type == "embedding":
        # Embeddings usually don't need much post-processing, maybe normalization
        if isinstance(model_output, list):
            model_output = np.array(model_output[0])
        elif not isinstance(model_output, np.ndarray):
            model_output = np.array(model_output)
        return model_output / np.linalg.norm(model_output, axis=-1, keepdims=True)

    else:
        print(f"Warning: Unknown output type '{output_type}'. Returning raw output.")
        return model_output