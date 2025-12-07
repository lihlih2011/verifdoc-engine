"use client";

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileText, CalendarDays, FlaskConical, ArrowLeft } from "lucide-react";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

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
}

const AnalysisDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<AnalysisDetailResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

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
        <div className="container mx-auto py-8 px-4 max-w-4xl">
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
      </MainLayout>
    );
  }

  if (!analysis) {
    return (
      <MainLayout>
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
      </MainLayout>
    );
  }

  const { filename, forensic_score, created_at, full_result } = analysis;
  const { module_scores, explanation } = full_result;

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Button asChild variant="outline" className="mb-6">
          <Link to="/dashboard/history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'historique
          </Link>
        </Button>

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

        {/* Heatmap Placeholders */}
        <h2 className="text-2xl font-bold text-foreground mb-6">Visualisations (Heatmaps)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="flex items-center justify-center h-48 bg-muted/50 border-dashed border-2 border-border text-muted-foreground">
            Heatmap OCR non encore générée
          </Card>
          <Card className="flex items-center justify-center h-48 bg-muted/50 border-dashed border-2 border-border text-muted-foreground">
            Heatmap FR-DETR non encore générée
          </Card>
          <Card className="flex items-center justify-center h-48 bg-muted/50 border-dashed border-2 border-border text-muted-foreground">
            Heatmap Diffusion Forensics non encore générée
          </Card>
          <Card className="flex items-center justify-center h-48 bg-muted/50 border-dashed border-2 border-border text-muted-foreground">
            Heatmap GAN / NoisePrint non encore générée
          </Card>
          <Card className="flex items-center justify-center h-48 bg-muted/50 border-dashed border-2 border-border text-muted-foreground">
            Heatmap ELA non encore générée
          </Card>
          <Card className="flex items-center justify-center h-48 bg-muted/50 border-dashed border-2 border-border text-muted-foreground">
            Heatmap Copy-Move non encore générée
          </Card>
        </div>

        {/* JSON Debug Toggle */}
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
    </MainLayout>
  );
};

export default AnalysisDetailPage;