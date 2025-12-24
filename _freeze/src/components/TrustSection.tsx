"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import FadeIn from "@/components/animations/FadeIn";

const TrustSection = () => {
  const testimonials = [
    {
      author: "Direction Conformité – Groupe Assureur",
      text: "VerifDoc a renforcé notre capacité à détecter les incohérences documentaires tout en réduisant considérablement le temps d’analyse.",
    },
    {
      author: "Responsable Audit – Institution Publique",
      text: "La plateforme apporte une rigueur méthodologique indispensable pour nos examens administratifs.",
    },
    {
      author: "Cabinet d’Expertise Judiciaire",
      text: "Les modules d’analyse multicritère et le rapport certifié VerifDoc répondent à nos exigences professionnelles.",
    },
  ];

  const trustLogos = [
    "Institution A",
    "Institution B",
    "Institution C",
  ];

  return (
    <FadeIn delay={600}>
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ils nous font confiance
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            VerifDoc s’adresse aux organisations soumises à des exigences strictes de contrôle documentaire : institutions publiques, assureurs, banques, cabinets d’expertise et entreprises à forte responsabilité réglementaire.
          </p>

          {/* Testimonial Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="flex flex-col p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card border-border">
                <CardContent className="p-0 flex-grow text-left">
                  <p className="text-lg text-foreground italic mb-4">"{testimonial.text}"</p>
                  <p className="text-sm font-semibold text-primary">- {testimonial.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Logos Section */}
          <h3 className="text-2xl font-bold text-foreground mb-8">Nos partenaires</h3>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {trustLogos.map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center h-24 w-48 rounded-lg border border-border bg-background/50 text-muted-foreground text-lg font-semibold shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
};

export default TrustSection;