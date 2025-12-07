"use client";

import React, { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const AnalyzeDocument = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setResult(null); // Clear previous results
    setError(null); // Clear previous errors

    if (selectedFile) {
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type === "application/pdf") {
        setFilePreview("pdf"); // Special indicator for PDF
      } else {
        setFilePreview(null);
      }
    } else {
      setFilePreview(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a file to analyze.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score: number) => {
    if (score < 40) return { text: "Faible", color: "bg-green-500" };
    if (score >= 40 && score <= 70) return { text: "Modéré", color: "bg-orange-500" };
    return { text: "Élevé", color: "bg-red-500" };
  };

  const riskLevel = result ? getRiskLevel(result.forgery_score) : null;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground mb-3">
          Analyse de document
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Détection avancée de falsification via IA pour garantir l'authenticité de vos documents.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Télécharger un document</CardTitle>
          <CardDescription>
            Formats supportés : PDF, JPG, PNG.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="document">Document</Label>
              <Input id="document" type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
            </div>

            {file && (
              <div className="mt-4 p-4 border rounded-md flex items-center space-x-4 bg-muted/50">
                {filePreview === "pdf" ? (
                  <FileText className="h-12 w-12 text-primary" />
                ) : filePreview ? (
                  <img src={filePreview} alt="File preview" className="h-20 w-20 object-cover rounded-md" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="w-full mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyse en cours…
                </>
              ) : (
                "Analyser le document"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card className="max-w-3xl mx-auto mt-8 p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <p className="text-center text-muted-foreground mt-4">Analyse en cours… Veuillez patienter</p>
        </Card>
      )}

      {result && (
        <Card className="max-w-3xl mx-auto mt-8 p-6 shadow-lg animate-in fade-in duration-500">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl">Résultats de l'analyse</CardTitle>
          </CardHeader>
          <Separator className="mb-4" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium">Score global de falsification :</p>
              <Badge className={`text-lg px-4 py-2 ${riskLevel?.color}`}>
                {result.forgery_score}% ({riskLevel?.text})
              </Badge>
            </div>
            <div>
              <p className="text-lg font-medium mb-2">Résumé de l'explication :</p>
              <p className="text-muted-foreground">{result.explanation.summary}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(result.explanation).map(([key, value]) => (
                key !== "summary" && (
                  <div key={key} className="flex items-center space-x-2">
                    <Badge variant="secondary" className="capitalize">
                      {key.replace(/_/g, ' ')}:
                    </Badge>
                    <span className="text-sm text-muted-foreground">{value as string}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-8"
            onClick={() => setShowRawJson(!showRawJson)}
          >
            {showRawJson ? "Masquer JSON brut" : "Afficher JSON brut"}
          </Button>

          {showRawJson && (
            <pre className="mt-4 p-4 bg-muted rounded-md text-sm overflow-x-auto animate-in fade-in duration-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </Card>
      )}
    </div>
  );
};

export default AnalyzeDocument;