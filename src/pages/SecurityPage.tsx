"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Lock, Globe, FileText, Audit, CheckCircle2 } from "lucide-react"; // Added more icons
import FadeIn from "@/components/animations/FadeIn";

const SecurityPage = () => {
  return (
    <FadeIn delay={0}>
      <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Sécurité & Conformité
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Chez VerifDoc, la sécurité de vos données et la conformité réglementaire sont nos priorités absolues. Nous nous engageons à protéger vos informations avec les plus hauts standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="p-3 rounded-full bg-primary/10 mb-4 inline-flex">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">
                Protection des Données
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">
                Vos documents sont traités en temps réel et ne sont jamais stockés sur nos serveurs après analyse. Nous utilisons des protocoles de chiffrement robustes pour toutes les communications.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="p-3 rounded-full bg-primary/10 mb-4 inline-flex">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">
                Conformité RGPD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">
                VerifDoc est entièrement conforme au Règlement Général sur la Protection des Données (RGPD). Nous garantissons la transparence et le contrôle de vos données personnelles.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="p-3 rounded-full bg-primary/10 mb-4 inline-flex">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">
                Hébergement en Europe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">
                Nos infrastructures sont exclusivement hébergées en France et en Europe, assurant la souveraineté de vos données et une protection contre les lois extraterritoriales.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="p-3 rounded-full bg-primary/10 mb-4 inline-flex">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">
                Audits de Sécurité Réguliers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">
                Nous effectuons des audits de sécurité et des tests d'intrusion réguliers pour identifier et corriger les vulnérabilités, garantissant une protection continue.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="p-3 rounded-full bg-primary/10 mb-4 inline-flex">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">
                Architecture Sécurisée
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">
                Notre architecture est conçue avec une approche de sécurité par défaut, intégrant des mesures de protection à chaque niveau de la pile technologique.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="p-3 rounded-full bg-primary/10 mb-4 inline-flex">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">
                Politique de Confidentialité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">
                Consultez notre politique de confidentialité détaillée pour comprendre comment nous gérons et protégeons vos informations.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Des questions sur notre sécurité ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            N'hésitez pas à nous contacter si vous avez des questions ou si vous souhaitez en savoir plus sur nos pratiques de sécurité.
          </p>
          {/* You might want to add a contact button here */}
        </div>
      </div>
    </FadeIn>
  );
};

export default SecurityPage;