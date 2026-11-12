"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Plant, Diagnosis, DiagnosisResult, NotificationItem, ScannedPlant } from "@/types";

interface PlantContextType {
  plants: Plant[];
  scannedPlants: ScannedPlant[];
  diagnoses: Diagnosis[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  addDiagnosis: (result: DiagnosisResult, imageUrl: string) => void;
  resolveDiagnosis: (diagnosisId: string) => void;
  deleteDiagnosis: (diagnosisId: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  dismissNotification: (id: string) => void;
  addPlant: (plant: Omit<Plant, "id">) => void;
  deletePlant: (id: string) => void;
  addScannedPlant: (plant: Omit<ScannedPlant, "id">) => void;
  deleteScannedPlant: (id: string) => void;
  adoptScannedPlant: (id: string, homeLocation?: string) => void;
  isCheckModalOpen: boolean;
  openCheckModal: () => void;
  closeCheckModal: () => void;
}

const initialPlants: Plant[] = [
  {
    id: "1",
    name: "Monstera",
    location: "Living room",
    image_url: "/images/plant-diagnosis-leaf.jpg",
    status: "needs_attention",
    statusLabel: "Needs a look",
    last_checked: "Checked today",
    waterSchedule: "Every 7 days",
    lightNeeds: "Indirect bright",
  },
  {
    id: "2",
    name: "Olive tree",
    location: "Balcony",
    image_url: "/images/plant-diagnosis-leaf.jpg",
    status: "healthy",
    statusLabel: "Looking good",
    last_checked: "3 days ago",
    waterSchedule: "Every 10 days",
    lightNeeds: "Full sun",
  },
  {
    id: "3",
    name: "Fiddle leaf fig",
    location: "Bedroom",
    image_url: "/images/plant-diagnosis-leaf.jpg",
    status: "healthy",
    statusLabel: "Looking good",
    last_checked: "1 week ago",
    waterSchedule: "Every 7 days",
    lightNeeds: "Bright filtered",
  },
];

const initialDiagnoses: Diagnosis[] = [
  {
    id: "1",
    plant_id: "1",
    plant_name: "Monstera",
    image_url: "/images/plant-diagnosis-leaf.jpg",
    issue: "Leaf discoloration",
    severity: "needs_attention",
    severityLabel: "Needs a look",
    notes:
      "A sample result for leaf discoloration. Check soil moisture and light exposure before changing your care routine.",
    action_steps: [
      "Check top 2 inches of soil with your finger",
      "Avoid standing water in cachepot",
      "Wipe dust from foliage",
    ],
    created_at: "Today, 9:42 am",
  },
  {
    id: "2",
    plant_id: "2",
    plant_name: "Olive tree",
    image_url: "/images/plant-diagnosis-leaf.jpg",
    issue: "Routine check-up",
    severity: "healthy",
    severityLabel: "Looking good",
    notes:
      "Leaves are vibrant and firm. No signs of pests or disease. Keep up the current watering schedule.",
    created_at: "3 days ago",
  },
  {
    id: "3",
    plant_id: "3",
    plant_name: "Fiddle leaf fig",
    image_url: "/images/plant-diagnosis-leaf.jpg",
    issue: "Routine check-up",
    severity: "healthy",
    severityLabel: "Looking good",
    notes:
      "Healthy growth pattern. New leaf unfurling at the top. Consider rotating for even light exposure.",
    created_at: "1 week ago",
  },
];

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    type: "reminder",
    title: "Watering due today",
    description: "Monstera in Living room is due for water. Touch the top inch of soil first.",
    time: "Today, 9:00 am",
    read: false,
    plantName: "Monstera",
  },
  {
    id: "notif-2",
    type: "followup",
    title: "Diagnosis follow-up",
    description: "It's been 4 days since Monstera's leaf check. Has the margin discoloration improved?",
    time: "Yesterday",
    read: false,
    plantName: "Monstera",
  },
  {
    id: "notif-3",
    type: "tip",
    title: "Seasonal care tip",
    description: "Winter light shift: days are shorter, consider rotating bedroom plants closer to natural light.",
    time: "3 days ago",
    read: false,
  },
];

const initialScannedPlants: ScannedPlant[] = [
  {
    id: "scan-1",
    name: "Japanese Maple",
    scientificName: "Acer palmatum",
    locationTag: "City Botanical Garden",
    image_url: "/images/plant-diagnosis-leaf.jpg",
    scanned_at: "Oct 24",
    condition: "Healthy seasonal foliage",
    notes: "Deep crimson palmate leaves, thriving in partial shade near walking path.",
  },
  {
    id: "scan-2",
    name: "Silver Dollar Eucalyptus",
    scientificName: "Eucalyptus cinerea",
    locationTag: "Outdoor Flower Market",
    image_url: "/images/plant-diagnosis-leaf.jpg",
    scanned_at: "Nov 1",
    condition: "Vibrant & aromatic",
    notes: "Round silvery-blue leaves with powdery surface. Displayed in nursery courtyard.",
  },
  {
    id: "scan-3",
    name: "Bird of Paradise",
    scientificName: "Strelitzia reginae",
    locationTag: "Office Atrium",
    image_url: "/images/plant-diagnosis-leaf.jpg",
    scanned_at: "Nov 5",
    condition: "Dry leaf margins",
    notes: "Large split foliage showing signs of low humidity from AC vents.",
  },
  {
    id: "scan-4",
    name: "Wild Maidenhair Fern",
    scientificName: "Adiantum capillus-veneris",
    locationTag: "River Trail Hike",
    image_url: "/images/plant-diagnosis-leaf.jpg",
    scanned_at: "Nov 9",
    condition: "Lush wild growth",
    notes: "Growing along shaded damp limestone rock face near running stream.",
  },
];

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export function PlantProvider({ children }: { children: React.ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>(initialPlants);
  const [scannedPlants, setScannedPlants] = useState<ScannedPlant[]>(initialScannedPlants);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>(initialDiagnoses);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load persisted state from localStorage on first client render
  useEffect(() => {
    try {
      const savedNotifs = localStorage.getItem("canopy_notifications");
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      }
      const savedPlants = localStorage.getItem("canopy_plants");
      if (savedPlants) {
        setPlants(JSON.parse(savedPlants));
      }
      const savedScanned = localStorage.getItem("canopy_scanned_plants");
      if (savedScanned) {
        setScannedPlants(JSON.parse(savedScanned));
      }
      const savedDiagnoses = localStorage.getItem("canopy_diagnoses");
      if (savedDiagnoses) {
        setDiagnoses(JSON.parse(savedDiagnoses));
      }
    } catch (e) {
      console.warn("Could not load saved data from localStorage", e);
    }
    setIsHydrated(true);
  }, []);

  // Persist notifications across page refreshes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem("canopy_notifications", JSON.stringify(notifications));
      } catch (e) {
        console.warn("Could not save notifications to localStorage", e);
      }
    }
  }, [notifications, isHydrated]);

  // Persist plants across page refreshes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem("canopy_plants", JSON.stringify(plants));
      } catch (e) {
        console.warn("Could not save plants to localStorage", e);
      }
    }
  }, [plants, isHydrated]);

  // Persist scanned plants across page refreshes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem("canopy_scanned_plants", JSON.stringify(scannedPlants));
      } catch (e) {
        console.warn("Could not save scanned plants to localStorage", e);
      }
    }
  }, [scannedPlants, isHydrated]);

  // Persist diagnoses across page refreshes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem("canopy_diagnoses", JSON.stringify(diagnoses));
      } catch (e) {
        console.warn("Could not save diagnoses to localStorage", e);
      }
    }
  }, [diagnoses, isHydrated]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addDiagnosis = (result: DiagnosisResult, imageUrl: string) => {
    const newId = Date.now().toString();
    const newDiagnosis: Diagnosis = {
      id: newId,
      plant_id: newId,
      plant_name: result.plantName,
      image_url: imageUrl,
      issue: result.issue,
      severity: result.severity,
      severityLabel: result.severityLabel,
      notes: result.notes || result.summary,
      action_steps: result.actionSteps,
      created_at: "Just now",
    };

    setDiagnoses((prev) => [newDiagnosis, ...prev]);

    // Add to Scanned Plants archive (so plants photographed are preserved without polluting personal collection)
    const newScanned: ScannedPlant = {
      id: `scan-${newId}`,
      name: result.plantName,
      scientificName: "Identified species",
      locationTag: "Photo Check Scan",
      image_url: imageUrl,
      scanned_at: "Today",
      condition: result.severityLabel,
      notes: result.summary,
    };
    setScannedPlants((prev) => [newScanned, ...prev]);

    // Only update plant if it already exists in your personal home collection
    setPlants((prev) => {
      const existing = prev.find(
        (p) => p.name.toLowerCase() === result.plantName.toLowerCase()
      );
      if (existing) {
        return prev.map((p) =>
          p.id === existing.id
            ? {
                ...p,
                status: result.severity,
                statusLabel: result.severityLabel,
                last_checked: "Checked today",
              }
            : p
        );
      }
      // If not in your personal collection, do NOT automatically add it to My plants
      return prev;
    });

    // Also add a follow-up notification reminder scheduled for this diagnosis
    const newFollowupNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: "followup",
      title: `Follow-up on ${result.plantName}`,
      description: `New check recorded for ${result.issue.toLowerCase()}. Keep an eye on new growth over the coming days.`,
      time: "Just now",
      read: false,
      plantName: result.plantName,
    };
    setNotifications((prev) => [newFollowupNotif, ...prev]);
  };

  const resolveDiagnosis = (diagnosisId: string) => {
    let resolvedPlantName = "";
    setDiagnoses((prev) =>
      prev.map((d) => {
        if (d.id === diagnosisId) {
          resolvedPlantName = d.plant_name;
          return {
            ...d,
            severity: "healthy",
            severityLabel: "Looking good",
            issue: "Resolved · Leaves healthy and thriving",
            notes: "Care recommendations applied. Plant health restored to optimal state.",
          };
        }
        return d;
      })
    );

    if (resolvedPlantName) {
      setPlants((prev) =>
        prev.map((p) =>
          p.name.toLowerCase() === resolvedPlantName.toLowerCase()
            ? {
                ...p,
                status: "healthy",
                statusLabel: "Looking good",
                last_checked: "Resolved today",
              }
            : p
        )
      );
    }
  };

  const deleteDiagnosis = (diagnosisId: string) => {
    setDiagnoses((prev) => prev.filter((d) => d.id !== diagnosisId));
  };

  const addPlant = (plantData: Omit<Plant, "id">) => {
    const newPlant: Plant = {
      ...plantData,
      id: Date.now().toString(),
    };
    setPlants((prev) => [newPlant, ...prev]);

    // Automatically trigger notification for added plant
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: "reminder",
      title: `Welcome ${newPlant.name}!`,
      description: `${newPlant.name} is now tracked in your care under ${newPlant.location}.`,
      time: "Just now",
      read: false,
      plantName: newPlant.name,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const deletePlant = (id: string) => {
    const target = plants.find((p) => p.id === id);
    setPlants((prev) => prev.filter((p) => p.id !== id));

    // Automatically trigger notification for deleted plant
    if (target) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        type: "reminder",
        title: `Plant removed: ${target.name}`,
        description: `${target.name} has been removed from your personal collection.`,
        time: "Just now",
        read: false,
        plantName: target.name,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const addScannedPlant = (scannedData: Omit<ScannedPlant, "id">) => {
    const newScanned: ScannedPlant = {
      ...scannedData,
      id: `scan-${Date.now()}`,
    };
    setScannedPlants((prev) => [newScanned, ...prev]);
  };

  const deleteScannedPlant = (id: string) => {
    setScannedPlants((prev) => prev.filter((p) => p.id !== id));
  };

  const adoptScannedPlant = (id: string, homeLocation: string = "Living room") => {
    const target = scannedPlants.find((p) => p.id === id);
    if (!target) return;

    // Check if already in plants
    const alreadyExists = plants.some(
      (p) => p.name.toLowerCase() === target.name.toLowerCase()
    );

    if (!alreadyExists) {
      const newPlant: Plant = {
        id: Date.now().toString(),
        name: target.name,
        location: homeLocation,
        image_url: target.image_url,
        status: "healthy",
        statusLabel: "Looking good",
        last_checked: "Just added to care",
        waterSchedule: "Every 7 days",
        lightNeeds: "Bright indirect",
      };
      setPlants((prev) => [newPlant, ...prev]);
    }

    // Add confirmation notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: "reminder",
      title: `Added ${target.name} to My plants`,
      description: `${target.name} is now part of your personal home care collection under ${homeLocation}.`,
      time: "Just now",
      read: false,
      plantName: target.name,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  return (
    <PlantContext.Provider
      value={{
        plants,
        scannedPlants,
        diagnoses,
        notifications,
        unreadNotificationsCount,
        addDiagnosis,
        resolveDiagnosis,
        deleteDiagnosis,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        dismissNotification,
        addPlant,
        deletePlant,
        addScannedPlant,
        deleteScannedPlant,
        adoptScannedPlant,
        isCheckModalOpen,
        openCheckModal: () => setIsCheckModalOpen(true),
        closeCheckModal: () => setIsCheckModalOpen(false),
      }}
    >
      {children}
    </PlantContext.Provider>
  );
}

export function usePlants() {
  const context = useContext(PlantContext);
  if (!context) {
    throw new Error("usePlants must be used within a PlantProvider");
  }
  return context;
}
