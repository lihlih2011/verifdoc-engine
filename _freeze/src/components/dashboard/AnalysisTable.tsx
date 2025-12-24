"use client";

import React from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { RiskBadge } from "./RiskBadge";
import { Eye } from "lucide-react";

interface AnalysisRecord {
  id: number;
  filename: string;
  forensic_score: number;
  risk_level: string;
  created_at: string;
}

interface AnalysisTableProps {
  analyses: AnalysisRecord[];
}

export const AnalysisTable = ({ analyses }: AnalysisTableProps) => {
  return (
    <div className="rounded-md border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Date</TableHead>
            <TableHead>Nom du fichier</TableHead>
            <TableHead className="text-center">Score Forensic</TableHead>
            <TableHead className="text-center">Niveau de risque</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {analyses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                Aucune analyse trouvée.
              </TableCell>
            </TableRow>
          ) : (
            analyses.map((analysis) => (
              <TableRow key={analysis.id}>
                <TableCell className="font-medium">
                  {format(new Date(analysis.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                </TableCell>
                <TableCell>{analysis.filename}</TableCell>
                <TableCell className="text-center">{analysis.forensic_score}%</TableCell>
                <TableCell className="text-center">
                  <RiskBadge score={analysis.forensic_score} />
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/dashboard/analysis/${analysis.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir détail
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};