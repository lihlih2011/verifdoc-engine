import re

text = 'BULLETIN DE PAIE\n\nEntreprise : CORP-X TECHNOLOGIES\n\nEmployé : ALEXANDRE MARTIN\n\nSALAIRE BRUT .................................... 5 000,00 EUR\n\nCOTISATIONS SOCIALES ............................   200,00 EUR\n\nNET A PAYER AVANT IMPOT ......................... 6 000,00 EUR\n\n\x0c'

net_pattern = re.search(r"(?:NET A PAYER|NET PAYÉ|NET À PAYER)[^0-9]*?(\d[\d\s]{0,15}(?:[.,]\d{2})?)", text, re.IGNORECASE)
brut_pattern = re.search(r"(?:TOTAL BRUT|SALAIRE BRUT)[^0-9]*?(\d[\d\s]{0,15}(?:[.,]\d{2})?)", text, re.IGNORECASE)

print(f"NET MATCH: {net_pattern}")
if net_pattern: print(f"  -> GROUP 1: {net_pattern.group(1)!r}")

print(f"BRUT MATCH: {brut_pattern}")
if brut_pattern: print(f"  -> GROUP 1: {brut_pattern.group(1)!r}")
