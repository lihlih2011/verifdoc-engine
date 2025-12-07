"use client";

import React from "react";
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
import { ArrowRight, FileText, CheckCircle2, BarChart2 } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";

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
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
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

      <Card className="mt-10 shadow-sm hover:shadow-md transition-shadow duration-300">
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
    </DashboardLayout>
  );
};

export default DashboardHome;