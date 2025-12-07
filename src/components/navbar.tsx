"use client";

import React from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";

export const Navbar = () => {
  return (
    <nav className="bg-background border-b border-border p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-foreground">
        VerifDoc
      </Link>
      <div className="flex items-center space-x-4">
        <Link to="/analyze" className="text-muted-foreground hover:text-foreground">Analyze Document</Link> {/* New link */}
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
        <Link to="/settings" className="text-muted-foreground hover:text-foreground">Settings</Link>
        <ThemeToggle />
      </div>
    </nav>
  );
};