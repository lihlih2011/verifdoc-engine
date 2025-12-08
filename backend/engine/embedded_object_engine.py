import io
import zlib
from typing import List, Dict, Any, Optional
from PyPDF2 import PdfReader, generic
from PyPDF2.errors import PdfReadError

# Define the structure for a scanned embedded object
class EmbeddedObjectScanResult:
    def __init__(self, object_id: str, obj_type: str, subtype: Optional[str] = None,
                 length: Optional[int] = None, compression: Optional[str] = None,
                 suspicious: bool = False, reason: Optional[str] = None,
                 preview: Optional[str] = None, entropy: Optional[float] = None):
        self.object_id = object_id
        self.type = obj_type
        self.subtype = subtype
        self.length = length
        self.compression = compression
        self.suspicious = suspicious
        self.reason = reason
        self.preview = preview
        self.entropy = entropy

    def to_dict(self):
        return {
            "objectId": self.object_id,
            "type": self.type,
            "subtype": self.subtype,
            "length": self.length,
            "compression": self.compression,
            "suspicious": self.suspicious,
            "reason": self.reason,
            "preview": self.preview,
            "entropy": self.entropy,
        }

class EmbeddedObjectEngine:
    def __init__(self):
        print("Initializing EmbeddedObjectEngine...")

    def _calculate_entropy(self, data: bytes) -> float:
        """Calculate the Shannon entropy of a byte string."""
        if not data:
            return 0.0
        
        frequency = [0] * 256
        for byte in data:
            frequency[byte] += 1
        
        entropy = 0.0
        data_len = len(data)
        for count in frequency:
            if count > 0:
                probability = count / data_len
                entropy -= probability * (probability).log2()
        return entropy

    def analyze_pdf_objects(self, pdf_bytes: bytes) -> List[Dict[str, Any]]:
        results: List[EmbeddedObjectScanResult] = []
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            
            # Iterate through all objects in the PDF
            for obj_id in reader.get_object_references():
                try:
                    pdf_object = reader.get_object(obj_id)
                    obj_type = "Unknown"
                    subtype = None
                    length = None
                    compression = None
                    suspicious = False
                    reason = None
                    preview = None
                    entropy = None

                    if isinstance(pdf_object, generic.DictionaryObject):
                        obj_type = "Dictionary"
                        if "/Type" in pdf_object:
                            obj_type = pdf_object["/Type"]
                        if "/Subtype" in pdf_object:
                            subtype = pdf_object["/Subtype"]
                        
                        # Detect suspicious dictionary entries
                        if "/OpenAction" in pdf_object or "/A" in pdf_object and "/S" in pdf_object["/A"] and pdf_object["/A"]["/S"] == "/JavaScript":
                            suspicious = True
                            reason = "Contains JavaScript action (OpenAction or /JS)"
                        if subtype == "/EmbeddedFile":
                            suspicious = True
                            reason = "Embedded file detected"
                        if "/Annots" in pdf_object:
                            annotations = pdf_object["/Annots"]
                            if isinstance(annotations, generic.ArrayObject):
                                for annot_ref in annotations:
                                    annot_obj = reader.get_object(annot_ref)
                                    if "/F" in annot_obj and (annot_obj["/F"] & 2): # Check for Hidden flag (bit 2)
                                        suspicious = True
                                        reason = (reason or "") + "Hidden annotation detected; "
                        if "/XObject" in pdf_object:
                            xobjects = pdf_object["/XObject"]
                            if isinstance(xobjects, generic.DictionaryObject) and len(xobjects) > 5: # Arbitrary threshold for multiple XObjects
                                suspicious = True
                                reason = (reason or "") + "Multiple XObjects detected (potential layers/overlays); "
                        if "/ICCBased" in pdf_object:
                            suspicious = True
                            reason = (reason or "") + "ICC Profile detected; "

                    elif isinstance(pdf_object, generic.ArrayObject):
                        obj_type = "Array"
                    elif isinstance(pdf_object, generic.NameObject):
                        obj_type = "Name"
                    elif isinstance(pdf_object, generic.NumberObject):
                        obj_type = "Number"
                    elif isinstance(pdf_object, generic.BooleanObject):
                        obj_type = "Boolean"
                    elif isinstance(pdf_object, generic.TextStringObject):
                        obj_type = "TextString"
                    elif isinstance(pdf_object, generic.ByteStringObject):
                        obj_type = "ByteString"
                    elif isinstance(pdf_object, generic.StreamObject):
                        obj_type = "Stream"
                        length = pdf_object.get_data_length()
                        
                        filters = pdf_object.get("/Filter")
                        if filters:
                            if isinstance(filters, generic.ArrayObject):
                                compression = ", ".join([str(f) for f in filters])
                            else:
                                compression = str(filters)
                        
                        stream_data = None
                        try:
                            stream_data = pdf_object.get_data()
                            preview = stream_data[:100].hex() + "..." if stream_data else None
                            entropy = self._calculate_entropy(stream_data)
                        except (zlib.error, ValueError) as e:
                            suspicious = True
                            reason = (reason or "") + f"Corrupted or unreadable stream data: {e}; "
                            preview = "Corrupted stream data"
                        except Exception as e:
                            suspicious = True
                            reason = (reason or "") + f"Error reading stream data: {e}; "
                            preview = "Error reading stream data"

                        # Detect suspicious stream characteristics
                        if compression and "Crypt" in compression:
                            suspicious = True
                            reason = (reason or "") + "Encrypted stream detected; "
                        if entropy is not None and entropy > 7.5: # High entropy (e.g., >7.5 for 8-bit data) can indicate encryption or random data
                            suspicious = True
                            reason = (reason or "") + f"High entropy stream ({entropy:.2f}); "
                        if length is not None and length > 1024 * 1024 * 5: # Large stream (e.g., >5MB)
                            suspicious = True
                            reason = (reason or "") + "Very large stream; "

                    results.append(EmbeddedObjectScanResult(
                        object_id=f"{obj_id.id} {obj_id.generation}",
                        obj_type=str(obj_type),
                        subtype=str(subtype) if subtype else None,
                        length=length,
                        compression=compression,
                        suspicious=suspicious,
                        reason=reason.strip() if reason else None,
                        preview=preview,
                        entropy=entropy
                    ))
                except Exception as e:
                    results.append(EmbeddedObjectScanResult(
                        object_id=f"{obj_id.id} {obj_id.generation}",
                        obj_type="Error",
                        suspicious=True,
                        reason=f"Error processing object: {e}",
                        preview="N/A"
                    ))

        except PdfReadError as e:
            results.append(EmbeddedObjectScanResult(
                object_id="N/A",
                obj_type="PDF Error",
                suspicious=True,
                reason=f"Failed to read PDF: {e}",
                preview="N/A"
            ))
        except Exception as e:
            results.append(EmbeddedObjectScanResult(
                object_id="N/A",
                obj_type="General Error",
                suspicious=True,
                reason=f"An unexpected error occurred: {e}",
                preview="N/A"
            ))

        return [r.to_dict() for r in results]