"""
Comparative Test: Real vs. Forged Documents
Measures VerifDoc's true detection accuracy
"""

import sys
sys.path.insert(0, '.')

from core.orchestrator import MainAnalyzer
from pathlib import Path
import json

class ComparativeValidator:
    """Compare detection rates between real and forged documents"""
    
    def __init__(self):
        self.analyzer = MainAnalyzer()
        self.real_dir = Path("test_bank/real")
        self.faked_dir = Path("test_bank/faked")
        self.results = {
            "real": [],
            "faked": []
        }
    
    def test_document(self, file_path, category):
        """Test a single document"""
        try:
            result = self.analyzer.analyze_document(str(file_path))
            return {
                "file": file_path.name,
                "sector": file_path.parent.name,
                "category": category,
                "score": result['score'],
                "verdict": result['verdict'],
                "evidence_count": len(result['evidence']),
                "evidence": result['evidence'][:3]  # First 3
            }
        except Exception as e:
            return {
                "file": file_path.name,
                "error": str(e)
            }
    
    def test_category(self, directory, category):
        """Test all documents in a category"""
        print(f"\n{'='*60}")
        print(f"Testing {category.upper()} documents")
        print(f"{'='*60}")
        
        all_pdfs = list(directory.rglob("*.pdf"))
        print(f"Found {len(all_pdfs)} documents\n")
        
        for pdf in all_pdfs:
            result = self.test_document(pdf, category)
            self.results[category].append(result)
            
            # Quick summary
            if 'error' not in result:
                print(f"  [{result['sector']}] {result['file'][:40]}: "
                      f"Score={result['score']}, Verdict={result['verdict']}")
    
    def run_comparative_test(self):
        """Run full comparative test"""
        print("="*60)
        print("COMPARATIVE TEST: REAL vs. FORGED")
        print("="*60)
        
        # Test real documents
        self.test_category(self.real_dir, "real")
        
        # Test forged documents
        self.test_category(self.faked_dir, "faked")
        
        # Generate comparison report
        self.generate_report()
    
    def generate_report(self):
        """Generate detailed comparison report"""
        print("\n" + "="*60)
        print("DETECTION ACCURACY REPORT")
        print("="*60)
        
        # Real documents analysis
        real_docs = [r for r in self.results['real'] if 'error' not in r]
        real_valid = sum(1 for r in real_docs if r['verdict'] == 'VALID')
        real_suspicious = sum(1 for r in real_docs if r['verdict'] == 'SUSPICIOUS')
        real_fraudulent = sum(1 for r in real_docs if r['verdict'] == 'FRAUDULENT')
        
        print(f"\n📄 REAL DOCUMENTS ({len(real_docs)} total):")
        print(f"  ✓ VALID: {real_valid} ({real_valid/len(real_docs)*100:.1f}%)")
        print(f"  ⚠ SUSPICIOUS: {real_suspicious} ({real_suspicious/len(real_docs)*100:.1f}%)")
        print(f"  ✗ FRAUDULENT: {real_fraudulent} ({real_fraudulent/len(real_docs)*100:.1f}%)")
        print(f"  → False Positive Rate: {real_fraudulent/len(real_docs)*100:.1f}%")
        
        # Forged documents analysis
        faked_docs = [r for r in self.results['faked'] if 'error' not in r]
        faked_valid = sum(1 for r in faked_docs if r['verdict'] == 'VALID')
        faked_suspicious = sum(1 for r in faked_docs if r['verdict'] == 'SUSPICIOUS')
        faked_fraudulent = sum(1 for r in faked_docs if r['verdict'] == 'FRAUDULENT')
        
        print(f"\n🔴 FORGED DOCUMENTS ({len(faked_docs)} total):")
        print(f"  ✓ VALID: {faked_valid} ({faked_valid/len(faked_docs)*100:.1f}%)")
        print(f"  ⚠ SUSPICIOUS: {faked_suspicious} ({faked_suspicious/len(faked_docs)*100:.1f}%)")
        print(f"  ✗ FRAUDULENT: {faked_fraudulent} ({faked_fraudulent/len(faked_docs)*100:.1f}%)")
        print(f"  → True Positive Rate: {faked_fraudulent/len(faked_docs)*100:.1f}%")
        
        # Overall accuracy
        print(f"\n📊 OVERALL ACCURACY:")
        true_positives = faked_fraudulent  # Correctly detected fakes
        false_negatives = faked_valid + faked_suspicious  # Missed fakes
        true_negatives = real_valid  # Correctly validated reals
        false_positives = real_fraudulent + real_suspicious  # Incorrectly flagged reals
        
        accuracy = (true_positives + true_negatives) / (len(real_docs) + len(faked_docs)) * 100
        precision = true_positives / (true_positives + false_positives) * 100 if (true_positives + false_positives) > 0 else 0
        recall = true_positives / (true_positives + false_negatives) * 100 if (true_positives + false_negatives) > 0 else 0
        
        print(f"  Accuracy: {accuracy:.1f}%")
        print(f"  Precision: {precision:.1f}%")
        print(f"  Recall (Detection Rate): {recall:.1f}%")
        
        # By forgery technique
        print(f"\n🔬 BY FORGERY TECHNIQUE:")
        techniques = {}
        for doc in faked_docs:
            if 'ELA_FAIL' in doc['file']:
                tech = 'ELA_FAIL'
            elif 'META_CORRUPT' in doc['file']:
                tech = 'META_CORRUPT'
            elif 'COMBO_FRAUD' in doc['file']:
                tech = 'COMBO_FRAUD'
            else:
                tech = 'UNKNOWN'
            
            if tech not in techniques:
                techniques[tech] = []
            techniques[tech].append(doc)
        
        for tech, docs in techniques.items():
            detected = sum(1 for d in docs if d['verdict'] == 'FRAUDULENT')
            print(f"  {tech}: {detected}/{len(docs)} detected ({detected/len(docs)*100:.1f}%)")
        
        # Save full results
        with open('test_bank/comparative_results.json', 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n✓ Full results saved to: test_bank/comparative_results.json")
        print("="*60)

if __name__ == "__main__":
    validator = ComparativeValidator()
    validator.run_comparative_test()
