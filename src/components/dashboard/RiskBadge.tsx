"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  score: number;
}

export const RiskBadge = ({ score }: RiskBadgeProps) => {
  let text: string;
  let colorClass: string;

  if (score < 40) {
    text = "Faible";
    colorClass = "bg-green-500 hover:bg-green-600";
  } else if (score >= 40 && score <= 70) {
    text = "Modéré";
    colorClass = "bg-orange-500 hover:bg-orange-600";
  } else {
    text = "Élevé";
    colorClass = "bg-red-500 hover:bg-red-600";
  }

  return (
    <Badge className={cn("text-white px-3 py-1 text-sm", colorClass)}>
      {text}
    </Badge>
  );
};