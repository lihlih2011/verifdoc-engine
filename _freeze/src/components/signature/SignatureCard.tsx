"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileCheck,
  ShieldCheck,
  Clock,
  Fingerprint,
  User,
  Building,
  Hash,
  CalendarDays,
  AlertCircle,
  Hourglass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SignatureInfo {
  hasSignature: boolean;
  signatureInfo?: {
    subject: string;
    issuer: string;
    serialNumber: string;
    validity: {
      notBefore: string;
      notAfter: string;
    };
    isValid: boolean;
    reason: string;
    timestamp: string;
    tsaIssuer: string;
    tsaValidity: string;
    ocspStatus: string;
  };
}

interface SignatureCardProps {
  signature: SignatureInfo;
}

export const SignatureCard = ({ signature }: SignatureCardProps) => {
  const { hasSignature, signatureInfo } = signature;

  if (!hasSignature || !signatureInfo) {
    return (
      <Card className="mb-8 p-6 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Fingerprint className="h-6 w-6 text-muted-foreground" />
            Signature électronique
          </CardTitle>
          <CardDescription>
            Aucune signature électronique n'a été détectée dans ce document.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isCertValid = signatureInfo.isValid;
  const ocspStatus = signatureInfo.ocspStatus.toLowerCase();
  const hasTimestamp = signatureInfo.timestamp && signatureInfo.timestamp !== "Not detected (placeholder)";

  let badgeText: string;
  let badgeColorClass: string;

  if (isCertValid && ocspStatus === "valid (simulated)") {
    badgeText = "Signature valide";
    badgeColorClass = "bg-green-500 hover:bg-green-600";
  } else if (signatureInfo.reason.includes("Expired") || ocspStatus === "revoked") {
    badgeText = "Signature expirée/révoquée";
    badgeColorClass = "bg-orange-500 hover:bg-orange-600";
  } else {
    badgeText = "Signature invalide/altérée";
    badgeColorClass = "bg-red-500 hover:bg-red-600";
  }

  const timelineItems = [
    {
      icon: <FileCheck className="h-5 w-5 text-primary" />,
      title: "Document signé",
      description: "Le document a été signé numériquement.",
      status: true,
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Certificat analysé",
      description: `Statut: ${signatureInfo.reason}`,
      status: isCertValid,
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Horodatage vérifié",
      description: hasTimestamp ? `TSA: ${signatureInfo.tsaIssuer}` : "Aucun horodatage détecté.",
      status: hasTimestamp,
    },
    {
      icon: <Fingerprint className="h-5 w-5" />,
      title: "Intégrité du document",
      description: "L'intégrité du document au moment de la signature est présumée.",
      status: isCertValid, // Assuming integrity is tied to cert validity for this simplified view
    },
  ];

  return (
    <Card className="mb-8 p-6 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-3">
            <Fingerprint className="h-6 w-6 text-primary" />
            Signature électronique détectée
          </CardTitle>
          <Badge className={cn("text-white px-3 py-1 text-sm", badgeColorClass)}>
            {badgeText}
          </Badge>
        </div>
        <CardDescription className="mt-2">
          Détails de la signature numérique intégrée au document.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Certificate Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Signataire:</span>
            <span className="font-mono text-foreground break-all">{signatureInfo.subject}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Émetteur:</span>
            <span className="font-mono text-foreground break-all">{signatureInfo.issuer}</span>
          </div>
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Numéro de série:</span>
            <span className="font-mono text-foreground break-all">{signatureInfo.serialNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Valide du:</span>
            <span className="font-mono text-foreground">
              {format(new Date(signatureInfo.validity.notBefore), "dd/MM/yyyy", { locale: fr })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Valide au:</span>
            <span className="font-mono text-foreground">
              {format(new Date(signatureInfo.validity.notAfter), "dd/MM/yyyy", { locale: fr })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Statut OCSP:</span>
            <span className={cn("font-mono", {
              "text-green-600": ocspStatus === "valid (simulated)",
              "text-orange-600": ocspStatus === "revoked",
              "text-red-600": ocspStatus === "unknown",
            })}>
              {signatureInfo.ocspStatus}
            </span>
          </div>
        </div>

        {/* Timestamp Block */}
        {hasTimestamp && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                <Hourglass className="h-5 w-5 text-primary" />
                Horodatage électronique (RFC 3161)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Émetteur TSA:</span>
                  <span className="font-mono text-foreground break-all">{signatureInfo.tsaIssuer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Heure de l'horodatage:</span>
                  <span className="font-mono text-foreground">
                    {signatureInfo.timestamp !== "Not detected (placeholder)"
                      ? format(new Date(signatureInfo.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: fr })
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Statut TSA:</span>
                  <span className="font-mono text-foreground">{signatureInfo.tsaValidity}</span>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Visual Timeline */}
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <CalendarDays className="h-5 w-5 text-primary" />
            Chronologie de la signature
          </h3>
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
            {timelineItems.map((item, index) => (
              <div key={index} className="relative mb-6 last:mb-0">
                {/* Icon circle */}
                <div className={cn(
                  "absolute -left-4 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background",
                  item.status ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground"
                )}>
                  {item.icon}
                </div>
                <div className="ml-6">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};