"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/footer";
import { Sidebar } from "@/components/dashboard/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 relative"> {/* Make this div relative for watermark positioning */}
        {/* Background Watermark */}
        <img
          src="/verifdoc-seal.svg"
          alt="VerifDoc Watermark"
          className="absolute inset-0 w-full h-full object-contain opacity-[0.04] z-0 pointer-events-none"
        />
        <Sidebar />
        <main className="flex-grow p-6 md:p-8 lg:p-10 max-w-full overflow-x-hidden relative z-10"> {/* Ensure main content is above watermark */}
          <div className="container mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};