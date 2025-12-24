"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthCard = ({ title, subtitle, children }: AuthCardProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg animate-in fade-in duration-500">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">VerifDoc</h1>
          <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
};