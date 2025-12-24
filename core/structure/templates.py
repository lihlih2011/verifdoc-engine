# core/structure/templates.py

SECTOR_TEMPLATES = {
    "GENERIC": {
        "GREEN": {
            "title": "Structure Technique Valide",
            "summary": "L'analyse n'a pas mis en évidence d'anomalies techniques détectables. Le fichier présente une structure standard.",
            "recommendations": [
                "Utilisation possible du document dans un cadre courant.",
                "Vérification humaine standard conseillée."
            ]
        },
        "YELLOW": {
            "title": "Document Atypique - À Vérifier",
            "summary": "Des marqueurs techniques atypiques ont été relevés ( métadonnées incomplétes ou outils d'édition détectés).",
            "recommendations": [
                "Vérifier la provenance du document.",
                "Demander des justificatifs complémentaires si nécessaire.",
                "Comparer avec une version originale si disponible."
            ]
        },
        "RED": {
            "title": "Anomalies Techniques Critiques",
            "summary": "L'analyse a identifié des ruptures de cohérence majeures (dates impossibles, modifications structurelles profondes).",
            "recommendations": [
                "Suspendre le traitement du dossier.",
                "Demander impérativement une version originale (papier ou certifiée).",
                "Ne pas se fier au contenu visuel du document."
            ]
        }
    },
    
    "RH": {
        "GREEN": {
            "title": "Dossier Candidat - Cohérent",
            "summary": "Les pièces analysées respectent les standards de création attendus pour des justificatifs (CV, Diplômes).",
            "recommendations": [
                "Poursuivre le processus de recrutement.",
                "Aucune action technique supplémentaire requise."
            ]
        },
        "YELLOW": {
            "title": "Dossier Candidat - Vigilance Requise",
            "summary": "Certains documents présentent des traces de ré-enregistrement ou d'édition récente non justifiée.",
            "recommendations": [
                "Vérifier la cohérence des dates sur le CV par rapport aux métadonnées.",
                "Demander les originaux lors de l'entretien.",
                "Contacter l'émetteur (école/employeur) en cas de doute persistant."
            ]
        },
        "RED": {
            "title": "Dossier Candidat - Risque Élevé",
            "summary": "Multiples incohérences détectées suggérant une modification volontaire des informations (dates, noms, montants).",
            "recommendations": [
                "Ne pas engager de contrat sur la base de ces documents.",
                "Exiger la présentation des originaux papier.",
                "Effectuer un contrôle de référence approfondi."
            ]
        }
    },

    "IMMOBILIER": {
        "GREEN": {
            "title": "Dossier Locataire - Standard",
            "summary": "Les justificatifs de revenus/identité présentent une structure numérique intègre.",
            "recommendations": [
                "Valider la complétude du dossier.",
                "Procéder à l'étude de solvabilité."
            ]
        },
        "YELLOW": {
            "title": "Dossier Locataire - Vérifications Nécessaires",
            "summary": "Présence d'outils d'édition en ligne ou de discordances dans l'historique du fichier.",
            "recommendations": [
                "Demander les avis d'imposition originaux ou vérifier via le service Véerif'Avis (Gouv).",
                "Contacter l'employeur pour confirmation de poste.",
                "Être vigilant sur les bulletins de salaire (lignes modifiées)."
            ]
        },
        "RED": {
            "title": "Dossier Locataire - Non Conforme",
            "summary": "Indices techniques forts de falsification (montants, dates ou identité modifiés numériquement).",
            "recommendations": [
                "Refuser le dossier en l'état actuel.",
                "Signaler le caractère non-conforme des pièces fournies.",
                "Ne signer aucun bail sans audit approfondi."
            ]
        }
    },
    
    "BANQUE": {
        "GREEN": {
            "title": "KYC - Conforme",
            "summary": "Les documents d'identité et justificatifs respectent les normes d'intégrité attendues.",
            "recommendations": [
                "Valider l'étape de collecte documentaire (KYC Level 1).",
                "Archiver le dossier."
            ]
        },
        "YELLOW": {
            "title": "KYC - Review Manuelle Requise",
            "summary": "Le document n'est pas un original natif ou a subi une conversion atypique.",
            "recommendations": [
                "Escalader au niveau 2 (Analyse humaine).",
                "Mettre le dossier 'En Attente' de pièces complémentaires.",
                "Vérifier la concordance avec les bases de données externes."
            ]
        },
        "RED": {
            "title": "KYC - Rejet Technique (Risque Fraude)",
            "summary": "Détection d'anomalies critiques incompatibles avec les processus de conformité bancaire.",
            "recommendations": [
                "Rejeter l'entrée en relation (Onboarding Fail).",
                "Déclencher une procédure de suspicion de fraude (Team Compliance).",
                "Ne pas valider de virement ou d'ouverture de compte."
            ]
        }
    },
    
    "JURIDIQUE": {
        "GREEN": {
            "title": "Pièce Probante - Intégrité Validée",
            "summary": "La structure du fichier est compatible avec une chaîne de garde ininterrompue.",
            "recommendations": [
                "Admettre au dossier de preuve.",
                "Aucune réserve technique à formuler."
            ]
        },
        "YELLOW": {
            "title": "Pièce Probante - Réserves Techniques",
            "summary": "Rupture potentielle de la chaîne de preuve numérique. Métadonnées possiblement altérées.",
            "recommendations": [
                "Émettre une réserve sur la force probante.",
                "Demander une expertise contradictoire.",
                "Ne pas utiliser comme preuve unique/décisive."
            ]
        },
        "RED": {
            "title": "Pièce Probante - Intégrité Compromise",
            "summary": "Le fichier a subi des manipulations postérieures à sa création prétendue. Non recevable en l'état.",
            "recommendations": [
                "Écarter du dossier de plaidoirie.",
                "Contester formellement l'authenticité de la pièce.",
                "Demander un constat d'huissier sur le support d'origine."
            ]
        }
    }
}
