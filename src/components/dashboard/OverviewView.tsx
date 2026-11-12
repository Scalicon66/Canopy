"use client";

import StatCards from "./StatCards";
import PhotoCheck from "./PhotoCheck";
import GardenAnalytics from "./GardenAnalytics";

interface OverviewViewProps {
  onCheckPlant?: () => void;
  onViewHistory?: () => void;
  onViewAllPlants?: () => void;
}

export default function OverviewView({
  onViewHistory,
  onViewAllPlants,
}: OverviewViewProps) {
  return (
    <div className="space-y-6">
      {/* Stat cards - "In your care" opens All Plants */}
      <StatCards
        onViewAllPlants={onViewAllPlants}
        onViewHistory={onViewHistory}
      />

      {/* Photo check section */}
      <section>
        <PhotoCheck />
      </section>

      {/* Statistical Percentage Analysis */}
      <section>
        <GardenAnalytics />
      </section>
    </div>
  );
}
