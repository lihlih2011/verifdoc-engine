"use client";

import React, { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Image as ImageIcon, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const NewAnalyse = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
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

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier à analyser.");
      return;
    }

    setLoading(true);
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
        throw new Error(errorData.error || `Erreur HTTP! statut: ${res.status}`);
      }

      const data = await res.json();
      toast.success("Analyse lancée avec succès !");
      // Redirect to the analysis detail page, passing the analysis ID
      navigate(`/dashboard/analysis/${data.record_id}`);
    } catch (e: any) {
      setError(e.message || "Une erreur inattendue est survenue pendant l'analyse.");
      toast.error(e.message || "Échec de l'analyse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground mb-3">
          Nouvelle analyse
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Déposez un document et lancez l’analyse IA en toute simplicité.
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
              <div className="mt-4 p-4 border rounded-md flex items-center space-x-4 bg-muted/50 relative">
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                  onClick={handleRemoveFile}
                  aria-label="Supprimer le fichier"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
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
                "Lancer l’analyse IA"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewAnalyse;