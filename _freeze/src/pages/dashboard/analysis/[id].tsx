"use client";

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalysisResultDisplay } from "@/components/dashboard/AnalysisResultDisplay";
import { SignatureCard } from "@/components/signature/SignatureCard";
import { EmbeddedObjectsCard } from "@/components/dashboard/EmbeddedObjectsCard"; // NEW IMPORT
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Re-import for clarity
import { RiskBadge } from "@/components/dashboard/RiskBadge"; // Re-import for clarity
import { DownloadPdfButton } from "@/components/dashboard/DownloadPdfButton"; // Re-import for clarity
import { Separator } from "@/components/ui/separator"; // Re-import for clarity
import { HeatmapTabs } from "@/components/dashboard/HeatmapTabs"; // Re-import for clarity
import {
  FileText,
  FlaskConical,
  ShieldCheck,
  CalendarDays,
} from "lucide-react"; // Re-import for clarity
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SignatureInfo {
  hasSignature: boolean;
  signatureInfo?: {
    subject: string;
    issuer: string;
    serialNumber: string;
    validity: {
      notBefore: string;
      notAfter: string;
    };
    isValid: boolean;
    reason: string;
    timestamp: string;
    tsaIssuer: string;
    tsaValidity: string;
    ocspStatus: string;
  };
}

interface EmbeddedObject {
  objectId: string;
  type: string;
  subtype?: string;
  length?: number;
  compression?: string;
  suspicious: boolean;
  reason?: string;
  preview?: string;
  entropy?: number;
}

interface EmbeddedObjectsInfo {
  embeddedObjects: EmbeddedObject[];
}

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
      signature: number; // Added signature score
      embedded_objects: number; // NEW: Added embedded objects score
    };
    explanation: {
      ocr: string;
      visual: string;
      inpainting: string;
      ai_noise: string;
      compression: string;
      duplication: string;
      signature: string; // Added signature explanation
      embedded_objects: string; // NEW: Added embedded objects explanation
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
  integrity_hash?: string;
  report_file_path?: string;
  signature_info?: SignatureInfo;
  embedded_objects_info?: EmbeddedObjectsInfo; // NEW FIELD
}

const AnalysisDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<AnalysisDetailResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false); // State for raw JSON toggle

  useEffect(() => {
    const fetchAnalysisDetail = async () => {
      if (!id) {
        setError("ID d'analyse manquant.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:8000/analysis/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: AnalysisDetailResult = await response.json();
        setAnalysis(data);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue lors du chargement des détails de l'analyse.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisDetail();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <Skeleton className="h-10 w-3/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full col-span-full" />
          </div>
          <Skeleton className="h-12 w-full mt-8" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button asChild className="mt-6">
            <Link to="/dashboard/history">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'historique
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!analysis) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <Alert variant="destructive">
            <AlertTitle>Analyse introuvable</AlertTitle>
            <AlertDescription>
              L'analyse avec l'ID "{id}" n'a pas pu être chargée.
            </AlertDescription>
          </Alert>
          <Button asChild className="mt-6">
            <Link to="/dashboard/history">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'historique
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <Button asChild variant="outline">
          <Link to="/dashboard/history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'historique
          </Link>
        </Button>
        <DownloadPdfButton analysisId={analysis.id} />
      </div>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Analyse de "{analysis.filename}"
            </CardTitle>
            <RiskBadge score={analysis.forensic_score} />
          </div>
          <CardDescription className="flex items-center gap-2 text-muted-foreground mt-2">
            <CalendarDays className="h-4 w-4" />
            Analysé le {format(new Date(analysis.created_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-lg font-medium">
            <span>Score global de falsification :</span>
            <span className="text-2xl font-extrabold text-foreground">
              {analysis.forensic_score}%
            </span>
          </div>
        </CardContent>
      </Card>

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

      {analysis.integrity_hash && (
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
                {analysis.integrity_hash}
              </pre>
            </div>
            <Button
              // This button's logic is handled by AnalysisResultDisplay,
              // but it's duplicated here for the sake of the prompt's structure.
              // In a real app, you'd likely pass a handler or use a shared component.
              className="w-full"
            >
              Vérifier l’intégrité
            </Button>
          </CardContent>
        </Card>
      )}

      {analysis.signature_info && analysis.signature_info.hasSignature && (
        <SignatureCard signature={analysis.signature_info} />
      )}

      {/* NEW: Embedded Objects Card */}
      {analysis.embedded_objects_info && analysis.embedded_objects_info.embeddedObjects && (
        <EmbeddedObjectsCard embeddedObjects={analysis.embedded_objects_info.embeddedObjects} />
      )}

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
            <p className="text-muted-foreground">{analysis.full_result.explanation.summary}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(analysis.full_result.explanation).map(([key, value]) => (
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

      <h2 className="text-2xl font-bold text-foreground mb-6">Résultats détaillés par module</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>OCR IA</CardTitle>
            <CardDescription>Score: {(analysis.full_result.module_scores.ocr * 100).toFixed(1)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.full_result.explanation.ocr}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>FR-DETR (Falsification Visuelle)</CardTitle>
            <CardDescription>Score: {(analysis.full_result.module_scores.frdetr * 100).toFixed(1)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.full_result.explanation.visual}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Diffusion Forensics (IA Générative)</CardTitle>
            <CardDescription>Score: {(analysis.full_result.module_scores.diffusion * 100).toFixed(1)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.full_result.explanation.inpainting}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>GAN / NoisePrint++</CardTitle>
            <CardDescription>Score: {(analysis.full_result.module_scores.noiseprint * 100).toFixed(1)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.full_result.explanation.ai_noise}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ELA++ (Anomalies de Compression)</CardTitle>
            <CardDescription>Score: {(analysis.full_result.module_scores.ela * 100).toFixed(1)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.full_result.explanation.compression}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Copy-Move Detection</CardTitle>
            <CardDescription>Score: {(analysis.full_result.module_scores.copymove * 100).toFixed(1)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.full_result.explanation.duplication}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Signature Numérique</CardTitle>
            <CardDescription>Score: {(analysis.full_result.module_scores.signature * 100).toFixed(1)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.full_result.explanation.signature}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Objets Intégrés</CardTitle>
            <CardDescription>Score: {(analysis.full_result.module_scores.embedded_objects * 100).toFixed(1)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.full_result.explanation.embedded_objects}</p>
          </CardContent>
        </Card>
      </div>

      {analysis.heatmaps && (
        <Card className="mt-8 p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-foreground mb-4">Heatmaps forensic</h2>
          <p className="text-muted-foreground mb-6">
            Ces cartes thermiques montrent les zones détectées comme potentiellement manipulées.
          </p>
          <HeatmapTabs heatmaps={analysis.heatmaps} />
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

export default AnalysisDetailPage;