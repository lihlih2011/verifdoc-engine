"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FadeIn from "@/components/animations/FadeIn";

const Pricing = () => {
  const pricingPlans = [
    {
      name: "Professionnels",
      price: "49€",
      period: "/mois",
      description: "Idéal pour les petites et moyennes entreprises.",
      features: [
        "500 analyses mensuelles",
        "Score forensic IA",
        "Rapport détaillé",
        "Export PDF",
        "Accès au tableau de bord",
      ],
      buttonText: "Commencer",
      buttonLink: "/signup",
      highlight: false,
    },
    {
      name: "Experts & Cabinets",
      price: "129€",
      period: "/mois",
      description: "La solution complète pour les experts et cabinets d'analyse.",
      features: [
        "2 500 analyses mensuelles",
        "Accès API limité",
        "Priorité serveur",
        "Heatmaps forensic",
        "Historique complet",
        "Support prioritaire",
      ],
      buttonText: "Choisir ce plan",
      buttonLink: "/signup",
      highlight: true,
    },
    {
      name: "API Entreprise",
      price: "Sur devis",
      period: "",
      description: "Pour les grandes organisations et intégrations personnalisées.",
      features: [
        "Volume illimité",
        "API haute disponibilité",
        "SLA contractuel (99.9%)",
        "Environnement dédié",
        "Support 24/7",
        "Intégration sur mesure",
      ],
      buttonText: "Contacter le service commercial",
      buttonLink: "/contact",
      highlight: false,
    },
  ];

  const faqs = [
    {
      question: "Comment fonctionne l’analyse ?",
      answer: "Notre plateforme utilise 6 moteurs IA (OCR, ELA, GAN, Copy-Move, Diffusion, Fusion) pour analyser en profondeur vos documents et détecter les signes de falsification. Vous recevez un score global et un rapport détaillé par module."
    },
    {
      question: "Mes documents sont-ils stockés ?",
      answer: "Non, nous ne stockons pas vos documents. Ils sont traités en temps réel et supprimés de nos serveurs immédiatement après l'analyse pour garantir votre confidentialité et la conformité RGPD."
    },
    {
      question: "L’API est-elle compatible RGPD ?",
      answer: "Oui, notre API est entièrement compatible RGPD. Toutes les données sont traitées en Europe, et nous n'effectuons aucune conservation de données personnelles ou de documents analysés."
    },
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer: "Oui, vous pouvez mettre à niveau ou rétrograder votre plan à tout moment depuis votre tableau de bord. Les changements prennent effet immédiatement et sont ajustés au prorata."
    },
  ];

  const comparisonFeatures = [
    { name: "OCR IA", professionnels: true, experts: true, entreprise: true },
    { name: "Détection falsification", professionnels: true, experts: true, entreprise: true },
    { name: "Copy-Move", professionnels: true, experts: true, entreprise: true },
    { name: "GAN fingerprint", professionnels: true, experts: true, entreprise: true },
    { name: "Diffusion Forensics", professionnels: true, experts: true, entreprise: true },
    { name: "Accès API", professionnels: false, experts: "Limité", entreprise: "Illimité" },
    { name: "SLA contractuel", professionnels: false, experts: false, entreprise: true },
    { name: "Support 24/7", professionnels: false, experts: "Prioritaire", entreprise: true },
  ];

  return (
    <FadeIn delay={500}>
      <div className="flex flex-col items-center justify-center space-y-20 py-16">
        {/* HEADER */}
        <section className="w-full text-center py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Des tarifs transparents pour tous vos besoins forensic.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Choisissez le plan adapté à votre activité : professionnels, experts, entreprises ou API.
          </p>
        </section>

        {/* PRICING GRID */}
        <section className="w-full py-16">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <Card
                  key={index}
                  className={`flex flex-col p-8 shadow-lg transition-all duration-300
                    ${plan.highlight ? "border-2 border-primary scale-105" : "border border-border hover:border-primary/50"}`}
                >
                  <CardHeader className="p-0 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <CardTitle className="text-2xl font-bold text-foreground">
                        {plan.name}
                      </CardTitle>
                      {plan.highlight && (
                        <Badge className="bg-primary text-primary-foreground">Populaire</Badge>
                      )}
                    </div>
                    <CardDescription className="text-muted-foreground text-base">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 flex-grow">
                    <p className="text-5xl font-extrabold text-foreground mb-6">
                      {plan.price}
                      <span className="text-lg text-muted-foreground">{plan.period}</span>
                    </p>
                    <ul className="space-y-3 text-muted-foreground mb-8">
                      {plan.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> {feature}
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="w-full py-6 text-lg">
                      <Link to={plan.buttonLink}>{plan.buttonText}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="w-full py-16 bg-muted/30">
          <div className="container mx-auto max-w-6xl px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              Comparaison des fonctionnalités
            </h2>
            <div className="overflow-x-auto">
              <Table className="min-w-full bg-card rounded-md shadow-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Fonction</TableHead>
                    <TableHead className="text-center">Professionnels</TableHead>
                    <TableHead className="text-center">Experts</TableHead>
                    <TableHead className="text-center">Entreprise</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonFeatures.map((feature, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{feature.name}</TableCell>
                      <TableCell className="text-center">
                        {feature.professionnels === true ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : feature.professionnels === false ? (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground text-sm">{feature.professionnels}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {feature.experts === true ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : feature.experts === false ? (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground text-sm">{feature.experts}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {feature.entreprise === true ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : feature.entreprise === false ? (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground text-sm">{feature.entreprise}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="w-full py-16">
          <div className="container mx-auto max-w-3xl px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              Questions Fréquentes
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-lg text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="w-full py-16 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="container mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
              Prêt à sécuriser vos documents ?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="px-8 py-6 text-lg">
                <Link to="/signup">Créer un compte</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Link to="/analyze">Analyser un document</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </FadeIn>
  );
};

export default Pricing;