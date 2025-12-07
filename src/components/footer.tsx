"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border py-16 px-6">
      <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm text-muted-foreground">
        {/* Column 1: Logo + Description */}
        <div>
          <Link to="/" className="text-2xl font-bold text-foreground mb-3 block">
            VerifDoc
          </Link>
          <p className="text-sm leading-relaxed">
            Plateforme d’analyse documentaire automatisée reposant sur une méthodologie multicritère et conforme aux exigences professionnelles.
          </p>
        </div>

        {/* Column 2: Navigation */}
        <div>
          <h4 className="font-semibold text-foreground mb-4">Navigation</h4>
          <ul className="space-y-3">
            <li><Link to="/" className="hover:text-primary transition-colors">Accueil</Link></li>
            <li><Link to="/pricing" className="hover:text-primary transition-colors">Tarification</Link></li>
            <li><Link to="/modules" className="hover:text-primary transition-colors">Modules d’analyse</Link></li>
            <li><Link to="/security" className="hover:text-primary transition-colors">Sécurité & conformité</Link></li>
          </ul>
        </div>

        {/* Column 3: Ressources */}
        <div>
          <h4 className="font-semibold text-foreground mb-4">Ressources</h4>
          <ul className="space-y-3">
            <li><Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
            <li><Link to="/api" className="hover:text-primary transition-colors">API</Link></li>
            <li><Link to="/support" className="hover:text-primary transition-colors">Support</Link></li>
            <li><Link to="/help" className="hover:text-primary transition-colors">Centre d’aide</Link></li>
          </ul>
        </div>

        {/* Column 4: Légal */}
        <div>
          <h4 className="font-semibold text-foreground mb-4">Légal</h4>
          <ul className="space-y-3">
            <li><Link to="/legal-mentions" className="hover:text-primary transition-colors">Mentions légales</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Politique de confidentialité</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-primary transition-colors">Conditions d’utilisation</Link></li>
          </ul>
        </div>
      </div>

      <Separator className="my-10" />

      {/* Bottom Bar: Copyright */}
      <div className="container mx-auto max-w-6xl text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} VerifDoc – Tous droits réservés.</p>
      </div>
    </footer>
  );
};