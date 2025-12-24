import os
import google.generativeai as genai
import json
import logging

# RÈGLES D'ARCHITECTURE: Variables d'Environnement
API_KEY = os.getenv("GOOGLE_API_KEY")

class GeminiVerifier:
    def __init__(self):
        self.api_key = API_KEY
        self.logger = logging.getLogger("VerifDoc.EngineC")
        
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.logger.warning("GOOGLE_API_KEY not found. Engine C will runs in MOCK mode.")
            self.model = None

    def analyze_text_coherence(self, extracted_text: str, document_type: str = "GENERIC") -> dict:
        """
        Analyse la cohérence sémantique du texte extrait via Gemini.
        Hachage et Isolation des sessions sont gérés par l'appelant (Orchestrator).
        """
        if not self.model:
            return self._mock_response()

        # RÈGLES D'ARCHITECTURE: Style et Vocabulaire (Masque Administratif)
        system_prompt = f"""
        Tu es le Moteur C de VerifDoc, un auditeur technique rigoureux.
        Ta mission est d'analyser le texte brut d'un document ({document_type}) pour détecter des incohérences logiques.
        
        RÈGLES IMPÉRATIVES DE VOCABULAIRE (MASQUE ADMINISTRATIF) :
        - Ne dis jamais "Faux" ou "Fake". Dis "Indice de non-conformité majeure".
        - Ne dis jamais "Photoshopé". Dis "Indice d'édition tierce détecté".
        - Ne dis jamais "Erreur". Dis "Défaut de cohérence structurelle".
        - Si tu vois une modification chiffrée, parle de "Incohérence de la matrice numérique".
        
        RÈGLES D'ANALYSE :
        1. Vérifie la cohérence des dates (Chronologie).
        2. Vérifie la cohérence mathématique (Sommes, pourcentages).
        3. Détecte les fautes d'orthographe suspectes dans des champs officiels.
        
        FORMAT DE RÉPONSE JSON UNIQUE :
        {{
            "risk_score": <0-100>,
            "anomalies": ["phrase 1 (vocabulaire administratif)", "phrase 2..."],
            "summary": "Synthèse administrative...",
            "verdict_phrase": "Indice d'aide à la décision : <Risque>"
        }}
        
        TEXTE À ANALYSER :
        {extracted_text[:3000]} 
        """
        # Truncate text to 3000 chars to save tokens/stay in context if gigantic
        
        try:
            response = self.model.generate_content(system_prompt)
            # Nettoyage basique du JSON (Gemini met parfois des ```json ... ```)
            raw_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(raw_text)
        except Exception as e:
            self.logger.error(f"Gemini Analysis Failed: {e}")
            return self._fallback_response()

    def _mock_response(self):
        """Réponse simulée si pas de clé API (Pour tests locaux)"""
        return {
            "risk_score": 10,
            "anomalies": [],
            "summary": "Analyse Sémantique (Mode Simulation - Clé API Manquante). Aucune incohérence flagrante détectée.",
            "verdict_phrase": "Indice d'aide à la décision : Risque Faible (Simulé)"
        }

    def _fallback_response(self):
        return {
            "risk_score": 50,
            "anomalies": ["Echec de l'analyse sémantique externe."],
            "summary": "Le moteur sémantique n'a pas pu traiter la demande.",
            "verdict_phrase": "Indice d'aide à la décision : Non Concluant"
        }
