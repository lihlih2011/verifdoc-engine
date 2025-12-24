// Main Application Logic
document.addEventListener('alpine:init', () => {
    Alpine.data('app', () => ({
        state: 'idle', // idle, analyzing, done
        fileCount: 0,
        reports: [],
        currentReport: null,
        batchLogic: null,
        selectedDocIndex: 0,
        isLoupeActive: false,
        showMagnifier: false,
        magnifierStyle: {},
        showHeatmap: false,

        // Analysis State Helpers
        get score() { return this.currentReport ? this.currentReport.score : 0; },
        get verdictText() { return this.currentReport ? this.currentReport.verdict : 'N/A'; },
        get evidenceCount() { return this.currentReport ? this.currentReport.evidence.length : 0; },
        get filename() { return this.currentReport ? this.currentReport.filename : ''; },
        get metadata() { return this.currentReport ? this.currentReport.details.structure.metadata : {}; },
        get stats() { return this.currentReport ? this.currentReport.details.stats : {}; },
        get evidence() { return this.currentReport ? this.currentReport.evidence : []; },
        get hypotheses() { return this.currentReport ? this.currentReport.hypotheses : []; },
        get forensic() { return this.currentReport ? this.currentReport.details.forensic : {}; },
        get logic() { return this.currentReport ? this.currentReport.details.logic.business : {}; },
        get previewUrl() { return this.currentReport ? this.currentReport.previewUrl : ''; },
        get heatmapUrl() { return this.currentReport ? this.currentReport.heatmap_url : ''; },
        get textContent() { return this.currentReport ? this.currentReport.details.stats.text_content : ''; },
        get mrz() { return this.currentReport && this.currentReport.details.structure.mrz ? this.currentReport.details.structure.mrz : { found: false }; },

        get scoreColor() {
            if (this.score >= 50) return '#ef4444'; // Red
            if (this.score >= 20) return '#fb923c'; // Orange
            return '#22c55e'; // Green
        },
        get verdictColor() {
            if (this.score >= 50) return 'text-red-500';
            if (this.score >= 20) return 'text-orange-400';
            return 'text-green-500';
        },

        // Actions
        processFiles(data) {
            console.log("Processing Files", data);
            this.state = 'analyzing';
        },

        handleAnalysisResults(results) {
            console.log("Analysis Results received", results);
            this.reports = results.individual_reports;
            this.batchLogic = results.batch_logic;
            this.currentReport = this.reports[0];
            this.selectedDocIndex = 0;
            this.state = 'done';

            // Hide Native Loader
            const loader = document.getElementById('native-loader');
            if (loader) loader.style.display = 'none';
        },

        selectDoc(index) {
            this.selectedDocIndex = index;
            this.currentReport = this.reports[index];
            this.isLoupeActive = false;
            this.showHeatmap = false;
        },

        resetAnalysis() {
            this.state = 'idle';
            this.reports = [];
            this.currentReport = null;
            this.batchLogic = null;
        },

        formatEvidence(key) {
            return key.split('_').join(' ');
        },

        getEvidenceDesc(key) {
            const map = {
                'ELA_TAMPER_DETECTED': 'Incohérence des niveaux de compression détectée. Signe fort de retouche locale.',
                'METADATA_PRODUCER_MISSING': 'Les métadonnées d\'origine ont été effacées. Suspect pour un document officiel.',
                'PRODUCER_TOOL_DETECTED_PHOTOSHOP': 'Utilisation directe d\'un logiciel de retouche photo détectée.',
                'INTERNAL_CLONE_DETECTED': 'Détection de zones dupliquées à l\'identique (ex: tampon ou signature copiée).',
                'IBAN_INVALID': 'L\'IBAN mentionné ne respecte pas l\'algorithme de clé de contrôle (Modulo 97).',
                'TIME_PARADOX_DETECTED': 'La date du document est postérieure à la date système actuelle.',
                'TEMPLATE_PLACEHOLDER_DETECTED': 'Présence de balises non remplies (ex: {{NOM}}). Le document est un gabarit.',
                'FRAUD_MRZ_CHECKSUM_INVALID': 'La bande de lecture optique au bas du document contient des erreurs de calcul.'
            };
            return map[key] || 'Anomalie structurelle détectée par le moteur heuristique.';
        },

        // Loupe Logic
        moveMagnifier(e) {
            if (!this.isLoupeActive) return;
            const container = e.currentTarget;
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.magnifierStyle = {
                display: 'block',
                left: `${x - 60}px`,
                top: `${y - 60}px`,
                backgroundImage: `url(${this.showHeatmap ? this.heatmapUrl : this.previewUrl})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${rect.width * 3}px ${rect.height * 3}px`,
                backgroundPosition: `-${x * 3 - 60}px -${y * 3 - 60}px`
            };
        }
    }));
});
