from core.reporting import generate_pdf_report

print("Generating Test Report...")
try:
    generate_pdf_report(
        filename="TEST_DOCUMENT.pdf",
        score=25,
        evidence=["TIMELINE_MODIFIED", "VISUEL_ALTERATION"],
        details={
            "verdict": "SUSPICIOUS",
            "forensic": {"ela_score": 5.0},
            "structure": {
                "metadata": {"producer": "Photoshop"},
                "incremental_updates": {"has_incremental_updates": True}
            }
        },
        output_path="TEST_EXECUTIVE_REPORT.pdf",
        sector_context="IMMOBILIER"
    )
    print("SUCCESS: TEST_EXECUTIVE_REPORT.pdf created.")
except Exception as e:
    print(f"FAILURE: {e}")
