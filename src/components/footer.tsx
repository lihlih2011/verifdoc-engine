"use client";

import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border p-4 text-center text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} VerifDoc. All rights reserved.</p>
      <MadeWithDyad />
    </footer>
  );
};