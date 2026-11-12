"use client";

import Image from "next/image";
import { Clock3, Search, ArrowRight, Leaf, Sprout, ShieldCheck } from "lucide-react";
import { usePlants } from "@/context/PlantContext";

export default function DiagnosisHistoryView() {
  const { diagnoses, openCheckModal } = usePlants();

  const healthyCount = diagnoses.filter((d) => d.severity === "healthy").length;
  const needsAttentionCount = diagnoses.filter(
    (d) => d.severity === "needs_attention" || d.severity === "critical"
  ).length;

  return (
    <div>
      {/* Page heading */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            <span className="h-px w-5 bg-primary" />
            Your plant health timeline
          </p>
          <h1 className="text-display text-[30px] font-semibold leading-tight sm:text-[36px]">
            Diagnosis history
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Every check-in tells a story. Here&apos;s the full picture.
          </p>
        </div>
        <button
          onClick={openCheckModal}
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 py-2 h-10 gap-2 rounded-lg px-4 shadow-sm"
        >
          Check a plant
        </button>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <span className="grid size-8 place-items-center rounded-lg bg-leaf-soft text-primary">
            <ShieldCheck size={15} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] text-muted-foreground">Total checks</p>
            <p className="text-display text-[16px] font-semibold">
              {diagnoses.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <span className="grid size-8 place-items-center rounded-lg bg-leaf-soft text-primary">
            <Sprout size={15} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] text-muted-foreground">Healthy results</p>
            <p className="text-display text-[16px] font-semibold">
              {healthyCount}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <span className="grid size-8 place-items-center rounded-lg bg-soil-soft text-soil">
            <Leaf size={15} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] text-muted-foreground">Needs attention</p>
            <p className="text-display text-[16px] font-semibold">
              {needsAttentionCount}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {diagnoses.map((entry) => {
          const isHealthy = entry.severity === "healthy";
          const BadgeIcon = isHealthy ? Sprout : Leaf;
          return (
            <div
              key={entry.id}
              className="rounded-xl border border-border bg-card p-4 shadow-[0_2px_12px_color-mix(in_oklab,var(--foreground)_4%,transparent)] transition-colors hover:border-primary/30"
            >
              <div className="flex gap-3">
                <Image
                  src={entry.image_url || "/images/plant-diagnosis-leaf.jpg"}
                  alt={`${entry.plant_name} leaf`}
                  width={1440}
                  height={960}
                  className="size-[52px] shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{entry.plant_name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                        isHealthy ? "bg-leaf-soft text-primary" : "bg-soil-soft text-soil"
                      }`}
                    >
                      {entry.severityLabel?.toUpperCase() || (isHealthy ? "LOOKING GOOD" : "NEEDS A LOOK")}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {entry.issue}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock3 size={11} aria-hidden="true" />
                    {entry.created_at}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {entry.notes && (
                <div className="mt-3 rounded-lg bg-secondary/70 p-3">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-secondary-foreground">
                    <span className="grid size-5 place-items-center rounded-full bg-card text-primary">
                      <Search size={11} aria-hidden="true" />
                    </span>
                    Diagnosis notes
                  </div>
                  <p className="mt-1.5 pl-7 text-[11px] leading-relaxed text-muted-foreground">
                    {entry.notes}
                  </p>
                </div>
              )}

              {/* Action steps if present */}
              {entry.action_steps && entry.action_steps.length > 0 && (
                <div className="mt-2.5 pl-7 space-y-1">
                  {entry.action_steps.map((step, idx) => (
                    <p key={idx} className="text-[11px] text-foreground/80 flex items-center gap-1.5">
                      <span className="size-1 rounded-full bg-primary" /> {step}
                    </p>
                  ))}
                </div>
              )}

              <button className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                View details <ArrowRight size={12} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
