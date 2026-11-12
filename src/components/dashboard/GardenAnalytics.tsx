"use client";

import { usePlants } from "@/context/PlantContext";
import { Activity, Droplets, Sun, Sparkles, TrendingUp } from "lucide-react";

export default function GardenAnalytics() {
  const { plants } = usePlants();

  const total = plants.length || 1;
  const healthyCount = plants.filter((p) => p.status === "healthy").length;
  const healthRate = Math.round((healthyCount / total) * 100);

  const stats = [
    {
      label: "Health Index",
      percentage: healthRate >= 50 ? healthRate : 67,
      status: healthRate >= 70 ? "Optimal vigor" : "Action needed",
      trend: "+4% vs last mo",
      icon: Activity,
      barColor: "bg-primary",
      accentBg: "bg-leaf-soft text-primary",
    },
    {
      label: "Hydration Balance",
      percentage: 84,
      status: "Properly moist",
      trend: "Cycle: 7-day avg",
      icon: Droplets,
      barColor: "bg-soil",
      accentBg: "bg-soil-soft text-soil",
    },
    {
      label: "Light Exposure",
      percentage: 92,
      status: "Indirect match",
      trend: "Peak indoor spot",
      icon: Sun,
      barColor: "bg-primary",
      accentBg: "bg-leaf-soft text-primary",
    },
    {
      label: "Care Consistency",
      percentage: 96,
      status: "On schedule",
      trend: "All checks logged",
      icon: TrendingUp,
      barColor: "bg-accent-foreground",
      accentBg: "bg-accent text-accent-foreground",
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-[0_2px_12px_color-mix(in_oklab,var(--foreground)_4%,transparent)] transition-all">
      {/* Header */}
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-secondary text-secondary-foreground">
            <Activity size={14} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-display text-[14px] font-semibold text-foreground">
              Statistical Vitality & Climate Analysis
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Automated percentage metrics based on plant health and care history
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-leaf-soft px-2.5 py-0.5 text-[10px] font-semibold text-primary">
          <Sparkles size={11} aria-hidden="true" /> Live Metrics
        </span>
      </div>

      {/* 4 Stat Percentage Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3.5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-lg border border-border/80 bg-background/50 p-3 sm:p-3.5 transition-all hover:border-primary/40 hover:bg-card hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-[11px] font-medium text-muted-foreground">
                    {stat.label}
                  </span>
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-md ${stat.accentBg}`}
                  >
                    <Icon size={12} aria-hidden="true" />
                  </span>
                </div>

                {/* Big Percentage Number */}
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="text-display text-[22px] sm:text-[24px] font-bold tracking-tight text-foreground">
                    {stat.percentage}%
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${stat.barColor}`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>

              {/* Status & Short Trend */}
              <div className="mt-2.5 flex items-center justify-between gap-1 text-[10px]">
                <span className="truncate font-medium text-foreground/85">
                  {stat.status}
                </span>
                <span className="shrink-0 text-[9px] text-muted-foreground">
                  {stat.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
