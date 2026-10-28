"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import {
  DEFAULT_PET_ID,
  getPet,
  getStoredPetId,
  PET_CHANGE_EVENT,
  type NexusPet,
} from "@/lib/pets";

export default function PatchCompanion() {
  const [open, setOpen] = useState(false);
  const [pet, setPet] = useState<NexusPet>(() => getPet(DEFAULT_PET_ID));
  const [greetingIndex, setGreetingIndex] = useState(0);
  const pathname = usePathname();

  const greetings = [
    pet.greeting,
    `I’m right here, ${pet.name === "Patch" ? "builder" : "friend"}. What are we making next?`,
    "Small steps, good ideas, one build at a time.",
  ];

  const contextLabel = pathname?.startsWith("/projects/")
    ? "IN YOUR WORKSPACE"
    : pathname?.startsWith("/companions")
      ? "MEET THE CREW"
      : pathname?.startsWith("/projects")
        ? "READY TO BUILD"
        : "YOUR BUILDFLOW SIDEKICK";

  useEffect(() => {
    const syncPet = () => {
      try {
        setPet(getPet(getStoredPetId()));
      } catch {
        setPet(getPet(DEFAULT_PET_ID));
      }
    };
    syncPet();
    window.addEventListener("storage", syncPet);
    window.addEventListener(PET_CHANGE_EVENT, syncPet);
    return () => {
      window.removeEventListener("storage", syncPet);
      window.removeEventListener(PET_CHANGE_EVENT, syncPet);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <aside
      className={`patch-companion${open ? " patch-companion--open" : ""}`}
      aria-label={`${pet.name}, your Buildflow companion`}
    >
      {open && (
        <div className="patch-companion__bubble" id="patch-companion-message">
          <button
            className="patch-companion__close"
            type="button"
            onClick={() => setOpen(false)}
            aria-label={`Close ${pet.name} message`}
          >
            ×
          </button>
          <span className="patch-companion__eyebrow">{contextLabel}</span>
          <p aria-live="polite">{greetings[greetingIndex % greetings.length]}</p>
          <button
            className="patch-companion__reply"
            type="button"
            onClick={() => setGreetingIndex((index) => index + 1)}
          >
            Say something else <span aria-hidden="true">↗</span>
          </button>
          <Link className="patch-companion__choose" href="/companions" onClick={() => setOpen(false)}>
            Choose a companion <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
      <button
        className="patch-companion__button"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? `Close ${pet.name} message` : `Meet ${pet.name}, your Buildflow sidekick`}
        aria-expanded={open}
        aria-controls={open ? "patch-companion-message" : undefined}
      >
        {pet.id === "patch" ? (
          <span className="patch-companion__sprite" aria-hidden="true" />
        ) : (
          <span
            className="patch-companion__emoji"
            aria-hidden="true"
            style={{ "--pet-color": pet.color, "--pet-accent": pet.accent } as CSSProperties & Record<`--${string}`, string>}
          >
            {pet.emoji}
          </span>
        )}
        <span className="patch-companion__status" aria-hidden="true" />
      </button>
    </aside>
  );
}
