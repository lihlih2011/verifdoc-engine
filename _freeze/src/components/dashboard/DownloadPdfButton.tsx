"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

interface DownloadPdfButtonProps {
  analysisId: number;
}

export const DownloadPdfButton = ({ analysisId }: DownloadPdfButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/report/analysis/${analysisId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport_verifdoc_${analysisId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Rapport PDF téléchargé avec succès !");
    } catch (e: any) {
      setError(e.message || "Une erreur est survenue lors du téléchargement du rapport.");
      toast.error(e.message || "Échec du téléchargement du rapport.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
      {error && (
        <Alert variant="destructive" className="mb-4 w-full max-w-sm">
          <AlertTitle>Erreur de téléchargement</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        onClick={handleDownload}
        disabled={isLoading}
        variant="outline"
        className="gap-2 transition-all duration-200 hover:scale-[1.02]"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Exportation...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Exporter le rapport PDF
          </>
        )}
      </Button>
    </div>
  );
};