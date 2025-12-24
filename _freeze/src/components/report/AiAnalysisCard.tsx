"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Brain, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";

interface MlAnalysisResult {
  efficientnet: { score: number, isForgery: boolean };
  resnet: { score: number, isForgery: boolean };
  vit: { score: number, isForgery: boolean };
  heatmap: string;
}

interface AiAnalysisCardProps {
  mlAnalysis?: MlAnalysisResult;
}

export const AiAnalysisCard = ({ mlAnalysis }: AiAnalysisCardProps) => {
  const [showMlHeatmap, setShowMlHeatmap] = useState(false);

  if (!mlAnalysis) {
    return null; // Or a placeholder card indicating no ML analysis
  }

  const isGlobalAiForgery = mlAnalysis.efficientnet.isForgery || mlAnalysis.resnet.isForgery || mlAnalysis.vit.isForgery;

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
            "bg-red-500": isGlobalAiForgery,
            "bg-green-500": !isGlobalAiForgery,
          })}>
            {isGlobalAiForgery ? "Suspect" : "Authentique"}
          </Badge>
        </div>
        {renderHeatmapViewer(mlAnalysis.heatmap, "ML Forgery", showMlHeatmap, setShowMlHeatmap)}
      </CardContent>
    </Card>
  );
};