"use client";

import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

interface GlobalLayoutProps {
  children: React.ReactNode;
}

export const GlobalLayout = ({ children }: GlobalLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      <Footer />
    </div>
  );
};