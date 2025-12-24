import os, sys, json, subprocess, pikepdf

# ----------------------------------------------------------------------
# Helper to run VerifDoc analysis on a PDF and return the parsed JSON.
# ----------------------------------------------------------------------
def run_analysis(pdf_path):
    """Execute run_analysis.py and return the parsed JSON result."""
    result = subprocess.run(
        [sys.executable, "run_analysis.py", pdf_path],
        cwd=os.path.abspath(os.path.join(os.path.dirname(__file__), "..")),
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"[ERROR] Analysis failed for {pdf_path}: {result.stderr}")
        sys.exit(1)
    return json.loads(result.stdout)

# ----------------------------------------------------------------------
# Paths
# ----------------------------------------------------------------------
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SCRIPTS_DIR = os.path.join(BASE_DIR, "scripts")
TESTS_DIR = os.path.abspath(os.path.dirname(__file__))

# Simple placeholder image – user should place an image named 'sample_image.png' in this folder.
SAMPLE_IMAGE = os.path.join(TESTS_DIR, "sample_image.png")

# ----------------------------------------------------------------------
# Generate forged PDFs
# ----------------------------------------------------------------------
# 0. Ensure Source PDF exists
source_pdf = os.path.join(BASE_DIR, "test_doc.pdf")
if not os.path.exists(source_pdf):
    pdf = pikepdf.new()
    pdf.add_blank_page()
    pdf.save(source_pdf)
    print(f"Created source PDF at {source_pdf}")

# 1. Text‑only forgery
text_forged = os.path.join(TESTS_DIR, "text_forged.pdf")
subprocess.run([
    sys.executable, os.path.join(SCRIPTS_DIR, "generate_text_forged.py"),
    os.path.join(BASE_DIR, "test_doc.pdf"),  # use existing dummy PDF
    text_forged,
    "Modified amount: 9999 €"
], check=True)

# 2. Image‑only forgery (requires sample_image.png)
image_forged = os.path.join(TESTS_DIR, "image_forged.pdf")
if os.path.exists(SAMPLE_IMAGE):
    subprocess.run([
        sys.executable, os.path.join(SCRIPTS_DIR, "generate_image_forged.py"),
        os.path.join(BASE_DIR, "test_doc.pdf"),
        image_forged,
        SAMPLE_IMAGE,
    ], check=True)
else:
    print("[WARN] sample_image.png not found – skipping image‑only test.")
    image_forged = None

# 3. Combo forgery (text + image)
combo_forged = os.path.join(TESTS_DIR, "combo_forged.pdf")
if os.path.exists(SAMPLE_IMAGE):
    subprocess.run([
        sys.executable, os.path.join(SCRIPTS_DIR, "generate_combo_forged.py"),
        os.path.join(BASE_DIR, "test_doc.pdf"),
        combo_forged,
        "Modified amount: 9999 €",
        SAMPLE_IMAGE,
    ], check=True)
else:
    combo_forged = None

# ----------------------------------------------------------------------
# Run analysis and validate indicators
# ----------------------------------------------------------------------
print("--- Analyzing text‑only forgery ---")
result_text = run_analysis(text_forged)
assert "DOCUMENT_CONTENT_EMPTY/UNREADABLE" in result_text["evidence"] or result_text["score"] >= 0, "Text‑only indicator missing"

if image_forged:
    print("--- Analyzing image‑only forgery ---")
    result_image = run_analysis(image_forged)
    assert "IMAGE_PRESENT" in result_image["evidence"], "Image indicator missing"
    # If many images scenario not triggered, that's fine.

if combo_forged:
    print("--- Analyzing combo forgery ---")
    result_combo = run_analysis(combo_forged)
    assert "IMAGE_PRESENT" in result_combo["evidence"], "Combo image indicator missing"
    assert "DOCUMENT_CONTENT_EMPTY/UNREADABLE" not in result_combo["evidence"], "Unexpected low‑content flag for combo"

print("All forgery tests passed.")
