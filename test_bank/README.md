# Test Bank Organization - Sector-Based Taxonomy

## Structure
```
test_bank/
├── real/                    # Authentic specimens
│   ├── banking/            # RIB, relevés bancaires, chèques
│   ├── healthcare/         # Ordonnances, certificats médicaux, résultats
│   ├── legal/              # Contrats, attestations, jugements
│   ├── education/          # Diplômes, bulletins, certificats
│   ├── government/         # Avis d'impôt, CNI, passeports, permis
│   ├── utilities/          # Factures EDF, Orange, Free, eau
│   ├── identity/           # CNI, passeports, cartes vitale
│   ├── employment/         # Fiches de paie, contrats de travail
│   └── real_estate/        # Baux, diagnostics, titres de propriété
└── faked/                   # Forged variants (same structure)
    ├── banking/
    ├── healthcare/
    └── ...
```

## Sector Coverage Matrix

| Sector | Document Types | Priority | Sources |
|--------|---------------|----------|---------|
| **Banking** | RIB, Relevés, Chèques | HIGH | BoursoBank, BNP specimens |
| **Healthcare** | Ordonnances, Certificats | MEDIUM | Ameli.fr, CPAM |
| **Legal** | Contrats, Attestations | HIGH | Service-public.fr |
| **Education** | Diplômes, Bulletins | MEDIUM | Education.gouv.fr |
| **Government** | Impôts, CNI, Passeports | CRITICAL | Impots.gouv.fr, ANTS, MIDV-500 |
| **Utilities** | Factures (énergie, télécom) | HIGH | EDF, Orange, Free |
| **Identity** | CNI, Passeports, Permis | CRITICAL | PRADO, MIDV-500 |
| **Employment** | Fiches de paie, Contrats | HIGH | Coover.fr, Eurecia |
| **Real Estate** | Baux, DPE, Titres | MEDIUM | CERFA forms |

## Acquisition Strategy

### Phase 1: Critical Sectors (Week 1)
- Government (Tax, Identity)
- Banking (RIB, Statements)
- Employment (Payslips)

### Phase 2: High-Priority (Week 2)
- Legal (Contracts, Attestations)
- Utilities (Bills)

### Phase 3: Comprehensive (Week 3)
- Healthcare, Education, Real Estate

## Forgery Generation
For each real specimen in `real/{sector}/`, we generate 3 variants:
1. **ELA Fail**: Image manipulation (copy-paste)
2. **Metadata Fail**: Producer tool + date paradox
3. **Logic Fail**: Math errors (for financial docs) or MRZ corruption (for IDs)

## Testing Protocol
```bash
# Run full sector test
python scripts/test_sector.py --sector banking

# Expected output:
# - Real specimens: 100% VALID
# - Faked specimens: 90%+ FRAUDULENT
```
