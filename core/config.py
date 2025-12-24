# core/config.py

# ADMIN CONFIGURATION
# This file is the single source of truth for the B2B Client Context.
# It should be managed by the administrator/DevOps.

CLIENT_CONFIG = {
    "CLIENT_ID": "VD-001",
    "CLIENT_NAME": "VerifDoc Demo Account",
    
    # SECTOR CONTEXT
    # Options: "GENERIC", "RH", "IMMOBILIER", "BANQUE", "JURIDIQUE"
    "SECTOR": "RH", 
    
    # ENVIRONMENT MODE
    # "TEST": Allows sector switching in UI for demos/testing.
    # "PRODUCTION": Locks the UI to the defined SECTOR. Hides selector.
    "ENV": "TEST" 
}
