"use client";

import { useState } from "react";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  Droplets,
  FlaskConical,
  Sun,
  Sprout,
  ArrowRight,
  Clock,
  Sparkles,
  Camera,
} from "lucide-react";
import { usePlants } from "@/context/PlantContext";
import { NotificationType } from "@/types";

interface NotificationsViewProps {
  onViewPlant?: () => void;
  onViewHistory?: () => void;
  onCheckPlant?: () => void;
}

export default function NotificationsView({
  onViewPlant,
  onViewHistory,
  onCheckPlant,
}: NotificationsViewProps) {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    dismissNotification,
  } = usePlants();

  const [filter, setFilter] = useState<"all" | "unread" | "reminder" | "followup" | "tip">("all");

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read;
    if (filter === "reminder") return notif.type === "reminder";
    if (filter === "followup") return notif.type === "followup";
    if (filter === "tip") return notif.type === "tip";
    return true;
  });

  const getNotifDetails = (type: NotificationType) => {
    switch (type) {
      case "reminder":
        return {
          icon: Droplets,
          badgeBg: "bg-accent text-accent-foreground",
          iconBg: "bg-accent/80 text-accent-foreground",
          badgeLabel: "Care reminder",
        };
      case "followup":
        return {
          icon: FlaskConical,
          badgeBg: "bg-soil-soft text-soil",
          iconBg: "bg-soil-soft text-soil",
          badgeLabel: "Diagnosis follow-up",
        };
      case "tip":
        return {
          icon: Sun,
          badgeBg: "bg-leaf-soft text-primary",
          iconBg: "bg-leaf-soft text-primary",
          badgeLabel: "Seasonal tip",
        };
      default:
        return {
          icon: Sprout,
          badgeBg: "bg-muted text-muted-foreground",
          iconBg: "bg-muted text-muted-foreground",
          badgeLabel: "Update",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-secondary-foreground">
              <BellRing size={11} className="text-primary" /> INBOX & CARE ALERTS
            </span>
            {unreadNotificationsCount > 0 ? (
              <span className="rounded-full bg-soil-soft px-2 py-0.5 text-[10px] font-semibold text-soil">
                {unreadNotificationsCount} unread
              </span>
            ) : (
              <span className="rounded-full bg-leaf-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
                All caught up
              </span>
            )}
          </div>
          <h1 className="mt-1.5 text-display text-[26px] sm:text-[32px] font-semibold text-foreground tracking-tight">
            Notifications
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Timely watering schedules, AI diagnosis alerts, and seasonal care guidance for your indoor garden.
          </p>
        </div>

        {/* Action Button: Mark all as read */}
        {unreadNotificationsCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <CheckCheck size={14} className="text-primary" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border pb-3">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            filter === "all"
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            filter === "unread"
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          Unread ({unreadNotificationsCount})
        </button>
        <button
          onClick={() => setFilter("reminder")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            filter === "reminder"
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          Care reminders
        </button>
        <button
          onClick={() => setFilter("followup")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            filter === "followup"
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          Follow-ups
        </button>
        <button
          onClick={() => setFilter("tip")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            filter === "tip"
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          Seasonal tips
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const details = getNotifDetails(notif.type);
            const Icon = details.icon;

            return (
              <div
                key={notif.id}
                className={`group relative flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-xl border p-4 sm:p-5 transition-all shadow-[0_2px_12px_color-mix(in_oklab,var(--foreground)_4%,transparent)] ${
                  !notif.read
                    ? "border-primary/40 bg-card border-l-4 border-l-primary"
                    : "border-border/80 bg-card/60 opacity-90 hover:opacity-100"
                }`}
              >
                {/* Left: Icon & Content */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl ${details.iconBg} shadow-xs`}
                  >
                    <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${details.badgeBg}`}
                      >
                        {details.badgeLabel}
                      </span>

                      {notif.plantName && (
                        <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                          <Sprout size={10} />
                          {notif.plantName}
                        </span>
                      )}

                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock size={11} />
                        {notif.time}
                      </span>

                      {!notif.read && (
                        <span className="size-2 rounded-full bg-soil ring-2 ring-background animate-pulse" />
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="mt-1.5 text-display text-[15px] font-semibold text-foreground">
                      {notif.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {notif.description}
                    </p>

                    {/* Contextual Action Button */}
                    <div className="mt-3 flex items-center gap-3">
                      {notif.type === "reminder" && onViewPlant && (
                        <button
                          onClick={onViewPlant}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                        >
                          <span>Open My plants</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                      {notif.type === "followup" && onViewHistory && (
                        <button
                          onClick={onViewHistory}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                        >
                          <span>Check Diagnosis history</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                      {notif.type === "tip" && onCheckPlant && (
                        <button
                          onClick={onCheckPlant}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                        >
                          <Camera size={13} />
                          <span>Run leaf check</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                  {!notif.read ? (
                    <button
                      onClick={() => markNotificationAsRead(notif.id)}
                      title="Mark as read"
                      aria-label="Mark as read"
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Check size={13} />
                      <span className="hidden sm:inline">Mark read</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/60 px-2">
                      Read
                    </span>
                  )}

                  <button
                    onClick={() => dismissNotification(notif.id)}
                    title="Dismiss notification"
                    aria-label="Dismiss notification"
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
          <div className="mb-3.5 grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
            <Bell size={22} />
          </div>
          <h3 className="text-display text-base font-semibold text-foreground">
            No notifications in this view
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {filter === "unread"
              ? "You've read all your alerts! You're completely up to date."
              : "Whenever your plants need water or attention, updates will appear here."}
          </p>
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              className="mt-4 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              View all notifications ({notifications.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
