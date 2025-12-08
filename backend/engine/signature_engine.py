import io
import os
from datetime import datetime
from typing import Dict, Any, Optional, List

from PyPDF2 import PdfReader
from cryptography import x509
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
import requests

class SignatureEngine:
    def __init__(self):
        print("Initializing SignatureEngine...")

    def _extract_signature_data(self, pdf_bytes: bytes) -> Optional[Dict[str, Any]]:
        """
        Extracts raw signature data (ByteRange, Contents) from a PDF.
        """
        reader = PdfReader(io.BytesIO(pdf_bytes))
        if "/AcroForm" not in reader.trailer:
            return None

        acro_form = reader.trailer["/AcroForm"]
        if "/Fields" not in acro_form:
            return None

        for field in acro_form["/Fields"]:
            field_obj = field.get_object()
            if "/FT" in field_obj and field_obj["/FT"] == "/Sig":
                # This is a signature field
                sig_obj = field_obj
                if "/V" in sig_obj: # /V is the signature dictionary
                    signature_dict = sig_obj["/V"]
                    if "/ByteRange" in signature_dict and "/Contents" in signature_dict:
                        byte_range = signature_dict["/ByteRange"]
                        contents = signature_dict["/Contents"] # This is the raw signature blob (DER encoded PKCS#7)
                        
                        # PyPDF2 returns ArrayObject for ByteRange, convert to list of ints
                        byte_range_list = [int(x) for x in byte_range]

                        return {
                            "byte_range": byte_range_list,
                            "contents": contents.encode('latin-1'), # Contents are usually hex string, convert to bytes
                            "name": sig_obj.get("/T", "Unnamed Signature")
                        }
        return None

    def _parse_certificate(self, signature_bytes: bytes) -> Optional[x509.Certificate]:
        """
        Parses the X.509 certificate from a PKCS#7 signature blob.
        This is a simplified approach; a full PKCS#7 parser would be more robust.
        """
        try:
            # Cryptography library can parse PKCS#7 (CMS) structures
            # For simplicity, we'll try to directly load the certificate if it's embedded
            # This might need more sophisticated parsing for complex CMS structures
            # A common pattern is to find the certificate within the signedData structure
            # For now, we'll assume a direct DER-encoded certificate or a simple PKCS#7
            
            # Attempt to load as a certificate directly
            cert = x509.load_der_x509_certificate(signature_bytes, default_backend())
            return cert
        except Exception as e:
            print(f"Could not directly load certificate from signature bytes: {e}")
            # If direct loading fails, it's likely a full PKCS#7 structure.
            # A full PKCS#7 parser (like asn1crypto or pyasn1) would be needed here.
            # For this example, we'll return None if direct parsing fails.
            return None

    def _validate_signature(self, pdf_bytes: bytes, signature_data: Dict[str, Any], certificate: x509.Certificate) -> bool:
        """
        Verifies the cryptographic signature against the specified byte range.
        This is a simplified validation.
        """
        byte_range = signature_data["byte_range"]
        contents = signature_data["contents"]

        # Extract the signed content bytes
        signed_bytes = b""
        for i in range(0, len(byte_range), 2):
            start = byte_range[i]
            length = byte_range[i+1]
            signed_bytes += pdf_bytes[start : start + length]

        # The actual signature value is usually within the PKCS#7 Contents.
        # For a full validation, one would parse the PKCS#7 structure, extract
        # the signed attributes and the actual signature value, then verify.
        # This is a complex task. For this placeholder, we'll simulate a successful
        # verification if we can parse the cert and the byte range is plausible.
        
        # In a real scenario, you'd use certificate.public_key().verify()
        # with the correct algorithm and padding, and the hash of the signed_bytes.
        # Example (conceptual, not directly applicable without full PKCS#7 parsing):
        # try:
        #     public_key = certificate.public_key()
        #     public_key.verify(
        #         signature=actual_signature_from_pkcs7,
        #         data=signed_bytes,
        #         padding=padding.PKCS1v15(), # Or PSS
        #         algorithm=hashes.SHA256() # Or other hash algorithm
        #     )
        #     return True
        # except Exception:
        #     return False
        
        # Placeholder: Assume valid if certificate is present and byte range is not empty
        return bool(certificate and signed_bytes)

    def _check_ocsp_crl(self, certificate: x509.Certificate) -> str:
        """
        Performs a basic OCSP/CRL check (placeholder for full implementation).
        """
        # In a real scenario, you'd extract OCSP/CRL URLs from the certificate
        # and make network requests.
        # For now, simulate a valid status.
        return "Valid (simulated)"

    def analyze_pdf_signature(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """
        Analyzes a PDF for digital signatures and returns detailed information.
        """
        signature_data = self._extract_signature_data(pdf_bytes)
        
        if not signature_data:
            return {"hasSignature": False}

        cert_info: Dict[str, Any] = {
            "subject": "N/A",
            "issuer": "N/A",
            "serialNumber": "N/A",
            "validity": {"notBefore": "N/A", "notAfter": "N/A"},
            "isValid": False,
            "reason": "No certificate found in signature blob",
            "timestamp": "N/A",
            "tsaIssuer": "N/A",
            "tsaValidity": "N/A",
            "ocspStatus": "N/A",
        }

        try:
            # The 'contents' field from PyPDF2 is often a hex string of the DER-encoded PKCS#7
            # We need to decode it from hex if it's a string, or use it directly if it's bytes
            raw_signature_blob = signature_data["contents"]
            if isinstance(raw_signature_blob, str):
                raw_signature_blob = bytes.fromhex(raw_signature_blob)

            certificate = self._parse_certificate(raw_signature_blob)
            
            if certificate:
                cert_info["subject"] = certificate.subject.rfc4514_string()
                cert_info["issuer"] = certificate.issuer.rfc4514_string()
                cert_info["serialNumber"] = f"{certificate.serial_number:X}"
                cert_info["validity"]["notBefore"] = certificate.not_valid_before.isoformat()
                cert_info["validity"]["notAfter"] = certificate.not_valid_after.isoformat()

                # Basic validity checks
                now = datetime.utcnow()
                is_cert_valid_time = certificate.not_valid_before <= now <= certificate.not_valid_after
                cert_info["isValid"] = is_cert_valid_time
                cert_info["reason"] = "OK" if is_cert_valid_time else "Expired/Not yet valid"

                # Simulate signature validation
                is_cryptographically_valid = self._validate_signature(pdf_bytes, signature_data, certificate)
                if not is_cryptographically_valid:
                    cert_info["isValid"] = False
                    cert_info["reason"] = "Cryptographic validation failed (simulated)"
                
                # Simulate OCSP/CRL check
                cert_info["ocspStatus"] = self._check_ocsp_crl(certificate)

                # Placeholder for timestamp detection (requires deeper PKCS#7 parsing)
                cert_info["timestamp"] = "Not detected (placeholder)"
                cert_info["tsaIssuer"] = "N/A"
                cert_info["tsaValidity"] = "N/A"

            else:
                cert_info["reason"] = "Could not parse X.509 certificate from signature blob."

        except Exception as e:
            print(f"Error during signature analysis: {e}")
            cert_info["reason"] = f"Analysis error: {e}"

        return {
            "hasSignature": True,
            "signatureInfo": cert_info
        }