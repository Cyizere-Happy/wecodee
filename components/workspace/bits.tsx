"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { clips, type ClipName } from "@/lib/workspace/mascot";
import { toCsv } from "@/lib/workspace/rules";
import { Icon } from "./Icon";
import { useToast } from "./forms";

export const PALETTE_EVENT = "wecodee:palette";

export function SearchLauncher({ placeholder = "Search Hot Topics, articles and pages" }: { placeholder?: string }) {
  return (
    <button type="button" className="ws-hero-search" onClick={() => window.dispatchEvent(new Event(PALETTE_EVENT))}>
      <Icon name="search" size={15.5} /><span>{placeholder}</span><span className="ws-kbd">Ctrl K</span>
    </button>
  );
}

export function CopyButton({ text, label = "Copy", onCopied, variant = "secondary" }: { text: string; label?: string; onCopied?: () => void; variant?: "primary" | "secondary" }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  return (
    <button
      type="button"
      className={`ws-btn ws-btn-${variant} ws-btn-sm`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          onCopied?.();
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          toast({ tone: "error", message: "Couldn’t copy. Select the text and copy it manually." });
        }
      }}
    >
      <Icon name={copied ? "check" : "copy"} size={12.5} />{copied ? "Copied" : label}
    </button>
  );
}

const motionQuery = "(prefers-reduced-motion: reduce)";
function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => { const q = window.matchMedia(motionQuery); q.addEventListener("change", cb); return () => q.removeEventListener("change", cb); },
    () => window.matchMedia(motionQuery).matches,
    () => true,
  );
}

/**
 * A mascot animation played once, muted, when it scrolls into view. Low-data
 * mode (FR-86) and reduced motion show the poster frame instead.
 */
export function MascotClip({ clip, lowData = false, className = "", style }: { clip: ClipName; lowData?: boolean; className?: string; style?: React.CSSProperties }) {
  const data = clips[clip];
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const still = lowData || reduced || failed;

  useEffect(() => {
    const video = ref.current;
    if (still || !video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      video.muted = true;
      video.play().catch(() => setFailed(true));
    }, { threshold: 0.4 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [still]);

  return (
    <span className={"ws-mascot " + className} data-scene="" role="img" aria-label={data.label} style={style}>
      {still ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.poster} alt="" />
      ) : (
        <video ref={ref} src={data.src} poster={data.poster} muted playsInline preload="metadata" disablePictureInPicture disableRemotePlayback aria-hidden tabIndex={-1} onError={() => setFailed(true)} />
      )}
    </span>
  );
}

function download(name: string, type: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** FR-22: add-to-calendar file, generated in the browser from the event details. */
export function CalendarButton({ event }: { event: { id: string; title: string; description: string; startsAt: string; durationMin: number; meetingUrl: string } }) {
  return (
    <button
      type="button"
      className="ws-btn ws-btn-ghost ws-btn-sm"
      onClick={() => {
        const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
        const start = new Date(event.startsAt);
        const end = new Date(start.getTime() + event.durationMin * 60_000);
        const escape = (s: string) => s.replace(/[\\,;]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
        const ics = [
          "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//WeCodee//Events//EN", "BEGIN:VEVENT",
          `UID:${event.id}@wecodee`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
          `SUMMARY:${escape(event.title)}`, `DESCRIPTION:${escape(event.description + "\n\nJoin: " + event.meetingUrl)}`, `URL:${event.meetingUrl}`,
          "BEGIN:VALARM", "TRIGGER:-PT1H", "ACTION:DISPLAY", "DESCRIPTION:Starts in 1 hour", "END:VALARM",
          "END:VEVENT", "END:VCALENDAR",
        ].join("\r\n");
        download(event.title.replace(/[^\w]+/g, "-").toLowerCase() + ".ics", "text/calendar", ics);
      }}
    >
      <Icon name="calendar" size={12.5} />Add to calendar
    </button>
  );
}

/** FR-59: CSV export. */
export function CsvButton({ name, rows, children = "Export CSV" }: { name: string; rows: (string | number)[][]; children?: ReactNode }) {
  return (
    <button type="button" className="ws-btn ws-btn-secondary ws-btn-sm" onClick={() => download(name, "text/csv;charset=utf-8", "﻿" + toCsv(rows))}>
      <Icon name="download" size={12.5} />{children}
    </button>
  );
}

export function JsonDownload({ name, data, children }: { name: string; data: unknown; children: ReactNode }) {
  return (
    <button type="button" className="ws-btn ws-btn-secondary ws-btn-sm" onClick={() => download(name, "application/json", JSON.stringify(data, null, 2))}>
      <Icon name="download" size={12.5} />{children}
    </button>
  );
}

/** Client-side filter for server-rendered lists: hides rows whose text doesn't match. */
export function FilterInput({ target, placeholder = "Filter…" }: { target: string; placeholder?: string }) {
  return (
    <label className="ws-search">
      <Icon name="search" size={13.5} />
      <input
        className="ws-input"
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => {
          const q = e.target.value.trim().toLowerCase();
          document.querySelectorAll<HTMLElement>(`[data-filter="${target}"] [data-row]`).forEach((row) => {
            row.hidden = Boolean(q) && !(row.dataset.row ?? row.textContent ?? "").toLowerCase().includes(q);
          });
        }}
      />
    </label>
  );
}
