"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ScanText,
  ShieldCheck,
  Fingerprint,
  Copy,
  Sparkles,
  Blend,
  Banknote,
  Building,
  Lightbulb,
  Layers,
  Shield,
  Globe,
  Code,
  FileUp,
  Brain,
  ScrollText,
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: <ScanText className="h-6 w-6 text-primary" />,
      title: "OCR IA Multi-langues",
      description: "Extraction de texte intelligente et précise dans plus de 100 langues.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "Détection de falsification locale (ELA++)",
      description: "Analyse des anomalies de compression pour révéler les modifications d'image.",
    },
    {
      icon: <Fingerprint className="h-6 w-6 text-primary" />,
      title: "Empreintes GAN / NoisePrint++",
      description: "Identification des signatures uniques laissées par les modèles génératifs (GAN).",
    },
    {
      icon: <Copy className="h-6 w-6 text-primary" />,
      title: "Détection Copy-Move (80 algorithmes avancés)",
      description: "Localisation des régions dupliquées au sein d'un document pour masquer des altérations.",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "Diffusion Forensics (détection IA générative)",
      description: "Détection des images générées ou modifiées par des modèles de diffusion IA.",
    },
    {
      icon: <Blend className="h-6 w-6 text-primary" />,
      title: "Fusion Engine — Score Forensic 0–100",
      description: "Un moteur propriétaire qui combine les résultats de tous les modules pour un score unique et fiable.",
    },
  ];

  const howItWorksSteps = [
    {
      icon: <FileUp className="h-8 w-8 text-primary" />,
      title: "Importez votre document",
      description: "Téléchargez facilement vos fichiers PDF, JPG ou PNG via notre interface sécurisée.",
    },
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "L’IA analyse 6 couches forensic",
      description: "Nos moteurs IA examinent le document sous tous les angles : OCR, ELA, GAN, Copy-Move, Diffusion et Fusion.",
    },
    {
      icon: <ScrollText className="h-8 w-8 text-primary" />,
      title: "Recevez un score + rapport détaillé",
      description: "Obtenez un score de falsification global et un rapport compréhensible avec des explications par module.",
    },
  ];

  const technologyPoints = [
    "Modèles IA open-source audités pour une transparence maximale.",
    "Aucune donnée entraînée à partir de vos documents, garantissant la confidentialité.",
    "API RGPD-compatible pour une intégration sécurisée et conforme.",
    "Hébergement en France / Europe pour une souveraineté des données.",
    "Backend modulaire avec 6 moteurs forensic spécialisés.",
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-20 py-16">
      {/* HERO SECTION */}
      <section className="w-full text-center py-20 md:py-32 bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto max-w-6xl px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            La plateforme IA de détection de falsification la plus avancée en Europe.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Analyse de documents, détection de montages, OCR intelligent, empreintes GAN et moteur de fusion propriétaire.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Button asChild size="lg" className="px-8 py-6 text-lg">
              <Link to="/analyze">Essayer maintenant</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
              <Link to="/demo">Voir la démo</Link>
            </Button>
          </div>
          <div className="relative w-full max-w-4xl mx-auto h-64 md:h-96 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl shadow-xl flex items-center justify-center overflow-hidden border border-border">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <span className="text-2xl md:text-3xl font-semibold text-muted-foreground/70 z-10">
              Document Analysis Preview
            </span>
          </div>
        </div>
      </section>

      {/* TRUST BADGES / CLIENT LOGOS */}
      <section className="w-full py-12 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-6 text-center">
          <p className="text-lg text-muted-foreground mb-8">
            Nos solutions sont conçues pour les secteurs exigeants :
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-muted-foreground/80 font-medium text-xl">
            <span className="hover:text-foreground transition-colors">Banques</span>
            <span className="hover:text-foreground transition-colors">Assurances</span>
            <span className="hover:text-foreground transition-colors">Administrations</span>
            <span className="hover:text-foreground transition-colors">Cabinets d’experts</span>
            <span className="hover:text-foreground transition-colors">Startups tech</span>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="w-full py-16">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Une analyse forensic multicouche
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="flex flex-col items-center text-center p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="p-3 rounded-full bg-primary/10 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center p-4">
                <div className="relative mb-6">
                  <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
          <Separator className="my-12 max-w-2xl mx-auto" />
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="w-full py-16">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Des offres adaptées à vos besoins
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="flex flex-col p-8 shadow-lg border-2 border-transparent hover:border-primary transition-colors duration-300">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-3xl font-bold text-foreground mb-2">
                  Professionnels
                </CardTitle>
                <CardDescription className="text-muted-foreground text-lg">
                  Idéal pour les petites et moyennes entreprises.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-grow">
                <p className="text-5xl font-extrabold text-foreground mb-6">
                  49€<span className="text-lg text-muted-foreground">/mois</span>
                </p>
                <ul className="space-y-3 text-muted-foreground mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> 500 analyses incluses
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> Score forensic détaillé
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> Rapports d'analyse complets
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> Accès au tableau de bord
                  </li>
                </ul>
                <Button asChild className="w-full py-6 text-lg">
                  <Link to="/signup">Souscrire</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col p-8 shadow-lg border-2 border-transparent hover:border-primary transition-colors duration-300">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-3xl font-bold text-foreground mb-2">
                  API Entreprise
                </CardTitle>
                <CardDescription className="text-muted-foreground text-lg">
                  Pour les grandes organisations et intégrations personnalisées.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-grow">
                <p className="text-5xl font-extrabold text-foreground mb-6">
                  Sur devis
                </p>
                <ul className="space-y-3 text-muted-foreground mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> Volume d'analyses illimité
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> Priorité d'analyse élevée
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> SLA contractuel
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" /> Support technique dédié
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full py-6 text-lg">
                  <Link to="/contact">Contacter le service commercial</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* TECHNOLOGY SECTION */}
      <section className="w-full py-16 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            Une technologie souveraine, auditable et hébergée en Europe.
          </h2>
          <ul className="space-y-4 text-lg text-muted-foreground max-w-3xl mx-auto text-left">
            {technologyPoints.map((point, index) => (
              <li key={index} className="flex items-start">
                <Lightbulb className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="w-full py-16">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
            Prêt à sécuriser vos documents ?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="px-8 py-6 text-lg">
              <Link to="/analyze">Analyser un document</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
              <Link to="/api-docs">API Documentation</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Add Check icon for pricing section
const Check = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default Index;