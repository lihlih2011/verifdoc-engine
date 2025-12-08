"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileWarning, FileText, Code, Layers, Lock, ScrollText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmbeddedObject {
  objectId: string;
  type: string;
  subtype?: string;
  length?: number;
  compression?: string;
  suspicious: boolean;
  reason?: string;
  preview?: string;
  entropy?: number;
}

interface EmbeddedObjectsCardProps {
  embeddedObjects: EmbeddedObject[];
}

export const EmbeddedObjectsCard = ({ embeddedObjects }: EmbeddedObjectsCardProps) => {
  if (!embeddedObjects || embeddedObjects.length === 0) {
    return (
      <Card className="mb-8 p-6 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6 text-muted-foreground" />
            Objets Intégrés (PDF)
          </CardTitle>
          <CardDescription>
            Aucun objet intégré n'a été détecté dans ce document PDF.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const suspiciousObjects = embeddedObjects.filter(obj => obj.suspicious);

  return (
    <Card className="mb-8 p-6 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            Objets Intégrés (PDF)
          </CardTitle>
          {suspiciousObjects.length > 0 ? (
            <Badge variant="destructive" className="text-white px-3 py-1 text-sm">
              <FileWarning className="mr-1 h-4 w-4" /> {suspiciousObjects.length} Suspect(s)
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-green-100 text-green-700 px-3 py-1 text-sm">
              <FileCheck className="mr-1 h-4 w-4" /> Aucun suspect
            </Badge>
          )}
        </div>
        <CardDescription className="mt-2">
          Analyse des objets internes du document PDF pour détecter des éléments cachés ou malveillants.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subtype</TableHead>
              <TableHead>Compression</TableHead>
              <TableHead>Raison suspecte</TableHead>
              <TableHead className="text-right">Preview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {embeddedObjects.map((obj, index) => (
              <TableRow key={index} className={cn({ "bg-red-50/50": obj.suspicious })}>
                <TableCell className="font-mono text-xs">{obj.objectId}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {obj.type === "Stream" && <Layers className="h-4 w-4 text-muted-foreground" />}
                    {obj.type === "Dictionary" && <Code className="h-4 w-4 text-muted-foreground" />}
                    {obj.type === "Array" && <ScrollText className="h-4 w-4 text-muted-foreground" />}
                    {obj.type === "Error" && <AlertCircle className="h-4 w-4 text-destructive" />}
                    {obj.type}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{obj.subtype || "N/A"}</TableCell>
                <TableCell className="font-mono text-xs">{obj.compression || "N/A"}</TableCell>
                <TableCell>
                  {obj.suspicious ? (
                    <Badge variant="destructive" className="text-white">
                      {obj.reason || "Suspect"}
                    </Badge>
                  ) : (
                    "Non suspect"
                  )}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                  {obj.preview ? `${obj.preview.substring(0, 20)}...` : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};