"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, History as HistoryIcon } from "lucide-react";
import { AnalysisTable } from "@/components/dashboard/AnalysisTable";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalysisRecord {
  id: number;
  filename: string;
  forensic_score: number;
  risk_level: string;
  created_at: string;
}

const HistoryPage = () => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysisHistory = async () => {
      try {
        const response = await fetch("http://localhost:8000/analysis/list");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: AnalysisRecord[] = await response.json();
        setAnalyses(data);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue lors du chargement de l'historique.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisHistory();
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground mb-3">
            Historique des analyses
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Retrouvez toutes vos analyses de documents et leurs résultats détaillés.
          </p>
        </div>

        <Card className="max-w-5xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HistoryIcon className="h-6 w-6 text-primary" />
              Vos dernières analyses
            </CardTitle>
            <CardDescription>
              Les 50 analyses les plus récentes sont affichées ici.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <AnalysisTable analyses={analyses} />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default HistoryPage;