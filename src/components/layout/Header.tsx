"use client";

import {
  Search,
  Bell,
  Menu,
  Sprout,
} from "lucide-react";
import { usePlants } from "@/context/PlantContext";

interface HeaderProps {
  onMenuClick: () => void;
  onNotificationsClick?: () => void;
  isNotificationsActive?: boolean;
}

export default function Header({
  onMenuClick,
  onNotificationsClick,
  isNotificationsActive,
}: HeaderProps) {
  const { unreadNotificationsCount } = usePlants();

  return (
    <header className="sticky top-0 z-20 flex h-[64px] items-center justify-between gap-4 border-b border-border bg-background/80 px-5 backdrop-blur-sm sm:px-8 lg:px-11">
      {/* Left side: Mobile Logo OR Desktop Search */}
      <div className="flex items-center gap-3">
        {/* Mobile Logo on the Left */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <span className="grid size-8 place-items-center rounded-xl bg-sidebar text-sidebar-primary-foreground shadow-sm">
            <Sprout size={18} strokeWidth={2.2} className="text-leaf" aria-hidden="true" />
          </span>
          <span className="text-display text-[20px] font-semibold text-foreground tracking-tight">
            canopy<span className="text-primary">.</span>
          </span>
        </div>

        {/* Search on larger screens */}
        <div className="relative hidden sm:block">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search plants, tips, history…"
            className="h-9 w-[240px] rounded-lg border border-border bg-muted/50 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring lg:w-[320px]"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side: Notification Button, Avatar, and Mobile Menu Items Button */}
      <div className="flex items-center gap-1.5">
        {/* Notifications Button (transforms to full Notifications view) */}
        <button
          onClick={onNotificationsClick}
          aria-label="Notifications"
          title={
            unreadNotificationsCount > 0
              ? `${unreadNotificationsCount} unread notifications`
              : "Notifications"
          }
          className={`relative inline-flex items-center justify-center rounded-lg h-9 w-9 transition-colors cursor-pointer ${
            isNotificationsActive
              ? "bg-accent text-accent-foreground font-semibold ring-1 ring-primary/40 shadow-xs"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Bell size={18} aria-hidden="true" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute right-2 top-2 size-2 rounded-full bg-soil ring-2 ring-background animate-pulse" />
          )}
        </button>

        {/* User Avatar */}
        <span className="ml-1 hidden size-8 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground sm:grid">
          OA
        </span>

        {/* Mobile Menu Button on the Right */}
        <button
          className="inline-flex items-center justify-center rounded-lg h-9 w-9 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors lg:hidden ml-1 cursor-pointer"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <Menu size={22} strokeWidth={2.1} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
