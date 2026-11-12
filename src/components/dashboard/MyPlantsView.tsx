"use client";

import { useState } from "react";
import Image from "next/image";
import { Leaf, Sprout, ArrowUpRight, Search, Plus, Droplets, Sun, MapPin, X } from "lucide-react";
import { usePlants } from "@/context/PlantContext";

export default function MyPlantsView() {
  const { plants, addPlant, openCheckModal } = usePlants();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "healthy" | "needs_attention">("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const filteredPlants = plants.filter((plant) => {
    const matchesSearch =
      plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : plant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addPlant({
      name: newName.trim(),
      location: newLocation.trim() || "Indoor",
      image_url: "/images/plant-diagnosis-leaf.jpg",
      status: "healthy",
      statusLabel: "Looking good",
      last_checked: "Just added",
      waterSchedule: "Every 7 days",
      lightNeeds: "Bright indirect",
    });

    setNewName("");
    setNewLocation("");
    setIsAddOpen(false);
  };

  return (
    <div>
      {/* Page heading */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            <span className="h-px w-5 bg-primary" />
            Your green family
          </p>
          <h1 className="text-display text-[30px] font-semibold leading-tight sm:text-[36px]">
            My plants
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Every plant in your care, all in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 py-2 h-10 gap-2 rounded-lg px-4 shadow-sm"
          >
            <Plus size={17} aria-hidden="true" />
            Add a plant
          </button>
        </div>
      </div>

      {/* Add Plant Modal/Dialog */}
      {isAddOpen && (
        <div className="mb-6 rounded-xl border border-primary/30 bg-card p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-semibold">Add a new plant</h3>
            <button
              onClick={() => setIsAddOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleAddSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground">Plant name</label>
              <input
                type="text"
                required
                placeholder="e.g. Calathea Orbifolia"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-muted/40 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Location</label>
              <input
                type="text"
                placeholder="e.g. Dining table, Bookshelf"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-muted/40 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Save plant
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & filter bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your plants by name or room…"
            className="h-9 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 h-9 text-xs font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            All ({plants.length})
          </button>
          <button
            onClick={() => setStatusFilter("healthy")}
            className={`rounded-lg px-3 h-9 text-xs font-medium transition-colors ${
              statusFilter === "healthy"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            Looking good
          </button>
          <button
            onClick={() => setStatusFilter("needs_attention")}
            className={`rounded-lg px-3 h-9 text-xs font-medium transition-colors ${
              statusFilter === "needs_attention"
                ? "bg-soil text-white"
                : "border border-border bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            Needs a look
          </button>
        </div>
      </div>

      {/* Plant cards */}
      <div className="space-y-3">
        {filteredPlants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <Sprout size={32} className="mx-auto text-muted-foreground/60" />
            <p className="mt-3 text-sm font-semibold">No plants found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search or add a new plant to your collection.
            </p>
          </div>
        ) : (
          filteredPlants.map((plant) => {
            const isHealthy = plant.status === "healthy";
            const BadgeIcon = isHealthy ? Sprout : Leaf;
            return (
              <div
                key={plant.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 shadow-[0_2px_12px_color-mix(in_oklab,var(--foreground)_4%,transparent)]"
              >
                {/* Image */}
                <div className="relative shrink-0">
                  <Image
                    src={plant.image_url || "/images/plant-diagnosis-leaf.jpg"}
                    alt={`${plant.name} leaf`}
                    width={1440}
                    height={960}
                    className="size-[64px] rounded-xl object-cover sm:size-[80px]"
                  />
                  <span
                    className={`absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border-2 border-card ${
                      isHealthy ? "bg-leaf-soft text-primary" : "bg-soil-soft text-soil"
                    }`}
                  >
                    <BadgeIcon size={10} aria-hidden="true" />
                  </span>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-semibold">{plant.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                        isHealthy ? "bg-leaf-soft text-primary" : "bg-soil-soft text-soil"
                      }`}
                    >
                      {plant.statusLabel || (isHealthy ? "LOOKING GOOD" : "NEEDS A LOOK")}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} aria-hidden="true" />
                      {plant.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets size={11} aria-hidden="true" />
                      {plant.waterSchedule || "Every 7 days"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sun size={11} aria-hidden="true" />
                      {plant.lightNeeds || "Bright indirect"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    Last checked · {plant.last_checked}
                  </p>
                </div>

                {/* Action */}
                <button
                  className="inline-flex items-center justify-center rounded-md h-9 w-9 shrink-0 hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label={`Open ${plant.name}`}
                >
                  <ArrowUpRight size={16} aria-hidden="true" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 rounded-xl border border-border bg-muted/50 p-4 text-center">
        <p className="text-xs text-muted-foreground">
          You have{" "}
          <span className="font-semibold text-foreground">
            {plants.length} plant{plants.length === 1 ? "" : "s"}
          </span>{" "}
          in your collection.
        </p>
        <button
          onClick={openCheckModal}
          className="mt-2 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
        >
          🔍 Run an AI photo check on a leaf
        </button>
      </div>
    </div>
  );
}
