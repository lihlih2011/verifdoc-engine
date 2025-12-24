import os
import yaml
import ollama
import google.generativeai as genai
from google.api_core import exceptions

class LLMClient:
    """
    Robust LLM client with Gemini primary and Ollama fallback.
    """
    def __init__(self, config_path="config.yaml"):
        self.config = self._load_config(config_path)
        self.setup_gemini()

    def _load_config(self, path):
        if not os.path.exists(path):
            return {}
        with open(path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f).get("llm", {})

    def setup_gemini(self):
        # API Key can be in config or environment
        api_key = self.config.get("gemini", {}).get("api_key")
        if not api_key or api_key == "PASTE_YOUR_GEMINI_API_KEY_HERE":
            api_key = os.getenv("GEMINI_API_KEY")
        
        if api_key:
            genai.configure(api_key=api_key)
            self.gemini_model = genai.GenerativeModel(self.config.get("gemini", {}).get("model", "gemini-1.5-flash"))
        else:
            self.gemini_model = None

    def generate(self, prompt, context=None):
        """
        Attempts to generate content using the configured primary model, falling back to the other.
        """
        primary = self.config.get("primary", "gemini")
        
        if primary == "ollama":
            # Try Ollama first
            res = self._call_ollama(prompt)
            if res: return res
            
            # Fallback to Gemini
            print("[LLM] Ollama failed, falling back to Gemini...")
            return self._call_gemini(prompt)
            
        else:
            # Try Gemini first (Default)
            res = self._call_gemini(prompt)
            if res: return res
            
            # Fallback to Ollama
            print("[LLM] Gemini failed, falling back to Ollama...")
            return self._call_ollama(prompt)

    def _call_gemini(self, prompt):
        if not self.gemini_model:
            return None
        try:
            print("[LLM] Attempting Gemini Call...")
            response = self.gemini_model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"[LLM] Gemini Failed: {e}")
            return None

    def _call_ollama(self, prompt):
        print("[LLM] Attempting Ollama Call...")
        try:
            ollama_cfg = self.config.get("ollama", {})
            model = ollama_cfg.get("model", "phi4:latest")
            
            response = ollama.generate(
                model=model,
                prompt=prompt,
                options={"temperature": 0.7}
            )
            return response.get("response", "Error: No response from Ollama")
        except Exception as e:
            print(f"[LLM] Ollama Failed: {e}")
            return None

# Singleton helper
_client = None
def get_llm_client():
    global _client
    if _client is None:
        _client = LLMClient()
    return _client
