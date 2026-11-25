"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { recordActivity } from "@/lib/workspace/actions";
import { Icon } from "./Icon";

/**
 * Registers the service worker (FR-83, FR-84). Production only, so development
 * builds never serve stale pages from the cache.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, []);
  return null;
}

/**
 * FR-81: one tiny signal a minute while the page is visible and the learner
 * interacted in the last 5 minutes. Idle and background time are not counted.
 */
export function ActivitySignal() {
  useEffect(() => {
    let last = Date.now();
    const touch = () => { last = Date.now(); };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible" || !navigator.onLine) return;
      if (Date.now() - last > 5 * 60_000) return;
      recordActivity().catch(() => {});
    }, 60_000);
    return () => { window.clearInterval(timer); events.forEach((e) => window.removeEventListener(e, touch)); };
  }, []);
  return null;
}

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
let deferred: InstallEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e as InstallEvent; listeners.forEach((l) => l()); });
  window.addEventListener("appinstalled", () => { deferred = null; listeners.forEach((l) => l()); });
}
const subscribe = (cb: () => void) => { listeners.add(cb); return () => listeners.delete(cb); };

function useInstall() {
  const canPrompt = useSyncExternalStore(subscribe, () => deferred !== null, () => false);
  const ios = useSyncExternalStore(() => () => {}, () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !(navigator as Navigator & { standalone?: boolean }).standalone, () => false);
  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => null);
    deferred = null;
    listeners.forEach((l) => l());
  }, []);
  return { canPrompt, ios, install };
}

/** "Install WeCodee" on Android/desktop Chrome; Add to Home Screen steps on iPhone (FR-83). */
export function InstallItem({ onDone }: { onDone: () => void }) {
  const { canPrompt, ios, install } = useInstall();
  const [showSteps, setShowSteps] = useState(false);
  if (canPrompt) {
    return <button role="menuitem" type="button" onClick={async () => { await install(); onDone(); }}><Icon name="download" size={13.5} />Install WeCodee</button>;
  }
  if (!ios) return null;
  return (
    <>
      <button role="menuitem" type="button" aria-expanded={showSteps} onClick={() => setShowSteps((v) => !v)}><Icon name="download" size={13.5} />Add to Home Screen</button>
      {showSteps && <p className="ws-small ws-muted" style={{ padding: "3.5px 9px 7px" }}>In Safari, tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.</p>}
    </>
  );
}
