"use client";

import { Sprout, ShieldCheck, Droplets, ArrowUpRight, ArrowRight } from "lucide-react";
import { usePlants } from "@/context/PlantContext";

interface StatCardsProps {
  onViewAllPlants?: () => void;
  onViewHistory?: () => void;
}

export default function StatCards({ onViewAllPlants, onViewHistory }: StatCardsProps) {
  const { plants, diagnoses } = usePlants();

  const healthyCount = plants.filter((p) => p.status === "healthy").length;
  const needsAttentionCount = plants.filter(
    (p) => p.status === "needs_attention" || p.status === "critical"
  ).length;

  return (
    <section className="grid grid-cols-3 gap-2 sm:gap-4" aria-label="Garden summary">
      {/* 1. In your care -> Clicks to All Plants */}
      <div
        onClick={onViewAllPlants}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onViewAllPlants?.();
          }
        }}
        title="Click to view all plants in your collection"
        className="group flex flex-col sm:flex-row items-start gap-2 sm:gap-3 rounded-xl border border-border bg-card p-2.5 sm:px-4 sm:py-4 shadow-[0_2px_12px_color-mix(in_oklab,var(--foreground)_4%,transparent)] transition-all hover:border-primary/50 hover:shadow-md hover:bg-card/90 cursor-pointer min-w-0"
      >
        <div className="flex w-full items-center justify-between sm:w-auto">
          <span className="grid size-7 sm:size-9 shrink-0 place-items-center rounded-lg bg-leaf-soft text-primary transition-transform group-hover:scale-105">
            <Sprout size={15} strokeWidth={2.1} className="sm:size-[17px]" aria-hidden="true" />
          </span>
          <span className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all sm:hidden">
            <ArrowUpRight size={13} aria-hidden="true" />
          </span>
        </div>

        <div className="min-w-0 flex-1 w-full">
          <p className="truncate text-[10px] sm:text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
            In your care
          </p>
          <p className="mt-0.5 text-display text-[14px] sm:text-[18px] font-semibold text-foreground tracking-tight leading-tight">
            {plants.length} plant{plants.length === 1 ? "" : "s"}
          </p>
          <p className="mt-0.5 truncate text-[9px] sm:text-[10px] text-muted-foreground">
            All tucked in
          </p>
        </div>

        <span className="hidden sm:block ml-auto mt-0.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0">
          <ArrowUpRight size={15} aria-hidden="true" />
        </span>
      </div>

      {/* 2. Health checks -> Clicks to Diagnosis History */}
      <div
        onClick={onViewHistory}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onViewHistory?.();
          }
        }}
        title="Click to view diagnosis history"
        className="group flex flex-col sm:flex-row items-start gap-2 sm:gap-3 rounded-xl border border-border bg-card p-2.5 sm:px-4 sm:py-4 shadow-[0_2px_12px_color-mix(in_oklab,var(--foreground)_4%,transparent)] transition-all hover:border-soil/40 hover:shadow-md cursor-pointer min-w-0"
      >
        <div className="flex w-full items-center justify-between sm:w-auto">
          <span className="grid size-7 sm:size-9 shrink-0 place-items-center rounded-lg bg-soil-soft text-soil transition-transform group-hover:scale-105">
            <ShieldCheck size={15} strokeWidth={2.1} className="sm:size-[17px]" aria-hidden="true" />
          </span>
          <span className="text-muted-foreground group-hover:text-soil group-hover:translate-x-0.5 transition-all sm:hidden">
            <ArrowRight size={13} aria-hidden="true" />
          </span>
        </div>

        <div className="min-w-0 flex-1 w-full">
          <p className="truncate text-[10px] sm:text-[11px] text-muted-foreground">
            Health checks
          </p>
          <p className="mt-0.5 text-display text-[14px] sm:text-[18px] font-semibold text-foreground tracking-tight leading-tight truncate">
            <span className="sm:hidden">{healthyCount} good</span>
            <span className="hidden sm:inline">{healthyCount} looking good</span>
          </p>
          <p className="mt-0.5 truncate text-[9px] sm:text-[10px] text-muted-foreground">
            {needsAttentionCount > 0
              ? `${needsAttentionCount} need a look`
              : "All flourishing"}
          </p>
        </div>

        <span className="hidden sm:block ml-auto mt-0.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0">
          <ArrowRight size={14} aria-hidden="true" />
        </span>
      </div>

      {/* 3. Next reminder */}
      <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 rounded-xl border border-border bg-card p-2.5 sm:px-4 sm:py-4 shadow-[0_2px_12px_color-mix(in_oklab,var(--foreground)_4%,transparent)] min-w-0">
        <span className="grid size-7 sm:size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Droplets size={15} strokeWidth={2.1} className="sm:size-[17px]" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1 w-full">
          <p className="truncate text-[10px] sm:text-[11px] text-muted-foreground">
            Next reminder
          </p>
          <p className="mt-0.5 text-display text-[14px] sm:text-[18px] font-semibold text-foreground tracking-tight leading-tight truncate">
            Water today
          </p>
          <p className="mt-0.5 truncate text-[9px] sm:text-[10px] text-muted-foreground">
            {plants[0]?.name || "Monstera"}
          </p>
        </div>
      </div>
    </section>
  );
}
