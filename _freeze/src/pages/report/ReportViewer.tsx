"use client";

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Import new modular components
import { ReportHeader } from "@/components/report/ReportHeader";
import { ExecutiveSummaryCard } from "@/components/report/ExecutiveSummaryCard";
import { AiAnalysisCard } from "@/components/report/AiAnalysisCard";
import { ForensicClassicalCard } from "@/components/report/ForensicClassicalCard";
import { IntegrityHashCard } from "@/components/report/IntegrityHashCard";
import { FinalVerdictCard } from "@/components/report/FinalVerdictCard";

// Reusing existing modular components
import { SignatureCard } from "@/components/signature/SignatureCard";
import { EmbeddedObjectsCard } from "@/components/dashboard/EmbeddedObjectsCard";

// Define interfaces for data structure
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

interface MlAnalysisResult {
  efficientnet: { score: number, isForgery: boolean };
  resnet: { score: number, isForgery: boolean };
  vit: { score: number, isForgery: boolean };
  heatmap: string;
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
      signature: number;
      embedded_objects: number;
    };
    explanation: {
      ocr: string;
      visual: string;
      inpainting: string;
      ai_noise: string;
      compression: string;
      duplication: string;
      signature: string;
      embedded_objects: string;
      summary: string;
    };
    mlAnalysis?: MlAnalysisResult;
    raw_output: string;
    record_id: number;
  };
  heatmaps?: {
    ela?: string;
    gan?: string; // This is noiseprint heatmap in backend
    copymove?: string;
    diffusion?: string;
    mlForgery?: string; // NEW: ML forgery heatmap
  };
  integrity_hash?: string;
  report_file_path?: string;
  signature_info?: SignatureInfo;
  embedded_objects_info?: EmbeddedObjectsInfo;
}

const ReportViewer = () => {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<AnalysisDetailResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const getConfidenceLevel = (score: number) => {
    if (score < 40) return "Élevée";
    if (score >= 40 && score <= 70) return "Moyenne";
    return "Élevée";
  };

  const getFinalVerdict = (score: number) => {
    if (score < 40) return "Authentique";
    if (score >= 40 && score <= 70) return "Suspect";
    return "Falsifié";
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4 max-w-5xl">
          <Skeleton className="h-10 w-3/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full col-span-full" />
          </div>
          <Skeleton className="h-12 w-full mt-8" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4 max-w-5xl">
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
      </MainLayout>
    );
  }

  if (!analysis) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4 max-w-5xl">
          <Alert variant="destructive">
            <AlertTitle>Analyse introuvable</AlertTitle>
            <AlertDescription>
              Le rapport avec l'ID "{id}" n'a pas pu être chargé.
            </AlertDescription>
          </Alert>
          <Button asChild className="mt-6">
            <Link to="/dashboard/history">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'historique
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const { full_result, heatmaps, signature_info, embedded_objects_info } = analysis;
  const { mlAnalysis, module_scores, explanation } = full_result;

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <ReportHeader
          analysisId={analysis.id}
          filename={analysis.filename}
          createdAt={analysis.created_at}
        />

        <ExecutiveSummaryCard
          forensicScore={analysis.forensic_score}
          summaryExplanation={explanation.summary}
          hasSignature={signature_info?.hasSignature || false}
          isSignatureValid={signature_info?.signatureInfo?.isValid}
          getFinalVerdict={getFinalVerdict}
          getConfidenceLevel={getConfidenceLevel}
        />

        {mlAnalysis && <AiAnalysisCard mlAnalysis={mlAnalysis} />}

        <ForensicClassicalCard
          moduleScores={module_scores}
          explanation={explanation}
          heatmaps={heatmaps}
        />

        {signature_info && <SignatureCard signature={signature_info} />}

        <IntegrityHashCard integrityHash={analysis.integrity_hash} />

        {embedded_objects_info && <EmbeddedObjectsCard embeddedObjects={embedded_objects_info.embeddedObjects} />}

        <FinalVerdictCard
          forensicScore={analysis.forensic_score}
          summaryExplanation={explanation.summary}
          getFinalVerdict={getFinalVerdict}
          getConfidenceLevel={getConfidenceLevel}
        />
      </div>
    </MainLayout>
  );
};

export default ReportViewer;