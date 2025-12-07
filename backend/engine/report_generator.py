import os
import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from backend.app.config import settings # Assuming settings has PROJECT_NAME

class ReportGenerator:
    def __init__(self):
        self.report_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "reports")
        os.makedirs(self.report_dir, exist_ok=True)
        print(f"Report directory: {self.report_dir}")

    def _get_risk_level_text(self, score: int) -> str:
        """
        Determines the risk level text based on the forensic score.
        """
        if score < 40:
            return "Faible"
        if score >= 40 and score <= 70:
            return "Modéré"
        return "Élevé"

    def generate_report(self, record: dict, heatmaps: dict) -> tuple[str, bytes]:
        """
        Generates a PDF forensic report for a given analysis record.
        Returns the file path and the raw PDF bytes.
        """
        report_filename = f"rapport_verifdoc_{record['id']}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
        report_filepath = os.path.join(self.report_dir, report_filename)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        Story = []

        # Custom styles
        h1_style = styles['h1']
        h1_style.alignment = TA_CENTER
        h1_style.spaceAfter = 0.2 * inch

        h2_style = styles['h2']
        h2_style.alignment = TA_LEFT
        h2_style.spaceBefore = 0.2 * inch
        h2_style.spaceAfter = 0.1 * inch

        normal_style = styles['Normal']
        normal_style.spaceAfter = 0.1 * inch

        bold_style = ParagraphStyle(
            'Bold',
            parent=normal_style,
            fontName='Helvetica-Bold',
        )
        
        # --- Header ---
        Story.append(Paragraph(f"{settings.PROJECT_NAME} — Rapport d’analyse forensic", h1_style))
        Story.append(Spacer(1, 0.2 * inch))

        # --- Sub-header: Record ID, filename, date ---
        Story.append(Paragraph(f"<b>ID de l'analyse:</b> {record['id']}", normal_style))
        Story.append(Paragraph(f"<b>Nom du fichier:</b> {record['filename']}", normal_style))
        Story.append(Paragraph(f"<b>Date d'analyse:</b> {datetime.fromisoformat(record['created_at']).strftime('%d/%m/%Y %H:%M:%S')}", normal_style))
        Story.append(Spacer(1, 0.2 * inch))

        # --- Score forensic & Risk interpretation ---
        forensic_score = record['forensic_score']
        risk_level_text = self._get_risk_level_text(forensic_score)
        Story.append(Paragraph(f"<b>Score global de falsification:</b> <font color='red'>{forensic_score}%</font>", bold_style))
        Story.append(Paragraph(f"<b>Niveau de risque:</b> {risk_level_text}", bold_style))
        Story.append(Spacer(1, 0.2 * inch))
        Story.append(Paragraph(f"<b>Interprétation du risque:</b> {record['full_result']['explanation']['summary']}", normal_style))
        Story.append(Spacer(1, 0.3 * inch))

        # --- Section “Détails IA” ---
        Story.append(Paragraph("<h2>Détails de l'analyse IA</h2>", h2_style))
        module_scores = record['full_result']['module_scores']
        explanation = record['full_result']['explanation']

        Story.append(Paragraph(f"<b>OCR IA:</b> {(module_scores.get('ocr', 0.0) * 100):.1f}% - {explanation.get('ocr', 'N/A')}", normal_style))
        Story.append(Paragraph(f"<b>FR-DETR (Falsification Visuelle):</b> {(module_scores.get('frdetr', 0.0) * 100):.1f}% - {explanation.get('visual', 'N/A')}", normal_style))
        Story.append(Paragraph(f"<b>GAN / NoisePrint++:</b> {(module_scores.get('noiseprint', 0.0) * 100):.1f}% - {explanation.get('ai_noise', 'N/A')}", normal_style))
        Story.append(Paragraph(f"<b>ELA++ (Anomalies de Compression):</b> {(module_scores.get('ela', 0.0) * 100):.1f}% - {explanation.get('compression', 'N/A')}", normal_style))
        Story.append(Paragraph(f"<b>Copy-Move Detection:</b> {(module_scores.get('copymove', 0.0) * 100):.1f}% - {explanation.get('duplication', 'N/A')}", normal_style))
        Story.append(Paragraph(f"<b>Diffusion Forensics (IA Générative):</b> {(module_scores.get('diffusion', 0.0) * 100):.1f}% - {explanation.get('inpainting', 'N/A')}", normal_style))
        Story.append(Spacer(1, 0.3 * inch))

        # --- Section “Heatmaps” ---
        Story.append(Paragraph("<h2>Heatmaps forensic</h2>", h2_style))
        Story.append(Paragraph("Ces cartes thermiques montrent les zones détectées comme potentiellement manipulées.", normal_style))
        Story.append(Spacer(1, 0.1 * inch))

        # Base path for heatmaps (relative to backend root)
        base_heatmap_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "heatmaps")

        for label, url_path in heatmaps.items():
            if url_path:
                # Convert URL path to file system path
                file_path = os.path.join(base_heatmap_path, os.path.basename(url_path))
                if os.path.exists(file_path):
                    try:
                        img = Image(file_path, width=4 * inch, height=4 * inch)
                        Story.append(Paragraph(f"<b>{label.capitalize()} Heatmap:</b>", normal_style))
                        Story.append(img)
                        Story.append(Spacer(1, 0.2 * inch))
                    except Exception as e:
                        Story.append(Paragraph(f"<i>Erreur de chargement de la heatmap {label}: {e}</i>", normal_style))
                else:
                    Story.append(Paragraph(f"<i>Heatmap {label} non trouvée sur le serveur.</i>", normal_style))
            else:
                Story.append(Paragraph(f"<i>Heatmap {label} non générée.</i>", normal_style))
        
        Story.append(PageBreak()) # Start conclusion on a new page

        # --- Conclusion ---
        Story.append(Paragraph("<h2>Conclusion</h2>", h2_style))
        Story.append(Paragraph("Ce rapport est généré automatiquement par VerifDoc à partir d'analyses IA multicouches. Il fournit une évaluation objective de l'authenticité du document basée sur des algorithmes avancés de détection de falsification.", normal_style))
        Story.append(Spacer(1, 0.5 * inch))

        # --- Footer ---
        Story.append(Paragraph(f"Date du rapport: {datetime.now().strftime('%d/%m/%Y')}", normal_style))
        Story.append(Paragraph(f"Signature: {settings.PROJECT_NAME}", bold_style))

        doc.build(Story)
        
        pdf_bytes = buffer.getvalue()
        
        # Save the PDF to the file system
        with open(report_filepath, "wb") as f:
            f.write(pdf_bytes)

        return report_filepath, pdf_bytes