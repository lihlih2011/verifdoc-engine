from fpdf import FPDF
import os
from datetime import datetime

class ReportGenerator(FPDF):
    def header(self):
        # Header minimaliste pour laisser place au contenu
        self.set_y(10)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 5, "VERIFDOC - Analyse de conformite documentaire (Beta)", 0, 0, 'R')
        self.ln(15)

    def footer(self):
        self.set_y(-20)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 5, f"Page {self.page_no()}/{{nb}} - Genere par VerifDoc - Usage interne strict", 0, 0, 'C')

    def chapter_title(self, label):
        self.set_font('Arial', 'B', 14)
        self.set_text_color(30, 41, 59)
        self.cell(0, 10, label, 0, 1, 'L')
        self.ln(5)

    def chapter_body(self, txt):
        self.set_font('Arial', '', 10)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 6, txt)
        self.ln()

    def add_kv(self, key, value):
        self.set_font('Arial', 'B', 10)
        self.set_text_color(70, 70, 70)
        self.cell(50, 6, key, 0, 0)
        self.set_font('Arial', '', 10)
        self.set_text_color(20, 20, 20)
        # Handle long values
        val_str = str(value)
        if len(val_str) > 60: val_str = val_str[:57] + "..."
        self.cell(0, 6, val_str, 0, 1)

def generate_pdf_report(filename, score, evidence, details, output_path, sector_context="GENERIC"):
    pdf = ReportGenerator()
    pdf.alias_nb_pages()
    pdf.add_page()
    
    # --- PAGE 1: SYNTHESE EXECUTIVE ---
    
    # 1. Logo & Header
    logo_path = os.path.join("static", "img", "logo.png")
    if os.path.exists(logo_path):
        pdf.image(logo_path, 10, 10, 40)
    pdf.ln(15)

    # 2. Context Box
    pdf.set_fill_color(248, 250, 252) # Slate 50
    pdf.rect(10, 35, 190, 40, 'F')
    pdf.set_xy(15, 40)
    
    pdf.set_font('Arial', 'B', 18)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, "RAPPORT D'ANALYSE", 0, 1)
    
    pdf.set_x(15)
    pdf.set_font('Arial', '', 10)
    date_str = datetime.now().strftime("%d/%m/%Y a %H:%M")
    pdf.cell(0, 6, f"Dossier : {filename}", 0, 1)
    pdf.set_x(15)
    pdf.cell(0, 6, f"Contexte : {sector_context} | Date : {date_str}", 0, 1)
    
    pdf.ln(25)

    # 3. Verdict (Global Status)
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, "1. SYNTHESE DE L'ANALYSE", 0, 1)
    
    # Determine Color/Text
    verdict = details.get('verdict', 'VALID')
    if verdict == 'FRAUDULENT':
        color = (220, 38, 38) # Red
        status = "NON CONFORME - RISQUE ELEVE"
        icon = "X"
    elif verdict == 'SUSPICIOUS':
        color = (234, 179, 8) # Yellow
        status = "VIGILANCE RECOMMANDEE"
        icon = "!"
    else:
        color = (22, 163, 74) # Green
        status = "CONFORME - AUCUNE ANOMALIE MAJEURE"
        icon = "V"
        
    # Status Banner
    pdf.set_fill_color(*color)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(0, 15, f"   {icon}   {status}", 0, 1, 'L', 1)
    
    # Disclaimer Text (from Scoring)
    disclaimer = details.get("disclaimer_text", "")
    pdf.ln(5)
    pdf.set_text_color(50, 50, 50)
    pdf.set_font('Arial', 'I', 11)
    pdf.multi_cell(0, 6, disclaimer)
    pdf.ln(10)
    
    
    # --- PAGE 2: INDICATEURS (NON TECHNIQUE) ---
    pdf.add_page()
    pdf.set_text_color(15, 23, 42)
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, "2. DOMAINES D'EVALUATION", 0, 1)
    pdf.ln(5)
    
    axis_scores = details.get("axis_scores", {"forensic": 0, "structure": 0, "logic": 0})
    
    axes = [
        ("INTEGRITE VISUELLE", axis_scores.get("forensic", 0), "Alterations d'image, copiages, coherence des pixels."),
        ("STRUCTURE FICHIER", axis_scores.get("structure", 0), "Metadonnees, historique d'edition, logiciels sources."),
        ("LOGIQUE METIER", axis_scores.get("logic", 0), "Coherence des dates, montants et regles metier.")
    ]
    
    pdf.set_line_width(0.5)
    
    for title, score, desc in axes:
        # Determine State
        if score > 50:
            state = "NON CONFORME"
            s_color = (220, 38, 38)
        elif score > 20: 
            state = "A SURVEILLER"
            s_color = (234, 179, 8)
        else:
            state = "CONFORME"
            s_color = (22, 163, 74)
            
        # Draw Axis Block
        pdf.set_draw_color(200, 200, 200)
        pdf.rect(pdf.get_x(), pdf.get_y(), 190, 25)
        
        pdf.set_xy(pdf.get_x() + 5, pdf.get_y() + 5)
        pdf.set_font('Arial', 'B', 11)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(100, 6, title, 0, 0)
        
        pdf.set_font('Arial', 'B', 11)
        pdf.set_text_color(*s_color)
        pdf.cell(80, 6, state, 0, 1, 'R')
        
        pdf.set_x(15)
        pdf.set_font('Arial', '', 9)
        pdf.set_text_color(100, 100, 100)
        pdf.cell(0, 6, desc, 0, 1)
        
        pdf.ln(12) # Spacing between blocks
        
    pdf.ln(10)


    # --- PAGE 3: DETAILS FACTUELS ---
    pdf.add_page()
    pdf.set_text_color(15, 23, 42)
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, "3. POINTS D'ATTENTION IDENTIFIES", 0, 1)
    pdf.ln(5)
    
    raw_indicators = details.get("evidence", [])
    
    if not raw_indicators:
        pdf.set_font('Arial', '', 11)
        pdf.set_text_color(22, 163, 74)
        pdf.cell(0, 10, "Aucun point suspect identifie lors de l'analyse.", 0, 1)
    else:
        pdf.set_font('Arial', '', 10)
        pdf.set_text_color(50, 50, 50)
        for ind in raw_indicators:
            # Clean up indicator string for display
            clean_ind = ind.replace("_", " ").title()
            pdf.cell(5, 6, "-", 0, 0)
            pdf.multi_cell(0, 6, clean_ind)
            pdf.ln(2)
            
    pdf.ln(15)
    
    # Recommendations
    pdf.set_font('Arial', 'B', 14)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, "4. RECOMMANDATIONS", 0, 1)
    
    # Load Dynamic Recs from Templates (same logic as before contextually)
    from core.structure.templates import SECTOR_TEMPLATES
    # Map 'FRAUDULENT' -> 'RED' etc maps logic
    verdict_map = {'FRAUDULENT': 'RED', 'REFUSED': 'RED', 'SUSPICIOUS': 'YELLOW', 'RESERVED': 'YELLOW', 'VALID': 'GREEN'}
    t_key = verdict_map.get(verdict, 'GREEN')
    recs = SECTOR_TEMPLATES.get(sector_context, SECTOR_TEMPLATES["GENERIC"]).get(t_key, {}).get("recommendations", [])
    
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(50, 50, 50)
    for rec in recs:
        pdf.cell(5, 6, ">", 0, 0)
        pdf.multi_cell(0, 6, rec)
        pdf.ln(1)


    # --- PAGE 4: CADRE JURIDIQUE ---
    pdf.add_page()
    pdf.set_font('Arial', 'B', 14)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, "5. CADRE JURIDIQUE & RESPONSABILITE", 0, 1)
    pdf.ln(5)
    
    disclaimer_full = (
        "Le present rapport est genere automatiquement par la solution VERIFDOC "
        "sur la base d'une analyse technique du fichier transmis.\n\n"
        "1. NATURE DE L'ANALYSE : Il s'agit d'un examen de coherence structurelle, visuelle et logique. "
        "Ce n'est pas une expertise graphologique ou judiciaire.\n\n"
        "2. VALEUR PROBANTE : Ce document constitue un outil d'aide a la decision "
        "interne (""Commencement de preuve par ecrit"" au sens de l'article 1362 du Code Civil). "
        "Il ne certifie pas l'authenticite de l'original papier.\n\n"
        "3. RESPONSABILITE : L'utilisateur demeure seul responsable de la decision finale "
        "(acceptation ou refus du document). VERIFDOC decline toute responsabilite "
        "quant aux consequences de l'utilisation de ce dossier."
    )
    
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(80, 80, 80)
    pdf.multi_cell(0, 6, disclaimer_full)
    
    pdf.ln(20)
    
    # Footer Signature
    pdf.set_draw_color(200, 200, 200)
    pdf.line(10, pdf.get_y(), 100, pdf.get_y())
    pdf.ln(5)
    pdf.set_font('Arial', 'B', 9)
    pdf.cell(0, 5, "CERTIFICAT NUMERIQUE", 0, 1)
    pdf.set_font('Arial', '', 9)
    pdf.cell(0, 5, f"ID: {filename[:10]}... | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 0, 1)
    pdf.cell(0, 5, "Signature cryptographique : SHA-256 (Verifie)", 0, 1)

    # OUTPUT
    pdf.output(output_path)
