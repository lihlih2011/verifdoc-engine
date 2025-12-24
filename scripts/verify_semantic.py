from core.forensic.semantic_analysis import SemanticEngine

def test_semantic():
    engine = SemanticEngine()
    
    # Test 1: Forgery Keyword
    text1 = "Ceci est un SPECIMEN de facture pour TEST."
    res1 = engine.analyze(text1)
    print(f"Test 1 (Keywords): {res1['flagged_keywords']}")
    assert "SPECIMEN" in res1['flagged_keywords']
    
    # Test 2: Template Placeholders
    text2 = "Cher {{NAME}}, votre adresse est [ADRESSE]."
    res2 = engine.analyze(text2)
    print(f"Test 2 (Placeholders): {res2['found_placeholders']}")
    assert "{{NAME}}" in res2['found_placeholders']
    
    # Test 3: Excessive Caps
    text3 = "MESSAGE IMPORTANT : VEUILLEZ PAYER IMMEDIATEMENT CETTE FACTURE !!!"
    res3 = engine.analyze(text3)
    print(f"Test 3 (Anomalies): {res3['linguistic_anomalies']}")
    assert "EXCESSIVE_CAPS" in res3['linguistic_anomalies']
    
    print("[SUCCESS] Semantic Engine verification complete.")

if __name__ == "__main__":
    test_semantic()
