class InvestigationEngine:
    """
    Engine responsible for generating 'Hypotheses' about the fraud method.
    Moving from 'What is wrong' (Evidence) to 'How it was done' (Narrative).
    """

    def generate_hypothesis(self, evidence: list, metadata: dict, forensic_data: dict, logic_data: dict) -> list:
        hypotheses = []

        # Scenarios based on Evidence Combinations

        # 1. The "Online Tool" Scenario
        producer = metadata.get('producer', '').lower()
        if 'ilovepdf' in producer or 'skia' in producer or 'gimp' in producer:
            base_msg = f"Le document a été généré via un logiciel d'édition ({metadata.get('producer')})."
            if "LOGIC_NET_GROSS_MISMATCH" in evidence:
                 hypotheses.append(f"{base_msg} Probablement utilisé pour altérer les chiffres du salaire.")
            elif "ELA_TAMPER_DETECTED" in evidence or forensic_data.get('ela_score', 0) > 3.0:
                 hypotheses.append(f"{base_msg} Des traces de modification visuelle sont présentes (montage).")
            else:
                 # Nuance as requested by user
                 hypotheses.append(f"Modification structurelle légère via {metadata.get('producer')}. Il s'agit probablement d'une conversion légitime (ex: Word vers PDF), aucune trace de fraude flagrante ici.")

        # 2. The "Amateur Forgery" Scenario (Paint/Photoshop)
        if forensic_data.get('ela_score', 0) > 4.5:
            hypotheses.append("Falsification probable par retouche d'image (type Paint/Photoshop). Les pixels montrent une forte incohérence (copier-coller ou gommage).")

        # 3. The "Math Failure" Scenario
        if "LOGIC_NET_GROSS_MISMATCH" in evidence:
            net = logic_data.get('net_salary', 0)
            gross = logic_data.get('gross_salary', 0)
            hypotheses.append(f"Erreur de calcul flagrante : Le Net ({net}) et le Brut ({gross}) ne correspondent pas aux taux légaux. Modification manuelle probable d'un des deux montants sans recalculer l'autre.")

        # 4. The "Time Traveler" Scenario
        if "TIME_PARADOX_DETECTED" in evidence:
             hypotheses.append("Incohérence Temporelle : La date de modification est antérieure à la création, ou le document mentionne une date future. Indice fort de manipulation des métadonnées système.")

        # 5. The "Lazy Fraudster" Scenario (Template reuse)
        if "METADATA_CREATION_DATE_SUSPICIOUS" in evidence:
             hypotheses.append("Réutilisation de maquette : La date de création est très ancienne ou générique, suggérant l'usage d'un 'template' de fausse fiche de paie.")

        # 6. The "Identity Fraud" Scenario (MRZ)
        if "FRAUD_MRZ_CHECKSUM_INVALID" in evidence:
             hypotheses.append("ALTÉRATION D'IDENTITÉ : Les clés de contrôle de la bande MRZ sont invalides. Le document a été modifié manuellement, mais l'auteur a oublié de recalculer les codes de sécurité au bas de la pièce.")

        # 7. Semantic & Template Scenarios (Phase 5)
        if "TEMPLATE_PLACEHOLDER_DETECTED" in evidence:
            hypotheses.append("MODÈLE DE DOCUMENT RÉUTILISÉ : Présence de balises de remplissage (ex: {{NOM}}), indiquant que le document n'est pas une pièce originale mais un gabarit édité.")
        
        if any("SEMANTIC_FORGERY_KEYWORD" in e for e in evidence):
            hypotheses.append("MENTION FRAUDULEUSE DÉTECTÉE : Le texte contient des mots-clés typiques de faux documents (ex: SPECIMEN, VOID, FAKE) souvent laissés par inadvertance.")

        if "SUSPICIOUS_TEXT_QUALITY_GARBAGE" in evidence:
            hypotheses.append("ALTÉRATION NUMÉRIQUE DU TEXTE : La qualité anormale des caractères suggère un masquage ou une sur-édition logicielle camouflée.")

        if "SUSPICIOUS_PATTERN_EXCESSIVE_CAPS" in evidence:
            hypotheses.append("STYLE LINGUISTIQUE ATYPIQUE : L'usage excessif de majuscules est caractéristique des documents de phishing ou de modèles non-officiels.")

        # 8. The "Patchwork" Scenario (Fonts - Phase 9)
        if any("FONT_OUTLIER" in e for e in evidence):
            hypotheses.append("ALTÉRATION DE TEXTE (PATCHWORK) : L'utilisation de polices de caractères disparates pour certains montants ou noms indique une modification locale. C'est le signe classique d'un 'copier-coller' ou d'une ré-écriture par-dessus le document original.")
        
        if any("ANACHRONISTIC_FONT" in e for e in evidence):
            hypotheses.append("ANACHRONISME GRAPHIQUE : Utilisation d'une police de caractères moderne (ex: Calibri) dans un document supposé être ancien. Incohérence temporelle majeure.")

        # 9. The "Cloning" Scenario (Phase 10)
        if any("CLONE_DETECTED" in e for e in evidence) or any("CLONING_DETECTED" in e for e in evidence):
            hypotheses.append("ALTÉRATION PAR CLONAGE (COPY-MOVE) : Détection de zones strictement identiques dans le document (ex: même signature ou même tampon reproduit exactement). C'est une signature typique d'une falsification par montage numérique.")

        # 10. The "Splicing" Scenario (Phase 11: Copy-Add)
        if any("NOISE_INCONSISTENCY" in e for e in evidence) or "HIGH_CONFIDENCE_SPLICING_DETECTED" in evidence:
            hypotheses.append("ALTÉRATION PAR COMPOSITION (SPLICING / COPY-ADD) : Détection d'une incohérence dans le grain de l'image (bruit numérique). Cela suggère qu'un élément extérieur (ex: une signature provenant d'un autre document) a été 'ajouté' par-dessus l'original.")

        # Default if clean
        if not hypotheses and not evidence:
            hypotheses.append("Document apparemment intègre. Aucune méthode de falsification connue détectée.")
        
        return hypotheses
