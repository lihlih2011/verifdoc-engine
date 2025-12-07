"use client";

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalysisResultDisplay } from "@/components/dashboard/AnalysisResultDisplay"; // New import

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
  heatmaps?: {
    ela?: string;
    gan?: string;
    copymove?: string;
    diffusion?: string;
  };
  integrity_hash?: string; // New field
  report_file_path?: string; // New field
}

const AnalysisDetailPage = () => {
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <Skeleton className="h-10 w-3/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full col-span-full" />
          </div>
          <Skeleton className="h-12 w-full mt-8" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  if (!analysis) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  // Pass all analysis data to the display component
  return <AnalysisResultDisplay analysis={analysis} />;
};

export default AnalysisDetailPage;