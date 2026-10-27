export interface NexusPet {
  id: string;
  name: string;
  species: string;
  emoji: string;
  color: string;
  accent: string;
  greeting: string;
  description: string;
}

export const NEXUS_PETS: NexusPet[] = [
  {
    id: "patch",
    name: "Patch",
    species: "Pixel fox",
    emoji: "🦊",
    color: "#102a24",
    accent: "#27e2a5",
    greeting: "Hey, I’m Patch. Ready when you are.",
    description: "Your cheerful coding companion. Curious, quick, and always on your side.",
  },
  {
    id: "miso",
    name: "Miso",
    species: "Cloud cat",
    emoji: "🐱",
    color: "#292345",
    accent: "#b39aff",
    greeting: "Mrrp. Let’s make something lovely.",
    description: "A calm little cat who keeps the workspace cozy while you focus.",
  },
  {
    id: "byte",
    name: "Byte",
    species: "Robot pup",
    emoji: "🐶",
    color: "#142538",
    accent: "#69c7ff",
    greeting: "Systems ready. I brought good-dog energy.",
    description: "A loyal helper who loves clean builds and fetching ideas.",
  },
  {
    id: "sprout",
    name: "Sprout",
    species: "Moss turtle",
    emoji: "🐢",
    color: "#1e3022",
    accent: "#a9db73",
    greeting: "No rush. Small steps grow into big things.",
    description: "A patient gardener who reminds you that good work takes root over time.",
  },
  {
    id: "orbit",
    name: "Orbit",
    species: "Star bunny",
    emoji: "🐰",
    color: "#382326",
    accent: "#ffadbd",
    greeting: "Ready for takeoff? Your next idea is waiting.",
    description: "A bright-eyed dreamer for big ideas, bold sketches, and launch days.",
  },
];

export const DEFAULT_PET_ID = "patch";
export const PET_STORAGE_KEY = "buildflow-companion";
export const PET_CHANGE_EVENT = "buildflow-companion-change";

function previousPetStorageKey() {
  return ["nexus", "office", "companion"].join("-");
}

export function getStoredPetId(): string | null {
  try {
    const current = localStorage.getItem(PET_STORAGE_KEY);
    if (current) return current;

    const previous = localStorage.getItem(previousPetStorageKey());
    if (previous) {
      localStorage.setItem(PET_STORAGE_KEY, previous);
      localStorage.removeItem(previousPetStorageKey());
    }
    return previous;
  } catch {
    return null;
  }
}

export function saveStoredPetId(id: string) {
  localStorage.setItem(PET_STORAGE_KEY, id);
  localStorage.removeItem(previousPetStorageKey());
}

export function getPet(id: string | null | undefined): NexusPet {
  return NEXUS_PETS.find((pet) => pet.id === id) ?? NEXUS_PETS[0];
}
