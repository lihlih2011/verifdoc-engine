# VerifDoc Backend

This directory contains the backend services for the VerifDoc application, built with FastAPI.

## Structure

- `app/`: Core application setup, including `main.py` and `config.py`.
- `api/`: API endpoints, including `vision_api.py` for document analysis.
- `engine/`: AI/ML engines for forensic analysis, such as OCR, forgery detection, and more.

## Getting Started

1.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
2.  **Run the application:**
    ```bash
    uvicorn backend.app.main:app --reload
    ```