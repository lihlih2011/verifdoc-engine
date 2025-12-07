"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, CheckCircle2, BarChart2, ShieldCheck, AlertTriangle, Link as LinkIcon } from "lucide-react"; // Added ShieldCheck, AlertTriangle, LinkIcon
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

interface RecentAnalysisRecord {
  id: number;
  filename: string;
  forensic_score: number;
  risk_level: string;
  created_at: string;
  integrity_hash?: string; // New field
}

const DashboardHome = () => {
  const stats = [
    {
      title: "Analyses réalisées ce mois",
      value: "124",
      description: "+15% par rapport au mois dernier",
      icon: <BarChart2 className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Total des analyses",
      value: "1 289",
      description: "Depuis la création de votre compte",
      icon: <FileText className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Taux de conformité détectée",
      value: "92%",
      description: "Documents jugés authentiques",
      icon: <CheckCircle2 className="h-5 w-5 text-muted-foreground" />,
    },
  ];

  // This `recentAnalyses` array is static, I will keep it for the table,
  // but fetch dynamic data for the new widget.
  const recentAnalyses = [
    {
      document: "Facture_Orange_2023.pdf",
      date: "2024-07-20",
      status: "Terminé",
      score: 15,
    },
    {
      document: "Contrat_Client_XYZ.jpg",
      date: "2024-07-18",
      status: "Terminé",
      score: 65,
    },
    {
      document: "Passeport_Dupont.png",
      date: "2024-07-15",
      status: "Terminé",
      score: 88,
    },
  ];

  const [recentAnalysesForWidget, setRecentAnalysesForWidget] = useState<RecentAnalysisRecord[]>([]);
  const [loadingRecentAnalysesForWidget, setLoadingRecentAnalysesForWidget] = useState(true);
  const [errorRecentAnalysesForWidget, setErrorRecentAnalysesForWidget] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentAnalyses = async () => {
      try {
        const response = await fetch("http://localhost:8000/analysis/list");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: RecentAnalysisRecord[] = await response.json();
        setRecentAnalysesForWidget(data.slice(0, 5)); // Get last 5 for the widget
      } catch (err: any) {
        setErrorRecentAnalysesForWidget(err.message || "Failed to load recent analyses for widget.");
      } finally {
        setLoadingRecentAnalysesForWidget(false);
      }
    };
    fetchRecentAnalyses();
  }, []);

  const getRiskBadge = (score: number) => {
    if (score < 40) {
      return <Badge className="bg-green-500 hover:bg-green-600 text-white">Faible</Badge>;
    } else if (score >= 40 && score <= 70) {
      return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">Modéré</Badge>;
    } else {
      return <Badge className="bg-red-500 hover:bg-red-600 text-white">Élevé</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground mb-3">
          Tableau de bord
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Aperçu général de vos activités d’analyse documentaire.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow duration-300 relative"> {/* Added relative positioning */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
              {/* Small seal icon */}
              <img
                src="/verifdoc-seal.svg"
                alt="VerifDoc Seal"
                className="absolute top-2 right-2 h-14 w-14 object-contain opacity-60" // Positioned and styled
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 flex justify-end">
        <Button asChild className="gap-2">
          <Link to="/analyze">
            Démarrer une analyse
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        <div className="lg:col-span-2">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Analyses récentes</CardTitle>
              <CardDescription>Vos 3 dernières analyses.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Risque</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAnalyses.map((analysis, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{analysis.document}</TableCell>
                      <TableCell>{analysis.date}</TableCell>
                      <TableCell>{analysis.status}</TableCell>
                      <TableCell className="text-center">{analysis.score}%</TableCell>
                      <TableCell className="text-center">{getRiskBadge(analysis.score)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* NEW: Sceau numérique Widget */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Sceau numérique
            </CardTitle>
            <CardDescription>Derniers hashes d'intégrité générés.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRecentAnalysesForWidget ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : errorRecentAnalysesForWidget ? (
              <Alert variant="destructive">
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{errorRecentAnalysesForWidget}</AlertDescription>
              </Alert>
            ) : recentAnalysesForWidget.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun hash généré récemment.</p>
            ) : (
              <ul className="space-y-2">
                {recentAnalysesForWidget.map((analysis, index) => (
                  <li key={analysis.id} className="flex items-center justify-between text-sm">
                    <Link to={`/dashboard/analysis/${analysis.id}`} className="flex items-center gap-2 hover:underline text-foreground">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-xs">
                        {analysis.integrity_hash ? `${analysis.integrity_hash.substring(0, 12)}...` : "N/A"}
                      </span>
                    </Link>
                    {analysis.integrity_hash ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <ShieldCheck className="mr-1 h-3 w-3" /> Disponible
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        <AlertTriangle className="mr-1 h-3 w-3" /> Non généré
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="link" className="mt-4 p-0 h-auto">
              <Link to="/dashboard/history">Voir toutes les analyses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;