import unittest
from core.logic.business_rules import BusinessLogicEngine
from datetime import datetime

class TestUniversalLogic(unittest.TestCase):
    def setUp(self):
        self.engine = BusinessLogicEngine()

    def test_garbage_text(self):
        # Text with high ratio of symbols (simulate bad OCR or binary data)
        garbage = "H$llo W@rld t#is i$ a t%st &*(@#&!@^#&!@^#*&^!@#^&!@#^"
        warnings = self.engine.check_universal_quality(garbage)
        self.assertIn("SUSPICIOUS_TEXT_QUALITY_GARBAGE", warnings)

    def test_excessive_caps(self):
        # Text with normal length but all caps (Phishing style)
        caps = "CHER CLIENT, VOTRE COMPTE A ETE PIRATE. VEUILLEZ CLIQUER ICI IMMEDIATEMENT POUR LE DEBLOQUER. CECI EST URGENT."
        warnings = self.engine.check_universal_quality(caps)
        self.assertIn("SUSPICIOUS_PATTERN_EXCESSIVE_CAPS", warnings)

    def test_normal_caps(self):
        # Normal text should not trigger warning
        normal = "Cher client, votre compte est sécurisé. Merci de votre confiance."
        warnings = self.engine.check_universal_quality(normal)
        self.assertNotIn("SUSPICIOUS_PATTERN_EXCESSIVE_CAPS", warnings)
        
    def test_suspicious_email(self):
        # Text containing temp mail or example domains
        text = "Contact me at fraudster@test.com or admin@example.com immediately."
        warnings = self.engine.check_universal_quality(text)
        self.assertTrue(any("SUSPICIOUS_EMAIL_DOMAIN" in w for w in warnings))

if __name__ == '__main__':
    unittest.main()
