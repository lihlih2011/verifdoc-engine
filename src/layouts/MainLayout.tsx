"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header /> {/* The Header is already here */}
      <main className="flex-grow container mx-auto max-w-6xl px-6 py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
};