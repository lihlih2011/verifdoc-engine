"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Download,
  FileText,
  FlaskConical,
  AlertCircle,
  CheckCircle2,
  Hash,
  User,
  CalendarDays,
  HardDrive,
  Text,
  AlertTriangle,
  Image as ImageIcon,
  Copy,
  Waves,
  Sparkles,
  ImageMinus,
  ScanText,
  Loader2,
  ShieldCheck, // Added for integrity block
  ArrowLeft, // For back button
} from "lucide-react";
import { format } from "date-fns"; // For date formatting
import { fr } from "date-fns/locale"; // For French locale
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { HeatmapTabs } from "@/components/dashboard/HeatmapTabs";
import { DownloadPdfButton } from "@/components/dashboard/DownloadPdfButton";
import { Link } from "react-router-dom"; // For back button
import { Separator } from "@/components/ui/separator"; // For separator

// Define the expected input structure based on the prompt and backend tasks
interface AnalysisDetailResult {
  id: number;
  filename: string;
  forensic_score: number;
  risk_level: string;
  created_at: string;
  full_result: {
    forgery_score: number;
    risk_level: string;
    module_scores: {
      ocr: number;
      frdetr: number;
      diffusion: number;
      noiseprint: number;
      ela: number;
      copymove: number;
    };
    explanation: {
      ocr: string;
      visual: string;
      inpainting: string;
      ai_noise: string;
      compression: string;
      duplication: string;
      summary: string;
    };
    raw_output: string;
    record_id: number;
  };
  heatmaps?: {
    ela?: string;
    gan?: string;
    copymove?: string;
    diffusion?: string;
  };
  integrity_hash?: string; // New field
  report_file_path?: string; // New field
}

interface AnalysisResultDisplayProps {
  analysis: AnalysisDetailResult;
}

export const AnalysisResultDisplay = ({ analysis }: AnalysisResultDisplayProps) => {
  const [showRawJson, setShowRawJson] = useState(false);

  // New state for integrity verification
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<boolean | null>(null);
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const {
    id,
    filename,
    forensic_score,
    created_at,
    full_result,
    heatmaps,
    integrity_hash,
    report_file_path, // Not directly used here, but good to have
  } = analysis;
  const { module_scores, explanation } = full_result;

  const handleVerifyIntegrity = async () => {
    if (!id || !integrity_hash) {
      setVerificationError("Hash d'intégrité non disponible pour vérification.");
      return;
    }

    setIsVerifyingIntegrity(true);
    setVerificationError(null);
    setIntegrityStatus(null);
    setComputedHash(null);

    try {
      const response = await fetch(`http://localhost:8000/verify/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setIntegrityStatus(data.valid);
      setComputedHash(data.computedHash);
      toast.success(data.message);
    } catch (err: any) {
      setVerificationError(err.message || "Une erreur est survenue lors de la vérification de l'intégrité.");
      toast.error(err.message || "Échec de la vérification de l'intégrité.");
    } finally {
      setIsVerifyingIntegrity(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <Button asChild variant="outline">
          <Link to="/dashboard/history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'historique
          </Link>
        </Button>
        {/* Download PDF Button */}
        <DownloadPdfButton analysisId={id} />
      </div>

      {/* Header Summary */}
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Analyse de "{filename}"
            </CardTitle>
            <RiskBadge score={forensic_score} />
          </div>
          <CardDescription className="flex items-center gap-2 text-muted-foreground mt-2">
            <CalendarDays className="h-4 w-4" />
            Analysé le {format(new Date(created_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-lg font-medium">
            <span>Score global de falsification :</span>
            <span className="text-2xl font-extrabold text-foreground">
              {forensic_score}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Certification Box (from previous task) */}
      <Card className="mb-8 p-6 shadow-lg flex flex-col md:flex-row items-center justify-between bg-card border-border">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <CardTitle className="text-2xl font-bold text-foreground mb-2">
            Analyse certifiée – VerifDoc™
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Ce rapport est vérifié par nos moteurs d’analyse forensique.
          </CardDescription>
        </div>
        <img
          src="/verifdoc-seal.svg"
          alt="VerifDoc Certification Seal"
          className="h-24 w-24 md:h-32 md:w-32 flex-shrink-0"
        />
      </Card>

      {/* NEW: Integrity Block */}
      {integrity_hash && (
        <Card className="mb-8 p-6 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Sceau numérique d’intégrité
            </CardTitle>
            <CardDescription>
              Vérifiez l'authenticité et l'intégrité de ce rapport.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-lg font-medium mb-2">Hash SHA-256 du rapport :</p>
              <pre className="bg-muted text-sm rounded-md p-3 font-mono overflow-x-auto break-all">
                {integrity_hash}
              </pre>
            </div>
            {integrityStatus !== null && (
              <div className="flex items-center gap-2">
                {integrityStatus ? (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                    <ShieldCheck className="mr-1 h-4 w-4" /> Intégrité vérifiée
                  </Badge>
                ) : (
                  <Badge className="bg-red-500 hover:bg-red-600 text-white">
                    <AlertTriangle className="mr-1 h-4 w-4" /> Altération détectée
                  </Badge>
                )}
                {computedHash && !integrityStatus && (
                  <p className="text-sm text-muted-foreground">
                    Hash re-calculé: <span className="font-mono break-all">{computedHash}</span>
                  </p>
                )}
              </div>
            )}
            {verificationError && (
              <Alert variant="destructive">
                <AlertTitle>Erreur de vérification</AlertTitle>
                <AlertDescription>{verificationError}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={handleVerifyIntegrity}
              disabled={isVerifyingIntegrity}
              className="w-full"
            >
              {isVerifyingIntegrity ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification en cours...
                </>
              ) : (
                "Vérifier l’intégrité"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Fusion Engine Summary */}
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            Résumé du moteur de fusion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-lg font-medium mb-2">Interprétation du risque :</p>
            <p className="text-muted-foreground">{explanation.summary}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(explanation).map(([key, value]) => (
              key !== "summary" && (
                <div key={key} className="flex flex-col space-y-1">
                  <span className="font-semibold capitalize text-foreground">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="text-sm text-muted-foreground">{value as string}</span>
                </div>
              )
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Module-by-Module Results */}
      <h2 className="text-2xl font-bold text-foreground mb-6">Résultats détaillés par module</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>OCR IA</CardTitle>
            <CardDescription>Score: {(module_scores.ocr * 100).toFixed(1)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{explanation.ocr}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>FR-DETR (Falsification Visuelle)</CardTitle>
            <CardDescription>Score: {(module_scores.frdetr * 100).toFixed(1)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{explanation.visual}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Diffusion Forensics (IA Générative)</CardTitle>
            <CardDescription>Score: {(module_scores.diffusion * 100).toFixed(1)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{explanation.inpainting}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>GAN / NoisePrint++</CardTitle>
            <CardDescription>Score: {(module_scores.noiseprint * 100).toFixed(1)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{explanation.ai_noise}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ELA++ (Anomalies de Compression)</CardTitle>
            <CardDescription>Score: {(module_scores.ela * 100).toFixed(1)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{explanation.compression}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Copy-Move Detection</CardTitle>
            <CardDescription>Score: {(module_scores.copymove * 100).toFixed(1)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{explanation.duplication}</p>
          </CardContent>
        </Card>
      </div>

      {heatmaps && (
        <Card className="mt-8 p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-foreground mb-4">Heatmaps forensic</h2>
          <p className="text-muted-foreground mb-6">
            Ces cartes thermiques montrent les zones détectées comme potentiellement manipulées.
          </p>
          <HeatmapTabs heatmaps={heatmaps} />
        </Card>
      )}

      <Button
        variant="outline"
        className="w-full mt-8"
        onClick={() => setShowRawJson(!showRawJson)}
      >
        {showRawJson ? "Masquer JSON brut" : "Afficher JSON brut"}
      </Button>

      {showRawJson && (
        <pre className="mt-4 p-4 bg-muted rounded-md text-sm overflow-x-auto animate-in fade-in duration-300">
          {JSON.stringify(analysis, null, 2)}
        </pre>
      )}
    </div>
  );
};