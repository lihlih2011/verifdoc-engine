import hashlib

def compute_sha256(data: bytes) -> str:
    """
    Computes the SHA-256 hash of the given bytes data.
    """
    sha256_hash = hashlib.sha256()
    sha256_hash.update(data)
    return sha256_hash.hexdigest()