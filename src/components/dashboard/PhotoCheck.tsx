"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import {
  Camera,
  Upload,
  CircleHelp,
  FlaskConical,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Droplets,
  Sun,
  X,
} from "lucide-react";
import { DiagnosisResult } from "@/types";
import { usePlants } from "@/context/PlantContext";

export default function PhotoCheck() {
  const { addDiagnosis } = usePlants();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>("Preparing photo...");
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedImage(reader.result);
        setSelectedFileName(file.name);
        setResult(null);
        setIsSaved(false);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  // The 'x' action that dismisses the photo and returns the upload cube
  const handleDismissPhoto = () => {
    setSelectedImage(null);
    setSelectedFileName(null);
    setResult(null);
    setIsSaved(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const runDiagnosis = async () => {
    if (!selectedImage) {
      setError("Please choose or drop a leaf photo first to run the health check.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setIsSaved(false);

    const steps = [
      "Inspecting leaf surface and color balance...",
      "Detecting signs of moisture, pests, or nutrient stress...",
      "Generating botanical care recommendations...",
    ];

    let stepIdx = 0;
    setAnalysisStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setAnalysisStep(steps[stepIdx]);
      }
    }, 1200);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: "image/jpeg",
        }),
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        throw new Error("Diagnosis service encountered an issue");
      }

      const data: DiagnosisResult = await res.json();
      setResult(data);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      console.error(err);
      setError("Unable to complete diagnosis. Please try again with another photo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToHistory = () => {
    if (!result || !selectedImage) return;
    addDiagnosis(result, selectedImage);
    setIsSaved(true);
  };

  return (
    <div
      id="photo-check"
      className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_12px_color-mix(in_oklab,var(--foreground)_4%,transparent)] transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <div>
          <p className="text-display text-[18px] font-semibold">A closer look</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a leaf photo to start a plant health check.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {result?.isDemo && (
            <span className="hidden items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[9px] font-semibold text-amber-700 sm:inline-flex dark:text-amber-400">
              Demo preview
            </span>
          )}
          <span className="hidden items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-secondary-foreground sm:flex">
            <span className="size-1.5 rounded-full bg-primary" /> PHOTO CHECK
          </span>
        </div>
      </div>

      {/* Main Container: Upload Cube vs Full Photo Preview */}
      <div className="mx-5 sm:mx-6">
        {selectedImage ? (
          /* When a photo is selected: Full clean photo preview with floating 'X' button */
          <div className="group relative flex h-[260px] w-full items-center justify-center overflow-hidden rounded-xl border border-border sm:h-[320px] bg-muted shadow-inner">
            <Image
              src={selectedImage}
              alt="Leaf to diagnose"
              width={1440}
              height={960}
              unoptimized
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            />

            {/* Floating 'X' Dismiss Button (makes photo disappear and cube return) */}
            {!isAnalyzing && (
              <button
                type="button"
                onClick={handleDismissPhoto}
                aria-label="Remove photo"
                title="Remove photo and choose another"
                className="absolute right-3.5 top-3.5 z-20 flex size-9 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-md transition-all hover:bg-black/85 hover:scale-110 active:scale-95 cursor-pointer"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            )}

            {/* Photo filename tag at bottom */}
            {selectedFileName && !isAnalyzing && (
              <div className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[80%] truncate rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                {selectedFileName}
              </div>
            )}

            {/* Scanning Animation overlay during analysis */}
            {isAnalyzing && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/55 backdrop-blur-sm px-4">
                <div className="relative mb-3 flex size-14 items-center justify-center rounded-2xl bg-card text-primary shadow-xl">
                  <RefreshCw size={24} className="animate-spin text-primary" />
                </div>
                <p className="text-center text-sm font-semibold text-white">
                  Diagnosing with Canopy AI
                </p>
                <p className="mt-1 text-center text-xs text-white/80 animate-pulse max-w-xs">
                  {analysisStep}
                </p>
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-leaf to-transparent animate-pulse" />
              </div>
            )}
          </div>
        ) : (
          /* When no photo is selected: Clean Drop Photo White Cube */
          <div
            onClick={triggerUpload}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative flex h-[245px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all sm:h-[280px] ${
              isDragging
                ? "border-primary bg-primary/10 scale-[0.99]"
                : "border-border/90 bg-card hover:border-primary/50 hover:bg-muted/30 shadow-[0_2px_8px_color-mix(in_oklab,var(--foreground)_3%,transparent)]"
            }`}
          >
            <div className="mb-3.5 grid size-12 place-items-center rounded-2xl bg-secondary text-primary shadow-sm transition-transform duration-200 group-hover:scale-110">
              <Camera size={22} aria-hidden="true" />
            </div>
            <p className="text-display text-[16px] font-semibold text-foreground">
              Drop your leaf photo here
            </p>
            <p className="mt-1.5 text-[12px] text-muted-foreground max-w-[280px]">
              Drag and drop an image of a single leaf, or browse files from your device
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerUpload();
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[11px] font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Upload size={14} aria-hidden="true" />
              Choose photo
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          className="sr-only"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          aria-label="Choose a plant photo"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-5 mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive sm:mx-6">
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Action bar / Diagnosis Result Card */}
      {!result ? (
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <CircleHelp size={14} aria-hidden="true" />
            <span>For the clearest check, photograph one leaf in natural light.</span>
          </div>
          <button
            onClick={runDiagnosis}
            disabled={isAnalyzing || !selectedImage}
            className={`inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring py-2 h-9 shrink-0 gap-2 rounded-lg px-4 text-xs shadow ${
              selectedImage && !isAnalyzing
                ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
            }`}
          >
            <FlaskConical size={15} aria-hidden="true" />
            {isAnalyzing ? "Analyzing leaf…" : "Prepare health check"}
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
      ) : (
        /* Diagnosis Result View */
        <div className="border-t border-border bg-card/50 p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <Sparkles size={13} />
                  Canopy AI Diagnosis
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                    result.severity === "healthy"
                      ? "bg-leaf-soft text-primary"
                      : "bg-soil-soft text-soil"
                  }`}
                >
                  {result.severityLabel.toUpperCase()}
                </span>
              </div>
              <h3 className="mt-1 text-display text-[20px] font-semibold">
                {result.plantName}
              </h3>
              <p className="text-xs text-muted-foreground">{result.issue}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDismissPhoto}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <X size={13} /> Check another
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-secondary/60 p-4 space-y-2">
            <p className="text-[12px] leading-relaxed text-foreground font-medium">
              {result.summary}
            </p>
            {result.notes && (
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {result.notes}
              </p>
            )}
          </div>

          {result.actionSteps && result.actionSteps.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Care steps to take
              </p>
              <ul className="space-y-1.5">
                {result.actionSteps.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-foreground/90 bg-muted/40 p-2.5 rounded-lg"
                  >
                    <CheckCircle2
                      size={15}
                      className="mt-0.5 shrink-0 text-primary"
                    />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2 pt-1 text-xs">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5">
              <span className="grid size-7 place-items-center rounded-md bg-accent text-accent-foreground">
                <Droplets size={14} />
              </span>
              <div>
                <p className="text-[10px] text-muted-foreground">Water schedule</p>
                <p className="text-[11px] font-medium">{result.wateringSchedule}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5">
              <span className="grid size-7 place-items-center rounded-md bg-leaf-soft text-primary">
                <Sun size={14} />
              </span>
              <div>
                <p className="text-[10px] text-muted-foreground">Light needs</p>
                <p className="text-[11px] font-medium">{result.lightRecommendation}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
            <p className="text-[10px] text-muted-foreground">
              {result.isDemo
                ? "💡 Preview mode. Set GEMINI_API_KEY in .env.local to use live Gemini model."
                : "✨ Powered by Google Gemini 3.8 Flash"}
            </p>
            <button
              onClick={handleSaveToHistory}
              disabled={isSaved}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-colors ${
                isSaved
                  ? "bg-leaf-soft text-primary cursor-default"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              }`}
            >
              <CheckCircle2 size={14} />
              {isSaved ? "Saved to your garden history" : "Save to Diagnosis History"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
