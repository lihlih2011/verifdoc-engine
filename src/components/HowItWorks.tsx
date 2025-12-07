"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadCloud, Layers, ScanSearch, FileCheck } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <UploadCloud className="h-8 w-8 text-primary" />,
      title: "Téléversement sécurisé",
      description: "L’utilisateur dépose son document au sein d’un environnement contrôlé garantissant la confidentialité et l’intégrité du fichier.",
    },
    {
      icon: <Layers className="h-8 w-8 text-primary" />,
      title: "Analyse multicritère",
      description: "Le système applique plus de 180 paramètres de contrôle, couvrant la structure, la cohérence interne et les signatures visuelles.",
    },
    {
      icon: <ScanSearch className="h-8 w-8 text-primary" />,
      title: "Détermination des zones sensibles",
      description: "Les segments présentant des anomalies potentielles sont isolés, localisés et représentés sous forme de projections visuelles ou cartes thermiques.",
    },
    {
      icon: <FileCheck className="h-8 w-8 text-primary" />,
      title: "Rapport certifié",
      description: "Un rapport formel est généré, incluant un sceau numérique VerifDoc, un indice de crédibilité analytique et une description structurée des observations.",
    },
  ];

  return (
    <section className="w-full py-20 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Comment fonctionne VerifDoc ?
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
          Le processus d’analyse repose sur une chaîne méthodologique structurée, permettant une évaluation fiable, reproductible et conforme aux standards internationaux.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="flex flex-col items-center text-center p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  {step.icon}
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;