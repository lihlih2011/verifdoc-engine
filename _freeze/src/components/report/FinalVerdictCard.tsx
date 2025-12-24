"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinalVerdictCardProps {
  forensicScore: number;
  summaryExplanation: string;
  getFinalVerdict: (score: number) => string;
  getConfidenceLevel: (score: number) => string;
}

export const FinalVerdictCard = ({
  forensicScore,
  summaryExplanation,
  getFinalVerdict,
  getConfidenceLevel,
}: FinalVerdictCardProps) => {
  return (
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
            "bg-green-600": forensicScore < 40,
            "bg-orange-600": forensicScore >= 40 && forensicScore <= 70,
            "bg-red-600": forensicScore > 70,
          })}>
            {getFinalVerdict(forensicScore)}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-lg font-medium">
          <span>Niveau de confiance :</span>
          <span className="text-foreground text-xl">
            {getConfidenceLevel(forensicScore)}
          </span>
        </div>
        <Separator />
        <div>
          <p className="text-lg font-medium mb-2">Notes techniques du moteur :</p>
          <p className="text-muted-foreground text-base">{summaryExplanation}</p>
        </div>
      </CardContent>
    </Card>
  );
};