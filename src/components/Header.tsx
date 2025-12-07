"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    { name: "Accueil", path: "/" },
    { name: "Tarification", path: "/pricing" },
    { name: "Analyse", path: "/analyze" },
    { name: "Sécurité", path: "/security" },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b transition-all duration-300 ${isScrolled ? "border-border shadow-sm" : "border-transparent"}`}>
      <div className="container mx-auto max-w-6xl px-6 py-4 flex justify-between items-center">
        {/* Left: Logo */}
        <Link to="/" className="text-2xl font-bold text-foreground">
          VerifDoc
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-muted-foreground hover:text-primary transition-colors text-base font-medium"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right: ThemeSwitcher, VerifDoc Seal, and Mobile Menu */}
        <div className="flex items-center space-x-2">
          <ThemeSwitcher />
          {/* VerifDoc Seal with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <img
                src="/verifdoc-seal.svg"
                alt="VerifDoc Certified"
                className="h-[38px] w-[38px] object-contain"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Certifié par l’infrastructure forensique VerifDoc™</p>
            </TooltipContent>
          </Tooltip>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>VerifDoc</SheetTitle>
                  <SheetDescription>
                    Navigation principale
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <Separator />
                  <Button asChild>
                    <Link to="/analyze">Commencer l'analyse</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};