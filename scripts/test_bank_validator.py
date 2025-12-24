"""
Test Bank Validator - Baseline Accuracy Test
Tests VerifDoc against the populated test bank
"""

import sys
sys.path.insert(0, '.')

from core.orchestrator import MainAnalyzer
from pathlib import Path
import json

class TestBankValidator:
    """Run VerifDoc on all test bank documents"""
    
    def __init__(self, test_bank_dir="test_bank/real"):
        self.test_bank = Path(test_bank_dir)
        self.analyzer = MainAnalyzer()
        self.results = []
    
    def test_document(self, file_path):
        """Test a single document"""
        print(f"\n{'='*60}")
        print(f"Testing: {file_path.name}")
        print(f"Sector: {file_path.parent.name}")
        print(f"{'='*60}")
        
        try:
            result = self.analyzer.analyze_document(str(file_path))
            
            print(f"\n[RESULT]")
            print(f"  Score: {result['score']}/100")
            print(f"  Verdict: {result['verdict']}")
            print(f"  Evidence: {len(result['evidence'])} indicators")
            
            if result['evidence']:
                print(f"\n[EVIDENCE]")
                for ev in result['evidence'][:5]:  # Show first 5
                    print(f"  - {ev}")
            
            if result.get('hypotheses'):
                print(f"\n[HYPOTHESES]")
                for hyp in result['hypotheses'][:3]:  # Show first 3
                    print(f"  → {hyp}")
            
            return {
                "file": file_path.name,
                "sector": file_path.parent.name,
                "score": result['score'],
                "verdict": result['verdict'],
                "evidence_count": len(result['evidence'])
            }
        except Exception as e:
            print(f"\n[ERROR] {str(e)}")
            return {
                "file": file_path.name,
                "sector": file_path.parent.name,
                "error": str(e)
            }
    
    def run_full_test(self):
        """Test all documents in test bank"""
        print("="*60)
        print("VERIFDOC TEST BANK VALIDATOR")
        print("="*60)
        
        # Find all PDF files
        all_docs = list(self.test_bank.rglob("*.pdf"))
        print(f"\nFound {len(all_docs)} documents to test\n")
        
        for doc in all_docs:
            result = self.test_document(doc)
            self.results.append(result)
        
        # Generate summary
        self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        
        total = len(self.results)
        valid = sum(1 for r in self.results if r.get('verdict') == 'VALID')
        suspicious = sum(1 for r in self.results if r.get('verdict') == 'SUSPICIOUS')
        fraudulent = sum(1 for r in self.results if r.get('verdict') == 'FRAUDULENT')
        errors = sum(1 for r in self.results if 'error' in r)
        
        print(f"\nTotal Documents: {total}")
        print(f"  ✓ VALID: {valid} ({valid/total*100:.1f}%)")
        print(f"  ⚠ SUSPICIOUS: {suspicious} ({suspicious/total*100:.1f}%)")
        print(f"  ✗ FRAUDULENT: {fraudulent} ({fraudulent/total*100:.1f}%)")
        if errors:
            print(f"  ⚡ ERRORS: {errors}")
        
        # By sector
        print(f"\nBy Sector:")
        sectors = {}
        for r in self.results:
            sector = r.get('sector', 'unknown')
            if sector not in sectors:
                sectors[sector] = []
            sectors[sector].append(r)
        
        for sector, docs in sectors.items():
            avg_score = sum(d.get('score', 0) for d in docs) / len(docs)
            print(f"  {sector.upper()}: {len(docs)} docs, avg score: {avg_score:.1f}")
        
        # Save results
        with open('test_bank/validation_results.json', 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n✓ Full results saved to: test_bank/validation_results.json")
        print("="*60)

if __name__ == "__main__":
    validator = TestBankValidator()
    validator.run_full_test()
