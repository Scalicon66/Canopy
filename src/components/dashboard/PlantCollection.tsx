"use client";

import Image from "next/image";
import { Leaf, Sprout, ArrowRight, ArrowUpRight } from "lucide-react";
import { usePlants } from "@/context/PlantContext";

interface PlantCollectionProps {
  onViewAll?: () => void;
}

export default function PlantCollection({ onViewAll }: PlantCollectionProps) {
  const { plants } = usePlants();

  return (
    <section className="mt-9">
      {/* Section header */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
            Your collection
          </p>
          <h2 className="mt-1 text-display text-[20px] font-semibold">
            Plants at home{" "}
            <span className="text-sm font-medium text-muted-foreground">
              ({plants.length})
            </span>
          </h2>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          All plants <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>

      {/* Plant cards grid */}
      <div className="grid gap-3 md:grid-cols-3">
        {plants.map((plant) => {
          const isHealthy = plant.status === "healthy";
          const BadgeIcon = isHealthy ? Sprout : Leaf;
          return (
            <div
              key={plant.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/30"
            >
              <div className="relative">
                <Image
                  src={plant.image_url || "/images/plant-diagnosis-leaf.jpg"}
                  alt={`${plant.name} leaf`}
                  width={1440}
                  height={960}
                  className="size-[48px] rounded-lg object-cover"
                />
                <span
                  className={`absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border-2 border-card ${
                    isHealthy ? "bg-leaf-soft text-primary" : "bg-soil-soft text-soil"
                  }`}
                >
                  <BadgeIcon size={10} aria-hidden="true" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold">
                  {plant.name}
                </p>
                <p className="mt-1 truncate text-[10px] text-muted-foreground">
                  {plant.location} · {plant.last_checked}
                </p>
                <p
                  className={`mt-2 text-[9px] font-bold uppercase tracking-[0.08em] ${
                    isHealthy ? "text-primary" : "text-soil"
                  }`}
                >
                  {plant.statusLabel || (isHealthy ? "Looking good" : "Needs a look")}
                </p>
              </div>
              <button
                className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label={`Open ${plant.name}`}
              >
                <ArrowUpRight size={15} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
