"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutiveSummaryCardProps {
  forensicScore: number;
  summaryExplanation: string;
  hasSignature: boolean;
  isSignatureValid?: boolean;
  getFinalVerdict: (score: number) => string;
  getConfidenceLevel: (score: number) => string;
}

export const ExecutiveSummaryCard = ({
  forensicScore,
  summaryExplanation,
  hasSignature,
  isSignatureValid,
  getFinalVerdict,
  getConfidenceLevel,
}: ExecutiveSummaryCardProps) => {
  return (
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
            "bg-green-500": forensicScore < 40,
            "bg-orange-500": forensicScore >= 40 && forensicScore <= 70,
            "bg-red-500": forensicScore > 70,
          })}>
            {getFinalVerdict(forensicScore)}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-lg font-medium">
          <span>Score de suspicion:</span>
          <span className="text-2xl font-extrabold text-foreground">
            {forensicScore}%
          </span>
        </div>
        <div className="flex items-center justify-between text-lg font-medium">
          <span>Niveau de confiance:</span>
          <span className="text-foreground">
            {getConfidenceLevel(forensicScore)}
          </span>
        </div>
        <Separator />
        <div>
          <p className="text-lg font-medium mb-2">Interprétation du risque :</p>
          <p className="text-muted-foreground">{summaryExplanation}</p>
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
            "bg-green-500": hasSignature && isSignatureValid,
            "bg-red-500": hasSignature && !isSignatureValid,
            "bg-gray-500": !hasSignature,
          })}>
            {hasSignature ? (isSignatureValid ? "Valide" : "Invalide") : "Non signée"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};