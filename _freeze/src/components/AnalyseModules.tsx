"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImageMinus, Waves, Sparkles, Copy, Scan } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";

const AnalyseModules = () => {
  const modules = [
    {
      icon: <ImageMinus className="h-8 w-8 text-primary" />,
      title: "Module ELA — Analyse des niveaux d’erreur",
      description: "Examine la distribution des niveaux de compression pour identifier les zones ayant subi une modification locale ou un réenregistrement.",
    },
    {
      icon: <Waves className="h-8 w-8 text-primary" />,
      title: "Module NoisePrint — Empreinte de bruit",
      description: "Analyse l’empreinte de bruit de l’image afin de révéler des anomalies structurelles ou la présence de segments insérés.",
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "Module Diffusion Forensics",
      description: "Évalue la cohérence des signatures latentes afin de détecter les altérations générées par des modèles de type diffusion.",
    },
    {
      icon: <Copy className="h-8 w-8 text-primary" />,
      title: "Module Copy-Move",
      description: "Identifie les duplications internes, souvent utilisées pour masquer ou répéter des éléments au sein d’un document falsifié.",
    },
    {
      icon: <Scan className="h-8 w-8 text-primary" />,
      title: "Module FR-DETR — Localisation structurée",
      description: "Localise précisément les zones considérées comme sensibles, en produisant des délimitations exploitables dans le rapport certifié.",
    },
  ];

  return (
    <FadeIn delay={300}>
      <section className="w-full py-20 bg-background">
        <div className="container mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Modules d’analyse VerifDoc
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Chaque document est examiné à travers plusieurs moteurs d'analyse spécialisés, permettant de détecter les altérations, incohérences et signatures visuelles non perceptibles à l’œil humain. Ces modules forment une méthodologie robuste et reproductible, conforme aux standards internationaux.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module, index) => (
              <Card key={index} className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card border-border">
                <CardHeader className="pb-4">
                  <div className="p-3 rounded-full bg-primary/10 mb-4">
                    {module.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {module.description}
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

export default AnalyseModules;