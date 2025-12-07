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
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-grow p-6 md:p-8 lg:p-10 max-w-full overflow-x-hidden">
          <div className="container mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};