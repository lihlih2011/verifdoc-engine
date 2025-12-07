"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator"; // Added import

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-10 px-6">
      <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-muted-foreground">
        {/* Branding & Slogan */}
        <div className="col-span-full md:col-span-1">
          <h3 className="text-xl font-bold text-foreground mb-2">VerifDoc</h3>
          <p className="text-sm">Plateforme IA de détection de falsification</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Liens rapides</h4>
          <ul className="space-y-2">
            <li><Link to="/analyze" className="hover:text-primary transition-colors">Analyse</Link></li>
            <li><Link to="/pricing" className="hover:text-primary transition-colors">Tarifs</Link></li>
            <li><Link to="/api" className="hover:text-primary transition-colors">API</Link></li>
            <li><Link to="/support" className="hover:text-primary transition-colors">Support</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Légal</h4>
          <ul className="space-y-2">
            <li><Link to="/legal-mentions" className="hover:text-primary transition-colors">Mentions légales</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Confidentialité</Link></li>
            <li><Link to="/rgpd" className="hover:text-primary transition-colors">RGPD</Link></li>
          </ul>
        </div>

        {/* Placeholder for future content or social links */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Suivez-nous</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">LinkedIn</a></li>
          </ul>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Copyright */}
      <div className="container mx-auto max-w-6xl text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} VerifDoc — Tous droits réservés</p>
      </div>
    </footer>
  );
};