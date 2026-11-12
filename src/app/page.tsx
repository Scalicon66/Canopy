"use client";

import { useState } from "react";
import Sidebar, { type ViewName } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import OverviewView from "@/components/dashboard/OverviewView";
import MyPlantsView from "@/components/dashboard/MyPlantsView";
import ScannedPlantsView from "@/components/dashboard/ScannedPlantsView";
import DiagnosisHistoryView from "@/components/dashboard/DiagnosisHistoryView";
import { PlantProvider } from "@/context/PlantContext";

function MainContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewName>("overview");

  const handleCheckPlant = () => {
    setActiveView("overview");
    setTimeout(() => {
      const el = document.getElementById("photo-check");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  };

  const renderView = () => {
    switch (activeView) {
      case "overview":
        return (
          <OverviewView
            onCheckPlant={handleCheckPlant}
            onViewHistory={() => setActiveView("diagnosis-history")}
            onViewAllPlants={() => setActiveView("my-plants")}
          />
        );
      case "my-plants":
        return <MyPlantsView />;
      case "scanned-plants":
        return (
          <ScannedPlantsView
            onScanNew={handleCheckPlant}
            onViewMyPlants={() => setActiveView("my-plants")}
          />
        );
      case "diagnosis-history":
        return <DiagnosisHistoryView />;
      default:
        return (
          <OverviewView
            onCheckPlant={handleCheckPlant}
            onViewHistory={() => setActiveView("diagnosis-history")}
            onViewAllPlants={() => setActiveView("my-plants")}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Content Area */}
      <main className="flex min-h-screen flex-col bg-background">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Content container */}
        <div className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-between px-5 pt-6 sm:px-8 lg:px-11 lg:pt-8 pb-3">
          <div>{renderView()}</div>

          {/* Regular Footer */}
          <footer className="mt-8 border-t border-border pt-4 pb-1 text-center text-xs text-muted-foreground">
            <p>© 2026 Canopy, Inc. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <PlantProvider>
      <MainContent />
    </PlantProvider>
  );
}
