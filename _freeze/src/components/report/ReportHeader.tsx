"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileCheck, ArrowLeft, CalendarDays } from "lucide-react";
import { DownloadPdfButton } from "@/components/dashboard/DownloadPdfButton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ReportHeaderProps {
  analysisId: number;
  filename: string;
  createdAt: string;
}

export const ReportHeader = ({ analysisId, filename, createdAt }: ReportHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Button asChild variant="outline">
          <Link to="/dashboard/history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'historique
          </Link>
        </Button>
        <DownloadPdfButton analysisId={analysisId} />
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
            Résumé complet de l'analyse IA + Forensic pour "{filename}".
          </CardDescription>
          <CardDescription className="flex items-center gap-2 text-muted-foreground mt-2">
            <CalendarDays className="h-4 w-4" />
            Analysé le {format(new Date(createdAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
          </CardDescription>
        </CardHeader>
      </Card>
    </>
  );
};