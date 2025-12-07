"use client";

import React from "react";
import { MainLayout } from "@/layouts/MainLayout";

const SecurityPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Sécurité & Conformité</h1>
        <p className="text-lg text-muted-foreground">
          Informations sur nos mesures de sécurité et notre conformité réglementaire.
        </p>
        <div className="mt-8 p-6 bg-card rounded-lg shadow-md max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-3">Nos Engagements</h2>
          <ul className="list-disc list-inside text-left text-muted-foreground space-y-2">
            <li>Protection des données et confidentialité</li>
            <li>Conformité RGPD</li>
            <li>Hébergement sécurisé en Europe</li>
            <li>Audits de sécurité réguliers</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default SecurityPage;