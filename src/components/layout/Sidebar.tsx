"use client";

import { Activity, Sprout, History, Camera, Bell, X, Sparkles, ArrowUpRight } from "lucide-react";
import { usePlants } from "@/context/PlantContext";

export type ViewName = "overview" | "my-plants" | "scanned-plants" | "diagnosis-history" | "notifications";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: ViewName;
  onViewChange: (view: ViewName) => void;
}

export default function Sidebar({ isOpen, onClose, activeView, onViewChange }: SidebarProps) {
  const { plants, scannedPlants, unreadNotificationsCount } = usePlants();

  const navItems: {
    label: string;
    view: ViewName;
    icon: typeof Activity;
    badge: string | null;
  }[] = [
    { label: "Overview", view: "overview", icon: Activity, badge: null },
    { label: "My plants", view: "my-plants", icon: Sprout, badge: String(plants.length) },
    {
      label: "Notifications",
      view: "notifications",
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? String(unreadNotificationsCount) : null,
    },
    { label: "Diagnosis history", view: "diagnosis-history", icon: History, badge: null },
  ];
  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: slides in from the right on mobile, pinned to left on desktop */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-[270px] flex-col bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-in-out lg:left-0 lg:right-auto lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[248px] lg:shadow-none lg:translate-x-0 ${
          isOpen ? "flex translate-x-0" : "hidden lg:flex"
        }`}
      >
        {/* Drawer Header: Logo on the left, Close (X) button on the right */}
        <div className="flex h-[82px] items-center justify-between px-6 lg:px-7">
          <button
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              onViewChange("overview");
              onClose();
            }}
          >
            <span className="grid size-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
              <Sprout size={21} strokeWidth={2.1} aria-hidden="true" />
            </span>
            <span className="text-display text-[21px] font-semibold text-sidebar-foreground">
              canopy<span className="text-sidebar-primary">.</span>
            </span>
          </button>

          {/* Close button on mobile */}
          <button
            className="inline-flex items-center justify-center rounded-lg h-9 w-9 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors lg:hidden cursor-pointer"
            aria-label="Close menu"
            onClick={onClose}
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {/* Workspace nav */}
        <div className="px-4 pt-6">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-sidebar-foreground/55">
            Workspace
          </p>
          <nav className="mt-3 space-y-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => {
                    onViewChange(item.view);
                    onClose();
                  }}
                  className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-[13px] font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-md bg-sidebar-foreground/10 px-2 py-0.5 text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* External flora */}
        <div className="mt-7 border-t border-sidebar-border px-4 pt-6">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-sidebar-foreground/55">
            External flora
          </p>
          <button
            onClick={() => {
              onViewChange("scanned-plants");
              onClose();
            }}
            className={`mt-3 flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-[13px] font-medium transition-colors cursor-pointer ${
              activeView === "scanned-plants"
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Camera size={17} strokeWidth={1.8} aria-hidden="true" />
            <span>Scanned plants</span>
            <span className="ml-auto rounded-md bg-sidebar-foreground/10 px-2 py-0.5 text-[10px]">
              {scannedPlants.length}
            </span>
          </button>
        </div>

        {/* Upgrade card */}
        <div className="mt-auto p-4">
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-sidebar-accent-foreground">
              <Sparkles size={14} aria-hidden="true" />
              Grow smarter
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-sidebar-foreground/60">
              Unlock advanced health diagnostics with Canopy Pro.
            </p>
            <button className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-sidebar-primary hover:underline cursor-pointer">
              Explore Pro
              <ArrowUpRight size={12} aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
