"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Ellipsis,
  Search,
  Clock3,
  ArrowRight,
  CheckCircle2,
  Share2,
  Trash2,
  Check,
} from "lucide-react";
import { usePlants } from "@/context/PlantContext";

interface LatestCheckInProps {
  onViewHistory?: () => void;
}

export default function LatestCheckIn({ onViewHistory }: LatestCheckInProps) {
  const { diagnoses, resolveDiagnosis, deleteDiagnosis } = usePlants();
  const latest = diagnoses[0];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  if (!latest) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center shadow-[0_2px_12px_color-mix(in_oklab,var(--foreground)_4%,transparent)]">
        <p className="text-display text-[16px] font-semibold">No recent check-ins</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Use the Photo Check above to inspect a leaf and diagnose your plants.
        </p>
      </div>
    );
  }

  // Action 2: Mark as resolved
  const handleMarkResolved = () => {
    resolveDiagnosis(latest.id);
    setIsMenuOpen(false);
    setNotice("Marked as resolved! Plant health restored to good.");
    setTimeout(() => setNotice(null), 3000);
  };

  // Action 3: Share diagnosis
  const handleShare = async () => {
    const shareText = `🌿 Canopy Plant Check-in:
Plant: ${latest.plant_name}
Status: ${latest.severityLabel || latest.severity}
Issue: ${latest.issue}
Notes: ${latest.notes}`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn("Clipboard access failed", err);
    }
    setIsMenuOpen(false);
  };

  // Action 4: Delete check-in
  const handleDelete = () => {
    deleteDiagnosis(latest.id);
    setIsMenuOpen(false);
  };

  const isHealthy = latest.severity === "healthy";

  return (
    <div className="relative rounded-xl border border-border bg-card p-5 shadow-[0_2px_12px_color-mix(in_oklab,var(--foreground)_4%,transparent)] sm:p-6 transition-all">
      {/* Header with 3 Dots Menu */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-display text-[18px] font-semibold">
            Latest check-in
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            A sample from your garden
          </p>
        </div>

        {/* 3 Dots Menu Container */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="More check-in options"
            aria-expanded={isMenuOpen}
            className={`inline-flex items-center justify-center rounded-md h-9 w-9 -mr-2 -mt-2 transition-colors cursor-pointer ${
              isMenuOpen
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Ellipsis size={18} aria-hidden="true" />
          </button>

          {/* Interactive Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-8 z-30 w-52 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-xl backdrop-blur-md animate-in fade-in-50 zoom-in-95">
              {/* Option 2: Mark as resolved */}
              <button
                onClick={handleMarkResolved}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                <CheckCircle2 size={15} className="text-primary" />
                <span>Mark as resolved</span>
              </button>

              {/* Option 3: Share diagnosis */}
              <button
                onClick={handleShare}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                <Share2 size={15} className="text-muted-foreground" />
                <span>Share diagnosis</span>
              </button>

              <div className="my-1 border-t border-border/70" />

              {/* Option 4: Delete check-in */}
              <button
                onClick={handleDelete}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
                <span>Delete check-in</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Temporary Toast feedback for Copy or Resolve */}
      {copied && (
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-leaf-soft px-3 py-1.5 text-xs font-medium text-primary animate-in fade-in">
          <Check size={14} />
          <span>Diagnosis copied to clipboard!</span>
        </div>
      )}

      {notice && (
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-leaf-soft px-3 py-1.5 text-xs font-medium text-primary animate-in fade-in">
          <CheckCircle2 size={14} />
          <span>{notice}</span>
        </div>
      )}

      {/* Plant info */}
      <div className="mt-5 flex gap-3">
        <Image
          src={latest.image_url || "/images/plant-diagnosis-leaf.jpg"}
          alt={`${latest.plant_name} leaf`}
          width={1440}
          height={960}
          className="size-[62px] shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">{latest.plant_name}</h2>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                isHealthy
                  ? "bg-leaf-soft text-primary"
                  : "bg-soil-soft text-soil"
              }`}
            >
              {latest.severityLabel?.toUpperCase() || (isHealthy ? "LOOKING GOOD" : "NEEDS A LOOK")}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {latest.issue}
          </p>
          <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock3 size={12} aria-hidden="true" />
            {latest.created_at}
          </p>
        </div>
      </div>

      {/* Insight box */}
      <div className="mt-4 rounded-lg bg-secondary/70 p-3.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-secondary-foreground">
          <span className="grid size-6 place-items-center rounded-full bg-card text-primary">
            <Search size={13} aria-hidden="true" />
          </span>
          {isHealthy ? "Health update" : "Something to keep an eye on"}
        </div>
        <p className="mt-2 pl-8 text-[11px] leading-relaxed text-muted-foreground">
          {latest.notes}
        </p>
      </div>

      <button
        onClick={onViewHistory}
        className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
      >
        View check-in history <ArrowRight size={13} aria-hidden="true" />
      </button>
    </div>
  );
}
