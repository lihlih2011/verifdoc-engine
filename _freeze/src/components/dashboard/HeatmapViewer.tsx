"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize } from "lucide-react";

interface HeatmapViewerProps {
  imageUrl: string;
  label: string;
}

export const HeatmapViewer = ({ imageUrl, label }: HeatmapViewerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative group w-full h-full flex items-center justify-center bg-muted/50 rounded-lg overflow-hidden border border-border">
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={label}
            className="max-h-96 object-contain rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105 cursor-pointer"
            onClick={() => setIsOpen(true)}
          />
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label={`View ${label} in fullscreen`}
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-screen-xl max-h-screen p-0 border-none bg-transparent">
              <img
                src={imageUrl}
                alt={label}
                className="w-full h-full object-contain"
              />
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <p className="text-muted-foreground text-center p-4">
          Heatmap {label.split(' ')[0]} non encore générée
        </p>
      )}
    </div>
  );
};