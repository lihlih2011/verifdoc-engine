"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
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
} from "lucide-react";

// Define the expected input structure based on the prompt and backend tasks
interface AnalysisResultProps {
  globalScore: number;
  indicators: string[];
  summary: string;
  heatmaps: {
    ela?: string;
    noiseprint?: string;
    copymove?: string;
  };
  raw: {
    ela?: { score: number; heatmap?: string };
    noiseprint?: { score: number; heatmap?: string };
    copymove?: { score: number; heatmap?: string };
    ocr?: {
      score: number;
      anomalies: string[];
      rawText: string;
      dates: string[];
      numbers: string[];
      names: string[];
    };
  };
  filename: string;
  size: number;
  type: string;
  uploadedAt: string;
}

const ResultatAnalyse = ({
  globalScore,
  indicators,
  summary,
  heatmaps,
  raw,
  filename,
  size,
  type,
  uploadedAt,
}: AnalysisResultProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const getIndicatorBadgeColor = (indicator: string) => {
    if (indicator.includes("forte anomalie") || indicator.includes("Incohérences PRNU") || indicator.includes("Régions clonées")) {
      return "bg-red-500 hover:bg-red-600"; // Anomalies graves
    }
    if (indicator.includes("Anomalies logiques OCR")) {
      return "bg-orange-500 hover:bg-orange-600"; // Anomalies modérées
    }
    return "bg-green-500 hover:bg-green-600"; // Aucun problème (default, though not explicitly requested for positive indicators)
  };

  const handleExportPdf = () => {
    setIsDownloading(true);
    toast.info("Génération du rapport PDF en cours...");
    // Placeholder for actual PDF generation/download logic
    setTimeout(() => {
      toast.success("Rapport PDF exporté avec succès ! (Fonctionnalité complète à implémenter)");
      setIsDownloading(false);
    }, 2000);
  };

  // Helper for file size formatting
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground mb-3">
            Résultat de l’analyse
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Synthèse complète de l’examen forensic VerifDoc™.
          </p>
        </div>

        {/* Global Score and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1 flex flex-col items-center justify-center p-6 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-semibold text-foreground">
                Score global VerifDoc™
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-0">
              <div
                className="relative w-32 h-32 rounded-full flex items-center justify-center text-2xl font-bold text-primary"
                style={{
                  background: `radial-gradient(closest-side, var(--card) 79%, transparent 80% 100%), conic-gradient(var(--primary) ${globalScore}%, var(--muted) 0)`,
                  border: '4px solid var(--border)',
                }}
              >
                {globalScore}%
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 p-6 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-center gap-2">
                <FlaskConical className="h-6 w-6 text-primary" />
                Résumé de l’analyse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-base leading-relaxed">
                {summary}
              </p>
              {indicators.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Indicateurs clés :</h3>
                  <div className="flex flex-wrap gap-2">
                    {indicators.map((indicator, index) => (
                      <Badge key={index} className={cn("text-white px-3 py-1 text-sm", getIndicatorBadgeColor(indicator))}>
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Heatmaps Section */}
        <h2 className="text-3xl font-bold text-foreground mb-6 mt-12">Heatmaps forensic</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Ces cartes thermiques montrent les zones détectées comme potentiellement manipulées par chaque module d'analyse.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-4 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <ImageMinus className="h-5 w-5 text-primary" /> ELA Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64 bg-muted/50 rounded-md overflow-hidden">
              {heatmaps.ela ? (
                <img src={heatmaps.ela} alt="ELA Heatmap" className="max-h-full object-contain" />
              ) : (
                <p className="text-muted-foreground">Non disponible</p>
              )}
            </CardContent>
          </Card>

          <Card className="p-4 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Waves className="h-5 w-5 text-primary" /> NoisePrint Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64 bg-muted/50 rounded-md overflow-hidden">
              {heatmaps.noiseprint ? (
                <img src={heatmaps.noiseprint} alt="NoisePrint Heatmap" className="max-h-full object-contain" />
              ) : (
                <p className="text-muted-foreground">Non disponible</p>
              )}
            </CardContent>
          </Card>

          <Card className="p-4 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Copy className="h-5 w-5 text-primary" /> Copy-Move Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64 bg-muted/50 rounded-md overflow-hidden">
              {heatmaps.copymove ? (
                <img src={heatmaps.copymove} alt="Copy-Move Heatmap" className="max-h-full object-contain" />
              ) : (
                <p className="text-muted-foreground">Non disponible</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* OCR Section */}
        {raw.ocr && (
          <Card className="mb-8 p-6 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-center gap-2">
                <ScanText className="h-6 w-6 text-primary" />
                Analyse OCR & Sémantique
              </CardTitle>
              <CardDescription>Score OCR: {raw.ocr.score?.toFixed(1)}%</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="raw-text">
                  <AccordionTrigger className="text-lg font-medium text-foreground hover:no-underline">
                    Texte extrait
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm whitespace-pre-wrap">
                    {raw.ocr.rawText || "Aucun texte extrait."}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {raw.ocr.dates.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-2">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" /> Dates détectées
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {raw.ocr.dates.map((date, index) => (
                      <Badge key={index} variant="secondary">{date}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {raw.ocr.numbers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-2">
                    <Hash className="h-5 w-5 text-muted-foreground" /> Numéros détectés
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {raw.ocr.numbers.map((num, index) => (
                      <Badge key={index} variant="secondary">{num}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {raw.ocr.names.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-muted-foreground" /> Noms/Entités détectés
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {raw.ocr.names.map((name, index) => (
                      <Badge key={index} variant="secondary">{name}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {raw.ocr.anomalies.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" /> Anomalies OCR
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                    {raw.ocr.anomalies.map((anomaly, index) => (
                      <li key={index}>{anomaly}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Metadata Section */}
        <Card className="mb-8 p-6 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl flex items-center gap-2">
              <HardDrive className="h-6 w-6 text-primary" />
              Métadonnées du document
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground text-base">
            <div>
              <span className="font-semibold text-foreground">Nom du fichier :</span> {filename}
            </div>
            <div>
              <span className="font-semibold text-foreground">Taille :</span> {formatBytes(size)}
            </div>
            <div>
              <span className="font-semibold text-foreground">Type :</span> {type}
            </div>
            <div>
              <span className="font-semibold text-foreground">Date d'upload :</span>{" "}
              {new Date(uploadedAt).toLocaleString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end mt-8">
          <Button onClick={handleExportPdf} disabled={isDownloading} className="gap-2">
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exportation...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exporter le rapport PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResultatAnalyse;