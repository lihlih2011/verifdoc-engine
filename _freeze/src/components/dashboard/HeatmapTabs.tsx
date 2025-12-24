"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeatmapViewer } from "./HeatmapViewer";

interface HeatmapTabsProps {
  heatmaps: {
    ela?: string;
    gan?: string;
    copymove?: string;
    diffusion?: string;
  };
}

export const HeatmapTabs = ({ heatmaps }: HeatmapTabsProps) => {
  return (
    <Tabs defaultValue="ela" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
        <TabsTrigger value="ela">ELA</TabsTrigger>
        <TabsTrigger value="gan">GAN</TabsTrigger>
        <TabsTrigger value="copymove">Copy-Move</TabsTrigger>
        <TabsTrigger value="diffusion">Diffusion</TabsTrigger>
      </TabsList>
      <TabsContent value="ela" className="mt-4">
        <HeatmapViewer imageUrl={heatmaps.ela || ""} label="ELA Heatmap" />
      </TabsContent>
      <TabsContent value="gan" className="mt-4">
        <HeatmapViewer imageUrl={heatmaps.gan || ""} label="GAN Heatmap" />
      </TabsContent>
      <TabsContent value="copymove" className="mt-4">
        <HeatmapViewer imageUrl={heatmaps.copymove || ""} label="Copy-Move Heatmap" />
      </TabsContent>
      <TabsContent value="diffusion" className="mt-4">
        <HeatmapViewer imageUrl={heatmaps.diffusion || ""} label="Diffusion Heatmap" />
      </TabsContent>
    </Tabs>
  );
};