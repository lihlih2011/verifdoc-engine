"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hash, ShieldCheck, AlertTriangle } from "lucide-react";

interface IntegrityHashCardProps {
  integrityHash?: string;
}

export const IntegrityHashCard = ({ integrityHash }: IntegrityHashCardProps) => {
  return (
    <Card className="mb-8 p-6 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Hash className="h-6 w-6 text-primary" />
          5. Sceau numérique d’intégrité (SHA-256)
        </CardTitle>
        <CardDescription>
          Hash SHA-256 du rapport généré pour vérifier son intégrité.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-lg font-medium mb-2">Hash SHA-256 du rapport :</p>
          <pre className="bg-muted text-sm rounded-md p-3 font-mono overflow-x-auto break-all">
            {integrityHash || "Non disponible"}
          </pre>
        </div>
        <div className="flex items-center gap-2">
          {integrityHash ? (
            <Badge className="bg-green-500 hover:bg-green-600 text-white">
              <ShieldCheck className="mr-1 h-4 w-4" /> Intégrité vérifiable
            </Badge>
          ) : (
            <Badge className="bg-gray-500 hover:bg-gray-600 text-white">
              <AlertTriangle className="mr-1 h-4 w-4" /> Non généré
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};