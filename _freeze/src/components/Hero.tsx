"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import FadeIn from "@/components/animations/FadeIn";

const Hero = () => {
  const [counter, setCounter] = useState(0);
  const targetCount = 180;
  const duration = 1500; // milliseconds

  useEffect(() => {
    let start: number | null = null;
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const currentCount = Math.min(Math.floor((progress / duration) * targetCount), targetCount);
      setCounter(currentCount);

      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };

    const animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <FadeIn delay={0}>
      <section className="w-full py-20 md:py-32 bg-background text-center animate-in fade-in duration-1000">
        <div className="container mx-auto max-w-4xl px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            VerifDoc — Analyse documentaire automatisée
          </h1>
          <h2 className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Une IA forensique de dernière génération appliquant plus de {targetCount} tests automatiques pour authentifier vos documents avec précision et transparence.
          </h2>
          <p className="text-xl md:text-2xl font-bold text-primary mb-12">
            Analyse en temps réel : {counter} points de contrôle
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="px-8 py-6 text-lg">
              <Link to="/analyze">Commencer l’analyse</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
              <Link to="/about">En savoir plus</Link>
            </Button>
          </div>
        </div>
      </section>
    </FadeIn>
  );
};

export default Hero;