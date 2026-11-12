export type PlantStatus = "healthy" | "needs_attention" | "critical";

export interface Plant {
  id: string;
  name: string;
  location: string;
  image_url: string;
  status: PlantStatus;
  statusLabel?: string;
  last_checked: string;
  waterSchedule?: string;
  lightNeeds?: string;
  created_at?: string;
}

export interface Diagnosis {
  id: string;
  plant_id: string;
  plant_name: string;
  image_url: string;
  issue: string;
  severity: PlantStatus;
  severityLabel?: string;
  notes: string;
  action_steps?: string[];
  created_at: string;
}

export interface DiagnosisResult {
  plantName: string;
  issue: string;
  severity: PlantStatus;
  severityLabel: string;
  summary: string;
  notes: string;
  actionSteps: string[];
  wateringSchedule: string;
  lightRecommendation: string;
  isDemo?: boolean;
}

export interface CareReminder {
  id: string;
  plant_id: string;
  plant_name: string;
  type: "water" | "fertilize" | "repot" | "prune";
  due_date: string;
  location: string;
}

export type NotificationType = "reminder" | "followup" | "tip";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  time: string;
  read: boolean;
  plantName?: string;
}

export interface ScannedPlant {
  id: string;
  name: string;
  scientificName?: string;
  locationTag: string; // e.g. "Botanical Garden", "Trail hike", "Friend's patio"
  image_url: string;
  scanned_at: string;
  condition: string; // e.g. "Healthy wild foliage", "Minor sun scorch", "Thriving"
  notes?: string;
}
