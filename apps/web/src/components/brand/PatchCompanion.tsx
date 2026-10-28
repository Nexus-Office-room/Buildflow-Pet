"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent, type KeyboardEvent } from "react";
import {
  DEFAULT_PET_ID,
  getPet,
  getPetDetached,
  getPetEnabled,
  getPetPosition,
  getStoredPetId,
  notifyPetChange,
  PET_CHANGE_EVENT,
  resetPetPosition,
  savePetPosition,
  savePetDetached,
  type NexusPet,
  type PetPosition,
} from "@/lib/pets";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  startLeft: number;
  startTop: number;
  moved: boolean;
}

export default function PatchCompanion() {
  const pathname = usePathname();
  const isPetWindow = pathname === "/pet-window";
  const [open, setOpen] = useState(isPetWindow);
  const [pet, setPet] = useState<NexusPet>(() => getPet(DEFAULT_PET_ID));
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [detached, setDetached] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [moveMode, setMoveMode] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState<PetPosition | null>(null);
  const positionRef = useRef<PetPosition | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const petButtonRef = useRef<HTMLButtonElement>(null);

  const setSavedPosition = useCallback((nextPosition: PetPosition | null) => {
    positionRef.current = nextPosition;
    setPosition(nextPosition);
  }, []);

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
    const syncSettings = () => {
      try {
        setPet(getPet(getStoredPetId()));
        setEnabled(getPetEnabled());
        setDetached(getPetDetached());
        setSavedPosition(getPetPosition());
      } catch {
        setPet(getPet(DEFAULT_PET_ID));
        setEnabled(false);
        setDetached(false);
        setSavedPosition(null);
      }
      setReady(true);
    };
    syncSettings();
    window.addEventListener("storage", syncSettings);
    window.addEventListener(PET_CHANGE_EVENT, syncSettings);
    return () => {
      window.removeEventListener("storage", syncSettings);
      window.removeEventListener(PET_CHANGE_EVENT, syncSettings);
    };
  }, [setSavedPosition]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setMoveMode(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (moveMode) petButtonRef.current?.focus();
  }, [moveMode]);

  useEffect(() => {
    if (isPetWindow && ready && (!enabled || !detached)) window.close();
  }, [detached, enabled, isPetWindow, ready]);

  useEffect(() => {
    if (!isPetWindow) return;
    const returnToAppOnClose = () => {
      try { savePetDetached(false); } catch { /* Closing the window remains available. */ }
    };
    window.addEventListener("beforeunload", returnToAppOnClose);
    return () => window.removeEventListener("beforeunload", returnToAppOnClose);
  }, [isPetWindow]);

  useEffect(() => {
    if (!position) return;
    const keepOnScreen = () => {
      const bounds = rootRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const minX = bounds.width / 2;
      const minY = bounds.height / 2;
      const maxX = Math.max(minX, window.innerWidth - minX);
      const maxY = Math.max(minY, window.innerHeight - minY);
      const next = {
        x: clamp(positionRef.current?.x ?? position.x, minX / window.innerWidth, maxX / window.innerWidth),
        y: clamp(positionRef.current?.y ?? position.y, minY / window.innerHeight, maxY / window.innerHeight),
      };
      if (next.x !== positionRef.current?.x || next.y !== positionRef.current?.y) {
        setSavedPosition(next);
        try { savePetPosition(next); } catch { /* Keep the current in-memory position. */ }
      }
    };
    window.addEventListener("resize", keepOnScreen);
    return () => window.removeEventListener("resize", keepOnScreen);
  }, [position, setSavedPosition]);

  const startDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (!moveMode || !rootRef.current) return;
    event.preventDefault();
    const bounds = rootRef.current.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: bounds.left,
      startTop: bounds.top,
      moved: false,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    const root = rootRef.current;
    if (!moveMode || !drag || drag.pointerId !== event.pointerId || !root) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 3) drag.moved = true;

    const bounds = root.getBoundingClientRect();
    const left = clamp(drag.startLeft + deltaX, 0, Math.max(0, window.innerWidth - bounds.width));
    const top = clamp(drag.startTop + deltaY, 0, Math.max(0, window.innerHeight - bounds.height));
    const next = {
      x: (left + bounds.width / 2) / window.innerWidth,
      y: (top + bounds.height / 2) / window.innerHeight,
    };
    setSavedPosition(next);
  };

  const endDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
    setDragging(false);
    const current = positionRef.current;
    if (drag.moved && current) {
      try { savePetPosition(current); } catch { /* Keep the current in-memory position. */ }
    }
  };

  const moveWithKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!moveMode || !rootRef.current) return;
    const step = event.shiftKey ? 48 : 20;
    const movement: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const delta = movement[event.key];
    if (!delta) return;
    event.preventDefault();
    const bounds = rootRef.current.getBoundingClientRect();
    const current = positionRef.current;
    const currentLeft = current ? current.x * window.innerWidth - bounds.width / 2 : bounds.left;
    const currentTop = current ? current.y * window.innerHeight - bounds.height / 2 : bounds.top;
    const left = clamp(currentLeft + delta[0], 0, Math.max(0, window.innerWidth - bounds.width));
    const top = clamp(currentTop + delta[1], 0, Math.max(0, window.innerHeight - bounds.height));
    const next = { x: (left + bounds.width / 2) / window.innerWidth, y: (top + bounds.height / 2) / window.innerHeight };
    setSavedPosition(next);
    try { savePetPosition(next); } catch { /* Keep the current in-memory position. */ }
  };

  const handlePositionReset = () => {
    try { resetPetPosition(); } catch { /* Fall back to the default corner in memory. */ }
    setSavedPosition(null);
    setMoveMode(false);
    notifyPetChange();
  };

  const handlePopout = () => {
    if (isPetWindow) {
      try { savePetDetached(false); } catch { /* The app window remains available. */ }
      notifyPetChange();
      window.close();
      return;
    }

    try {
      savePetDetached(true);
      notifyPetChange();
      const popup = window.open(
        `${window.location.origin}/pet-window`,
        "buildflow-companion",
        "popup,width=320,height=360,resizable=yes"
      );
      if (!popup) {
        savePetDetached(false);
        notifyPetChange();
        setNotice("Your browser blocked the pet window. Allow pop-ups for Buildflow and try again.");
        return;
      }
      setNotice("");
      popup.focus();
    } catch {
      try { savePetDetached(false); } catch { /* Preserve the notice even if storage is blocked. */ }
      notifyPetChange();
      setNotice("Could not open a separate pet window in this browser.");
    }
  };

  if (!ready || !enabled || (detached && !isPetWindow)) return null;

  const companionStyle: CSSProperties = position && !isPetWindow
    ? {
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
        right: "auto",
        bottom: "auto",
        transform: "translate(-50%, -50%)",
      }
    : {};

  return (
    <aside
      ref={rootRef}
      className={`patch-companion${open ? " patch-companion--open" : ""}${moveMode ? " patch-companion--moving" : ""}${dragging ? " patch-companion--dragging" : ""}`}
      aria-label={`${pet.name}, your Buildflow companion`}
      style={companionStyle}
    >
      {open && (
        <div className="patch-companion__bubble" id="patch-companion-message">
          <button
            className="patch-companion__close"
            type="button"
            onClick={() => { setOpen(false); setMoveMode(false); }}
            aria-label={`Close ${pet.name} message`}
          >
            ×
          </button>
          <span className="patch-companion__eyebrow">{contextLabel}</span>
          <p aria-live="polite">{moveMode ? "Drag me anywhere in this window, or use the arrow keys." : greetings[greetingIndex % greetings.length]}</p>
          {moveMode ? (
            <div className="patch-companion__move-actions">
              <button className="patch-companion__reply" type="button" onClick={handlePositionReset}>
                Reset position
              </button>
              <button className="patch-companion__reply" type="button" onClick={() => setMoveMode(false)}>
                Done moving
              </button>
            </div>
          ) : (
            <>
              <button
                className="patch-companion__reply"
                type="button"
                onClick={() => setGreetingIndex((index) => index + 1)}
              >
                Say something else <span aria-hidden="true">↗</span>
              </button>
              {!isPetWindow && (
                <button className="patch-companion__reply" type="button" onClick={() => setMoveMode(true)}>
                  Move in this window <span aria-hidden="true">↔</span>
                </button>
              )}
              <button className="patch-companion__reply" type="button" onClick={handlePopout}>
                {isPetWindow ? "Bring me back to Buildflow" : "Open in its own window"}
                <span aria-hidden="true">{isPetWindow ? "↙" : "↗"}</span>
              </button>
              {notice && <p className="patch-companion__notice" role="status">{notice}</p>}
              <Link className="patch-companion__choose" href="/companions" onClick={() => setOpen(false)}>
                Choose a companion <span aria-hidden="true">→</span>
              </Link>
            </>
          )}
        </div>
      )}
      <button
        ref={petButtonRef}
        className="patch-companion__button"
        type="button"
        onClick={() => { if (!moveMode) setOpen((value) => !value); }}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={moveWithKeyboard}
        aria-label={moveMode ? `Move ${pet.name}. Use arrow keys to reposition, or drag.` : open ? `Close ${pet.name} message` : `Meet ${pet.name}, your Buildflow sidekick`}
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
