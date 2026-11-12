"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Camera,
  Search,
  MapPin,
  Calendar,
  Plus,
  Check,
  Trash2,
  Sparkles,
  ArrowRight,
  Sprout,
  Filter,
} from "lucide-react";
import { usePlants } from "@/context/PlantContext";

interface ScannedPlantsViewProps {
  onScanNew?: () => void;
  onViewMyPlants?: () => void;
}

export default function ScannedPlantsView({
  onScanNew,
  onViewMyPlants,
}: ScannedPlantsViewProps) {
  const { scannedPlants, plants, deleteScannedPlant, adoptScannedPlant } = usePlants();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [adoptedIds, setAdoptedIds] = useState<Record<string, boolean>>({});
  const [adoptingId, setAdoptingId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("Living room");

  // Check which plants are already in "My plants"
  const isAlreadyInMyPlants = (plantName: string) => {
    return plants.some(
      (p) => p.name.toLowerCase() === plantName.toLowerCase()
    );
  };

  const handleAdopt = (id: string) => {
    adoptScannedPlant(id, selectedLocation);
    setAdoptedIds((prev) => ({ ...prev, [id]: true }));
    setAdoptingId(null);
  };

  // Filtered scans
  const filteredScans = scannedPlants.filter((plant) => {
    const matchesSearch =
      plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plant.scientificName &&
        plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      plant.locationTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plant.notes && plant.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTag =
      selectedTag === "all"
        ? true
        : selectedTag === "park"
        ? plant.locationTag.toLowerCase().includes("park") ||
          plant.locationTag.toLowerCase().includes("garden")
        : selectedTag === "wild"
        ? plant.locationTag.toLowerCase().includes("trail") ||
          plant.locationTag.toLowerCase().includes("hike")
        : plant.locationTag.toLowerCase().includes("office") ||
          plant.locationTag.toLowerCase().includes("market");

    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-secondary-foreground">
              <Camera size={11} className="text-primary" /> FIELD & PHOTO LOG
            </span>
            <span className="text-xs text-muted-foreground">
              {scannedPlants.length} photos collected
            </span>
          </div>
          <h1 className="mt-1.5 text-display text-[26px] sm:text-[32px] font-semibold text-foreground tracking-tight">
            Scanned plants
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Plants, leaves, and wild flora you've photographed outside your home. These are separate from your personal care collection.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onViewMyPlants && (
            <button
              onClick={onViewMyPlants}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer shadow-xs"
            >
              <Sprout size={14} className="text-primary" />
              <span>My plants ({plants.length})</span>
            </button>
          )}
          {onScanNew && (
            <button
              onClick={onScanNew}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
            >
              <Camera size={14} />
              <span>Scan new leaf</span>
            </button>
          )}
        </div>
      </div>

      {/* Info notice explaining the separation */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2.5 text-foreground/90">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Sparkles size={13} />
          </span>
          <p>
            <strong className="font-semibold text-foreground">Separate from your home collection: </strong>
            Photos taken on walks, in parks, or at botanical gardens are stored here. You can adopt any plant into <strong>My plants</strong> at any time.
          </p>
        </div>
      </div>

      {/* Search & Location Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search scanned species, botanical names, locations…"
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Location Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedTag("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              selectedTag === "all"
                ? "bg-primary text-primary-foreground font-semibold"
                : "border border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            All scans
          </button>
          <button
            onClick={() => setSelectedTag("park")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              selectedTag === "park"
                ? "bg-primary text-primary-foreground font-semibold"
                : "border border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            Parks & Gardens
          </button>
          <button
            onClick={() => setSelectedTag("wild")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              selectedTag === "wild"
                ? "bg-primary text-primary-foreground font-semibold"
                : "border border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            Wild & Hiking
          </button>
          <button
            onClick={() => setSelectedTag("other")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              selectedTag === "other"
                ? "bg-primary text-primary-foreground font-semibold"
                : "border border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            Atriums & Markets
          </button>
        </div>
      </div>

      {/* Scanned Plants Grid */}
      {filteredScans.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredScans.map((plant) => {
            const inCollection =
              isAlreadyInMyPlants(plant.name) || adoptedIds[plant.id];
            const isAdoptingThis = adoptingId === plant.id;

            return (
              <div
                key={plant.id}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_12px_color-mix(in_oklab,var(--foreground)_4%,transparent)] transition-all hover:border-primary/40 hover:shadow-md"
              >
                {/* Photo Preview Container */}
                <div>
                  <div className="relative h-[200px] w-full overflow-hidden bg-muted">
                    <Image
                      src={plant.image_url}
                      alt={plant.name}
                      width={600}
                      height={400}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                    {/* Location Tag */}
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                      <MapPin size={11} className="text-leaf" />
                      <span>{plant.locationTag}</span>
                    </div>

                    {/* Scanned Date */}
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-black/60 px-2.5 py-1 text-[10px] text-white/90 backdrop-blur-md">
                      <Calendar size={11} />
                      <span>{plant.scanned_at}</span>
                    </div>

                    {/* Condition Badge at bottom left of image */}
                    <div className="absolute bottom-3 left-3">
                      <span className="rounded-full bg-card/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold text-foreground shadow-sm">
                        {plant.condition}
                      </span>
                    </div>

                    {/* Delete scan button at bottom right */}
                    <button
                      onClick={() => deleteScannedPlant(plant.id)}
                      title="Remove this scan"
                      aria-label="Remove scan"
                      className="absolute bottom-3 right-3 flex size-7 items-center justify-center rounded-full bg-black/60 text-white/80 hover:bg-destructive hover:text-white transition-colors backdrop-blur-md cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-display text-[16px] font-semibold text-foreground group-hover:text-primary transition-colors">
                          {plant.name}
                        </h3>
                        {plant.scientificName && (
                          <p className="text-[11px] italic text-muted-foreground">
                            {plant.scientificName}
                          </p>
                        )}
                      </div>
                    </div>

                    {plant.notes && (
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {plant.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="border-t border-border/70 bg-muted/20 p-3.5">
                  {isAdoptingThis ? (
                    /* Location picker dropdown when adopting */
                    <div className="space-y-2">
                      <p className="text-[11px] font-medium text-foreground">
                        Where will you place it at home?
                      </p>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedLocation}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          className="h-8 flex-1 rounded-md border border-border bg-card px-2 text-xs text-foreground focus:outline-none"
                        >
                          <option value="Living room">Living room</option>
                          <option value="Balcony">Balcony</option>
                          <option value="Bedroom">Bedroom</option>
                          <option value="Kitchen">Kitchen</option>
                          <option value="Patio">Patio</option>
                          <option value="Office desk">Office desk</option>
                        </select>
                        <button
                          onClick={() => handleAdopt(plant.id)}
                          className="h-8 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setAdoptingId(null)}
                          className="h-8 rounded-md border border-border bg-card px-2 text-xs text-muted-foreground hover:bg-accent cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : inCollection ? (
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-semibold text-primary text-[11px]">
                        <Check size={14} /> Added to your care
                      </span>
                      {onViewMyPlants && (
                        <button
                          onClick={onViewMyPlants}
                          className="text-[11px] font-medium text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                        >
                          View in My plants →
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => setAdoptingId(plant.id)}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Add to My plants</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
          <div className="mb-3.5 grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
            <Camera size={22} />
          </div>
          <h3 className="text-display text-base font-semibold text-foreground">
            No scanned plants found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {searchTerm
              ? `No plant matches "${searchTerm}". Try another search keyword.`
              : "Whenever you take a photo of an outdoor or wild plant, it will be cataloged here."}
          </p>
          {onScanNew && (
            <button
              onClick={onScanNew}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Camera size={14} /> Scan a leaf now
            </button>
          )}
        </div>
      )}
    </div>
  );
}
