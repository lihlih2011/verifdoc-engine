import re
import hashlib
from cryptography.fernet import Fernet
import io
from datetime import datetime

class SecurityEngine:
    """
    Moteur D : Sécurité & RGPD (Trust Layer)
    Handles encryption, anonymization, and secure memory processing.
    """

    def __init__(self, encryption_key=None):
        if encryption_key:
            self.cipher_suite = Fernet(encryption_key)
        else:
            self.key = Fernet.generate_key()
            self.cipher_suite = Fernet(self.key)
            
        # PII Regex patterns (Simplified for MVP)
        self.pii_patterns = {
            "email": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
            "phone": r"\b(?:\+33|0)[1-9](?:[\s.-]*\d{2}){4}\b", # French format roughly
            "ssn": r"\b[12]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{3}\s?\d{3}\s?\d{2}\b" # French NIR
        }

    def anonymize_text(self, text: str) -> str:
        """
        Redacts PII from text content for reporting.
        """
        redacted_text = text
        for pii_type, pattern in self.pii_patterns.items():
            redacted_text = re.sub(pattern, f"[REDACTED_{pii_type.upper()}]", redacted_text)
        return redacted_text

    def encrypt_metadata(self, metadata: dict) -> bytes:
        """
        Encrypts proof metadata using AES-256 (via Fernet).
        """
        import json
        data_str = json.dumps(metadata)
        return self.cipher_suite.encrypt(data_str.encode())

    def process_in_memory(self, file_stream: bytes):
        """
        Helper to ensure we are working with BytesIO and not writing to disk if possible.
        """
        return io.BytesIO(file_stream)

    def generate_proof_certificate(self, file_content: bytes, scores: dict):
        """
        Generates a hash of the original file + timestamp.
        """
        file_hash = hashlib.sha256(file_content).hexdigest()
        timestamp = datetime.now().isoformat()
        
        certificate = {
            "file_hash": file_hash,
            "timestamp": timestamp,
            "verifdoc_version": "1.0.0",
            "integrity_proof": self.encrypt_metadata({"hash": file_hash, "scores": scores}).decode()
        }
        return certificate
