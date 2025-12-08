import os
from abc import ABC, abstractmethod
from typing import Any

class BaseModelLoader(ABC):
    """
    Abstract base class for loading machine learning models.
    Ensures a consistent interface for different ML frameworks.
    """
    def __init__(self, base_path: str):
        self.base_path = base_path

    @abstractmethod
    def load_model(self, model_path: str) -> Any:
        """
        Loads a model from the given path.
        """
        pass

    def _resolve_path(self, relative_path: str) -> str:
        """
        Resolves a relative model path to an absolute path.
        """
        return os.path.join(self.base_path, relative_path)