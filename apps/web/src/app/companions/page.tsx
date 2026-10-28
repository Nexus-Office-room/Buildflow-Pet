"use client";

import { useCallback, useSyncExternalStore, useState } from "react";
import Link from "next/link";
import BuildflowLogo from "@/components/brand/BuildflowLogo";
import {
  DEFAULT_PET_ID,
  getStoredPetId,
  NEXUS_PETS,
  PET_CHANGE_EVENT,
  saveStoredPetId,
} from "@/lib/pets";

export default function CompanionsPage() {
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    window.addEventListener(PET_CHANGE_EVENT, onStoreChange);
    return () => {
      window.removeEventListener("storage", onStoreChange);
      window.removeEventListener(PET_CHANGE_EVENT, onStoreChange);
    };
  }, []);
  const getSnapshot = useCallback(() => {
    try {
      return getStoredPetId() ?? DEFAULT_PET_ID;
    } catch {
      return DEFAULT_PET_ID;
    }
  }, []);
  const selected = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_PET_ID);
  const [saved, setSaved] = useState(false);

  function choose(id: string) {
    setSaved(false);
    try {
      saveStoredPetId(id);
      window.dispatchEvent(new Event(PET_CHANGE_EVENT));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-10 text-neutral-100 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center gap-4">
          <BuildflowLogo surface="nav" />
          <div className="ml-auto flex items-center gap-4">
            {saved && <span role="status" className="text-xs text-emerald-300">Companion saved</span>}
            <Link href="/projects" className="font-mono text-xs text-neutral-400 hover:text-white">← Projects</Link>
          </div>
        </header>

        <div className="mb-8 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[.2em] text-emerald-300">Buildflow companions</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Pick your office sidekick</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Choose who keeps you company. Your companion follows you across Buildflow on this browser.
          </p>
        </div>

        <section aria-label="Choose a companion" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NEXUS_PETS.map((pet) => {
            const active = selected === pet.id;
            return (
              <button
                key={pet.id}
                type="button"
                aria-pressed={active}
                onClick={() => choose(pet.id)}
                className={`group rounded-2xl border p-5 text-left transition duration-200 hover:-translate-y-1 ${
                  active ? "border-emerald-300/70 bg-emerald-300/[.08] shadow-[0_12px_50px_rgba(39,226,165,.08)]" : "border-white/10 bg-neutral-950/70 hover:border-white/25"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className="grid h-24 w-24 place-items-center rounded-2xl text-6xl shadow-inner transition group-hover:scale-105"
                    style={{ backgroundColor: pet.color, boxShadow: `inset 0 0 0 1px ${pet.accent}33` }}
                    aria-hidden="true"
                  >
                    {pet.id === "patch" ? <span className="companion-card__patch" /> : pet.emoji}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] ${active ? "bg-emerald-300/15 text-emerald-200" : "bg-white/5 text-neutral-500"}`}>
                    {active ? "ACTIVE COMPANION" : pet.species.toUpperCase()}
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-semibold">{pet.name}</h2>
                <p className="mt-1 text-xs" style={{ color: pet.accent }}>{pet.species}</p>
                <p className="mt-3 min-h-10 text-sm leading-5 text-neutral-400">{pet.description}</p>
                <p className="mt-4 border-t border-white/10 pt-3 text-xs italic text-neutral-300">“{pet.greeting}”</p>
                <span className={`mt-4 inline-flex items-center gap-2 text-xs font-medium ${active ? "text-emerald-200" : "text-neutral-400 group-hover:text-white"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-300" : "bg-neutral-600 group-hover:bg-white/70"}`} aria-hidden="true" />
                  {active ? "Following you across Buildflow" : "Choose this companion"}
                </span>
              </button>
            );
          })}
        </section>

        <p className="mt-6 text-xs text-neutral-600">Selection is saved in this browser. No account data or API key is involved.</p>
      </div>
    </main>
  );
}
