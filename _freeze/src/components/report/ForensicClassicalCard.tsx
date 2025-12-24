"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScanText, Maximize } from "lucide-react";
import { HeatmapTabs } from "@/components/dashboard/HeatmapTabs"; // Reusing existing HeatmapTabs

interface ModuleScores {
  ocr: number;
  frdetr: number;
  diffusion: number;
  noiseprint: number;
  ela: number;
  copymove: number;
}

interface Explanation {
  ocr: string;
  visual: string;
  inpainting: string;
  ai_noise: string;
  compression: string;
  duplication: string;
}

interface Heatmaps {
  ela?: string;
  gan?: string; // This is noiseprint heatmap in backend
  copymove?: string;
  diffusion?: string;
}

interface ForensicClassicalCardProps {
  moduleScores: ModuleScores;
  explanation: Explanation;
  heatmaps?: Heatmaps;
}

export const ForensicClassicalCard = ({
  moduleScores,
  explanation,
  heatmaps,
}: ForensicClassicalCardProps) => {
  const [showElaHeatmap, setShowElaHeatmap] = useState(false);
  const [showNoisePrintHeatmap, setShowNoisePrintHeatmap] = useState(false);
  const [showCopyMoveHeatmap, setShowCopyMoveHeatmap] = useState(false);
  const [showDiffusionHeatmap, setShowDiffusionHeatmap] = useState(false);

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
          <p className="text-muted-foreground text-sm">Score: {(moduleScores.ela * 100).toFixed(1)}% - {explanation.compression}</p>
          {renderHeatmapViewer(heatmaps?.ela, "ELA", showElaHeatmap, setShowElaHeatmap)}
        </div>
        <Separator />
        <div>
          <p className="font-semibold">NoisePrint++ (Empreinte de bruit):</p>
          <p className="text-muted-foreground text-sm">Score: {(moduleScores.noiseprint * 100).toFixed(1)}% - {explanation.ai_noise}</p>
          {renderHeatmapViewer(heatmaps?.gan, "NoisePrint", showNoisePrintHeatmap, setShowNoisePrintHeatmap)}
        </div>
        <Separator />
        <div>
          <p className="font-semibold">Copy-Move Detection:</p>
          <p className="text-muted-foreground text-sm">Score: {(moduleScores.copymove * 100).toFixed(1)}% - {explanation.duplication}</p>
          {renderHeatmapViewer(heatmaps?.copymove, "Copy-Move", showCopyMoveHeatmap, setShowCopyMoveHeatmap)}
        </div>
        <Separator />
        <div>
          <p className="font-semibold">Diffusion Forensics (IA Générative):</p>
          <p className="text-muted-foreground text-sm">Score: {(moduleScores.diffusion * 100).toFixed(1)}% - {explanation.inpainting}</p>
          {renderHeatmapViewer(heatmaps?.diffusion, "Diffusion", showDiffusionHeatmap, setShowDiffusionHeatmap)}
        </div>
        <Separator />
        <div>
          <p className="font-semibold">FR-DETR (Localisation Visuelle):</p>
          <p className="text-muted-foreground text-sm">Score: {(moduleScores.frdetr * 100).toFixed(1)}% - {explanation.visual}</p>
        </div>
        <Separator />
        <div>
          <p className="font-semibold">OCR IA:</p>
          <p className="text-muted-foreground text-sm">Score: {(moduleScores.ocr * 100).toFixed(1)}% - {explanation.ocr}</p>
        </div>
      </CardContent>
    </Card>
  );
};