"use client";

import React from "react";
import Hero from "@/components/Hero";
import WhyVerifDoc from "@/components/WhyVerifDoc";
import HowItWorks from "@/components/HowItWorks";
import AnalyseModules from "@/components/AnalyseModules";
import Pricing from "@/pages/pricing"; // Using the Pricing page as a section
import TrustSection from "@/components/TrustSection";
import { Footer } from "@/components/footer"; // Directly importing Footer

const Home = () => {
  return (
    <>
      <Hero />
      <WhyVerifDoc />
      <HowItWorks />
      <AnalyseModules />
      {/* SecurityCompliance component was not found in the codebase and has been omitted. */}
      <Pricing />
      <TrustSection />
      <Footer />
    </>
  );
};

export default Home;