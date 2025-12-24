"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Scan, ShieldCheck } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";

const WhyVerifDoc = () => {
  const pillars = [
    {
      icon: <Scan className="h-8 w-8 text-primary" />,
      title: "Analyse multicouche",
      description: "Chaque document est examiné à travers plusieurs mécanismes d’évaluation (texture, structure, cohérence interne), permettant d’identifier toute anomalie ou incohérence non perceptible à l’œil humain.",
    },
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: "Localisation précise des altérations",
      description: "VerifDoc détermine les zones susceptibles d’avoir fait l’objet de modifications, reproduisant ces segments sous forme de cartes thermiques et de projections visuelles interprétables.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "Fiabilité mesurable",
      description: "Chaque analyse s’accompagne d’un indicateur de crédibilité analytique, d’un rapport certifié et d’un sceau numérique attestant la traçabilité du diagnostic.",
    },
  ];

  return (
    <FadeIn delay={100}>
      <section className="w-full py-16 bg-background">
        <div className="container mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Pourquoi VerifDoc ?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Une solution d’analyse documentaire reposant sur une méthodologie multicritère, fondée sur plus de 180 paramètres de contrôle, garantissant une interprétation rigoureuse, reproductible et conforme aux standards internationaux.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => (
              <Card key={index} className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="p-3 rounded-full bg-primary/10 mb-4">
                    {pillar.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {pillar.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {pillar.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
};

export default WhyVerifDoc;