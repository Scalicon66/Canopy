"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  Menu,
  Sprout,
  Droplets,
  FlaskConical,
  Sun,
  Check,
  CheckCheck,
  X,
} from "lucide-react";
import { usePlants } from "@/context/PlantContext";
import { NotificationType } from "@/types";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    dismissNotification,
  } = usePlants();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotifOpen]);

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case "reminder":
        return {
          icon: Droplets,
          bg: "bg-accent text-accent-foreground",
          badge: "Care reminder",
        };
      case "followup":
        return {
          icon: FlaskConical,
          bg: "bg-soil-soft text-soil",
          badge: "Diagnosis check",
        };
      case "tip":
        return {
          icon: Sun,
          bg: "bg-leaf-soft text-primary",
          badge: "Seasonal tip",
        };
      default:
        return {
          icon: Sprout,
          bg: "bg-muted text-muted-foreground",
          badge: "Update",
        };
    }
  };

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

      {/* Right side: Notifications Popover, Avatar, and Mobile Menu Items Button */}
      <div className="flex items-center gap-1.5">
        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            aria-label="Notifications"
            aria-expanded={isNotifOpen}
            className={`relative inline-flex items-center justify-center rounded-lg h-9 w-9 transition-colors cursor-pointer ${
              isNotifOpen
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Bell size={18} aria-hidden="true" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute right-2 top-2 size-2 rounded-full bg-soil ring-2 ring-background animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 top-11 z-50 w-[330px] sm:w-[380px] overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-2xl backdrop-blur-md animate-in fade-in-50 zoom-in-95">
              {/* Panel Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="text-display text-sm font-semibold text-foreground">
                    Notifications
                  </span>
                  {unreadNotificationsCount > 0 && (
                    <span className="rounded-full bg-soil-soft px-2 py-0.5 text-[10px] font-semibold text-soil">
                      {unreadNotificationsCount} new
                    </span>
                  )}
                </div>

                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                  >
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-[380px] divide-y divide-border/60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Sprout size={28} className="mx-auto text-muted-foreground/60" />
                    <p className="mt-2 text-xs font-semibold text-foreground">All caught up</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      No new care notifications right now.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const { icon: NotifIcon, bg, badge } = getNotifIcon(notif.type);
                    return (
                      <div
                        key={notif.id}
                        className={`group relative flex items-start gap-3 p-3.5 transition-colors ${
                          notif.read ? "bg-card opacity-80" : "bg-primary/5"
                        }`}
                      >
                        {/* Icon */}
                        <span className={`grid size-8 shrink-0 place-items-center rounded-xl ${bg} mt-0.5`}>
                          <NotifIcon size={15} />
                        </span>

                        {/* Text */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {badge}
                            </span>
                            {!notif.read && (
                              <span className="size-1.5 rounded-full bg-soil" />
                            )}
                          </div>

                          <h4 className="mt-0.5 text-xs font-semibold text-foreground">
                            {notif.title}
                          </h4>
                          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                            {notif.description}
                          </p>

                          <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{notif.time}</span>
                            {!notif.read && (
                              <button
                                onClick={() => markNotificationAsRead(notif.id)}
                                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
                              >
                                <Check size={11} /> Mark read
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Dismiss (X) */}
                        <button
                          onClick={() => dismissNotification(notif.id)}
                          aria-label="Dismiss notification"
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity cursor-pointer p-0.5"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Panel Footer */}
              <div className="border-t border-border bg-muted/20 px-4 py-2.5 text-center text-[10px] text-muted-foreground">
                Canopy plant health & care alerts
              </div>
            </div>
          )}
        </div>

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
