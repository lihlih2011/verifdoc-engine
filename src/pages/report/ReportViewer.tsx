"use client";

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Download, FileCheck, ShieldCheck, Brain, Search, AlertTriangle, Fingerprint, CalendarDays, Hash, User, Building, Clock, Hourglass, Layers, Code, FileWarning, ScanText, Image as ImageIcon, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { DownloadPdfButton } from "@/components/dashboard/DownloadPdfButton";
import { SignatureCard } from "@/components/signature/SignatureCard";
import { EmbeddedObjectsCard } from "@/components/dashboard/EmbeddedObjectsCard";

// Reusing the AnalysisDetailResult interface from dashboard/analysis/[id].tsx
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
    mlAnalysis?: {
      efficientnet: { score: number, isForgery: boolean };
      resnet: { score: number, isForgery: boolean };
      vit: { score: number, isForgery: boolean };
      heatmap: string;
    };
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
  const [showMlHeatmap, setShowMlHeatmap] = useState(false);
  const [showElaHeatmap, setShowElaHeatmap] = useState(false);
  const [showNoisePrintHeatmap, setShowNoisePrintHeatmap] = useState(false);
  const [showCopyMoveHeatmap, setShowCopyMoveHeatmap] = useState(false);
  const [showDiffusionHeatmap, setShowDiffusionHeatmap] = useState(false);

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

  const renderHeatmapViewer = (imageUrl: string | undefined, label: string, showState: boolean, setShowState: (state: boolean) => void) => {
    if (!imageUrl) {
      return <p className="text-muted-foreground text-center p-4">Heatmap {label} non disponible.</p>;
    }
    return (
      <div className="flex flex-col items-center space-y-2 mt-4">
        <div className="flex items-center space-x-2">
          <Switch
            id={`show-${label.toLowerCase().replace(/\s/g, '-')}-heatmap`}
            checked={showState}
            onCheckedChange={setShowState}
          />
          <Label htmlFor={`show-${label.toLowerCase().replace(/\s/g, '-')}-heatmap`}>
            Afficher la heatmap {label}
          </Label>
        </div>
        {showState && (
          <div className="relative group w-full h-full flex items-center justify-center bg-muted/50 rounded-lg overflow-hidden border border-border mt-4">
            <img
              src={imageUrl}
              alt={`${label} Heatmap`}
              className="max-h-96 object-contain rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105 cursor-pointer"
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  aria-label={`View ${label} in fullscreen`}
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-screen-xl max-h-screen p-0 border-none bg-transparent">
                <img
                  src={imageUrl}
                  alt={`${label} Heatmap`}
                  className="w-full h-full object-contain"
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Header */}
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
                <FileCheck className="h-8 w-8 text-primary" />
                Rapport d’analyse
              </CardTitle>
              <img
                src="/verifdoc-seal.svg"
                alt="VerifDoc Certification Seal"
                className="h-20 w-20 flex-shrink-0"
              />
            </div>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              Résumé complet de l'analyse IA + Forensic pour "{analysis.filename}".
            </CardDescription>
            <CardDescription className="flex items-center gap-2 text-muted-foreground mt-2">
              <CalendarDays className="h-4 w-4" />
              Analysé le {format(new Date(analysis.created_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 1. Executive Summary */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              1. Résumé Exécutif
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-lg font-medium">
              <span>Verdict global:</span>
              <Badge className={cn("text-white px-3 py-1 text-base", {
                "bg-green-500": analysis.forensic_score < 40,
                "bg-orange-500": analysis.forensic_score >= 40 && analysis.forensic_score <= 70,
                "bg-red-500": analysis.forensic_score > 70,
              })}>
                {getFinalVerdict(analysis.forensic_score)}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-lg font-medium">
              <span>Score de suspicion:</span>
              <span className="text-2xl font-extrabold text-foreground">
                {analysis.forensic_score}%
              </span>
            </div>
            <div className="flex items-center justify-between text-lg font-medium">
              <span>Niveau de confiance:</span>
              <span className="text-foreground">
                {getConfidenceLevel(analysis.forensic_score)}
              </span>
            </div>
            <Separator />
            <div>
              <p className="text-lg font-medium mb-2">Interprétation du risque :</p>
              <p className="text-muted-foreground">{explanation.summary}</p>
            </div>
            <Separator />
            <div>
              <p className="text-lg font-medium mb-2">Modèles IA utilisés :</p>
              <ul className="list-disc list-inside text-muted-foreground text-sm">
                <li>EfficientNet-B0, ResNet50, ViT-B16 (pour l'analyse ML)</li>
                <li>Donut/Nougat (pour l'OCR)</li>
                <li>FR-DETR (pour la localisation visuelle)</li>
                <li>Diffusion Forensics (pour les altérations génératives)</li>
                <li>NoisePrint++ (pour les empreintes GAN)</li>
                <li>ELA++ (pour les anomalies de compression)</li>
                <li>Copy-Move (pour les duplications internes)</li>
              </ul>
            </div>
            <div>
              <p className="text-lg font-medium mb-2">Validité cryptographique :</p>
              <Badge className={cn("text-white px-3 py-1 text-sm", {
                "bg-green-500": signature_info?.hasSignature && signature_info.signatureInfo?.isValid,
                "bg-red-500": signature_info?.hasSignature && !signature_info.signatureInfo?.isValid,
                "bg-gray-500": !signature_info?.hasSignature,
              })}>
                {signature_info?.hasSignature ? (signature_info.signatureInfo?.isValid ? "Valide" : "Invalide") : "Non signée"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 2. AI Analysis Section */}
        {mlAnalysis && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                2. Analyse par Intelligence Artificielle (ML)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="font-semibold">EfficientNet-B0:</span>
                  <span className="text-muted-foreground">{(mlAnalysis.efficientnet.score * 100).toFixed(2)}% ({mlAnalysis.efficientnet.isForgery ? "Falsifié" : "Authentique"})</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">ResNet50:</span>
                  <span className="text-muted-foreground">{(mlAnalysis.resnet.score * 100).toFixed(2)}% ({mlAnalysis.resnet.isForgery ? "Falsifié" : "Authentique"})</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">ViT-B16:</span>
                  <span className="text-muted-foreground">{(mlAnalysis.vit.score * 100).toFixed(2)}% ({mlAnalysis.vit.isForgery ? "Falsifié" : "Authentique"})</span>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-lg font-medium mb-2">Verdict IA global :</p>
                <Badge className={cn("text-white px-3 py-1 text-base", {
                  "bg-red-500": mlAnalysis.efficientnet.isForgery || mlAnalysis.resnet.isForgery || mlAnalysis.vit.isForgery,
                  "bg-green-500": !(mlAnalysis.efficientnet.isForgery || mlAnalysis.resnet.isForgery || mlAnalysis.vit.isForgery),
                })}>
                  {mlAnalysis.efficientnet.isForgery || mlAnalysis.resnet.isForgery || mlAnalysis.vit.isForgery ? "Suspect" : "Authentique"}
                </Badge>
              </div>
              {renderHeatmapViewer(mlAnalysis.heatmap, "ML Forgery", showMlHeatmap, setShowMlHeatmap)}
            </CardContent>
          </Card>
        )}

        {/* 3. Forensic Classical Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <ScanText className="h-6 w-6 text-primary" />
              3. Analyse Forensic Classique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="font-semibold">ELA++ (Anomalies de Compression):</p>
              <p className="text-muted-foreground text-sm">Score: {(module_scores.ela * 100).toFixed(1)}% - {explanation.compression}</p>
              {renderHeatmapViewer(heatmaps?.ela, "ELA", showElaHeatmap, setShowElaHeatmap)}
            </div>
            <Separator />
            <div>
              <p className="font-semibold">NoisePrint++ (Empreinte de bruit):</p>
              <p className="text-muted-foreground text-sm">Score: {(module_scores.noiseprint * 100).toFixed(1)}% - {explanation.ai_noise}</p>
              {renderHeatmapViewer(heatmaps?.gan, "NoisePrint", showNoisePrintHeatmap, setShowNoisePrintHeatmap)}
            </div>
            <Separator />
            <div>
              <p className="font-semibold">Copy-Move Detection:</p>
              <p className="text-muted-foreground text-sm">Score: {(module_scores.copymove * 100).toFixed(1)}% - {explanation.duplication}</p>
              {renderHeatmapViewer(heatmaps?.copymove, "Copy-Move", showCopyMoveHeatmap, setShowCopyMoveHeatmap)}
            </div>
            <Separator />
            <div>
              <p className="font-semibold">Diffusion Forensics (IA Générative):</p>
              <p className="text-muted-foreground text-sm">Score: {(module_scores.diffusion * 100).toFixed(1)}% - {explanation.inpainting}</p>
              {renderHeatmapViewer(heatmaps?.diffusion, "Diffusion", showDiffusionHeatmap, setShowDiffusionHeatmap)}
            </div>
            <Separator />
            <div>
              <p className="font-semibold">FR-DETR (Localisation Visuelle):</p>
              <p className="text-muted-foreground text-sm">Score: {(module_scores.frdetr * 100).toFixed(1)}% - {explanation.visual}</p>
            </div>
            <Separator />
            <div>
              <p className="font-semibold">OCR IA:</p>
              <p className="text-muted-foreground text-sm">Score: {(module_scores.ocr * 100).toFixed(1)}% - {explanation.ocr}</p>
            </div>
          </CardContent>
        </Card>

        {/* 4. Cryptographic Signature Section */}
        {signature_info && <SignatureCard signature={signature_info} />}

        {/* 5. SHA-256 Integrity Section */}
        <Card className="mb-8 p-6 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Hash className="h-6 w-6 text-primary" />
              5. Sceau numérique d’intégrité (SHA-256)
            </CardTitle>
            <CardDescription>
              Hash SHA-256 du rapport généré pour vérifier son intégrité.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-lg font-medium mb-2">Hash SHA-256 du rapport :</p>
              <pre className="bg-muted text-sm rounded-md p-3 font-mono overflow-x-auto break-all">
                {analysis.integrity_hash || "Non disponible"}
              </pre>
            </div>
            <div className="flex items-center gap-2">
              {analysis.integrity_hash ? (
                <Badge className="bg-green-500 hover:bg-green-600 text-white">
                  <ShieldCheck className="mr-1 h-4 w-4" /> Intégrité vérifiable
                </Badge>
              ) : (
                <Badge className="bg-gray-500 hover:bg-gray-600 text-white">
                  <AlertTriangle className="mr-1 h-4 w-4" /> Non généré
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 6. Structural Analysis (Embedded Objects) */}
        {embedded_objects_info && <EmbeddedObjectsCard embeddedObjects={embedded_objects_info.embeddedObjects} />}

        {/* 7. Final Verdict Section */}
        <Card className="mb-8 p-6 shadow-lg bg-gradient-to-br from-primary/5 to-background border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold flex items-center gap-3 text-primary">
              <FileCheck className="h-8 w-8" />
              7. Verdict Final
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-xl font-bold">
              <span>Statut du document :</span>
              <Badge className={cn("text-white px-4 py-2 text-lg", {
                "bg-green-600": analysis.forensic_score < 40,
                "bg-orange-600": analysis.forensic_score >= 40 && analysis.forensic_score <= 70,
                "bg-red-600": analysis.forensic_score > 70,
              })}>
                {getFinalVerdict(analysis.forensic_score)}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-lg font-medium">
              <span>Niveau de confiance :</span>
              <span className="text-foreground text-xl">
                {getConfidenceLevel(analysis.forensic_score)}
              </span>
            </div>
            <Separator />
            <div>
              <p className="text-lg font-medium mb-2">Notes techniques du moteur :</p>
              <p className="text-muted-foreground text-base">{explanation.summary}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ReportViewer;