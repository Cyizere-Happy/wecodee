"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { MascotClip } from "@/lib/media";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Props = {
  clip: MascotClip;
  className?: string;
  /** Above-the-fold clip: fetch eagerly instead of waiting to approach the viewport. */
  priority?: boolean;
  /** Share of the clip that must be visible before it plays. */
  threshold?: number;
  /** Called once, the first time playback actually starts (or immediately for reduced motion). */
  onStart?: () => void;
};

/**
 * A mascot animation treated as a living illustration rather than a player:
 * no controls, cropped to its action, dissolved into the white page, replayed
 * from the start each time it scrolls into view, resting on its final frame.
 */
export function MascotVideo({
  clip,
  className = "",
  priority = false,
  threshold = 0.5,
  onStart,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const onStartRef = useRef(onStart);
  const reduced = useReducedMotion();
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    onStartRef.current = onStart;
  }, [onStart]);

  const staticFrame = reduced || fallback;

  useEffect(() => {
    if (staticFrame) {
      onStartRef.current?.();
      return;
    }
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!frame || !video) return;

    let firstPlay = true;

    // Warm the file shortly before it is needed, never all at once.
    const warm = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (video.preload !== "auto") {
          video.preload = "auto";
          video.load();
        }
        warm.disconnect();
      },
      { rootMargin: "400px 0px" },
    );

    // Every entrance replays the scene from the top; leaving pauses it so
    // off-screen clips never decode in the background.
    const play = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }
        video.currentTime = 0;
        video
          .play()
          .then(() => {
            if (firstPlay) onStartRef.current?.();
            firstPlay = false;
          })
          .catch((err: DOMException) => {
            if (err.name !== "AbortError") setFallback(true);
          });
      },
      { threshold },
    );

    warm.observe(frame);
    play.observe(frame);
    return () => {
      warm.disconnect();
      play.disconnect();
    };
  }, [staticFrame, threshold]);

  const { x, y, w, h } = clip.crop;
  const frameStyle: CSSProperties = { aspectRatio: `${(w * 16) / (h * 9)}` };
  const mediaStyle: CSSProperties = {
    width: `${100 / w}%`,
    height: `${100 / h}%`,
    left: `${(-x / w) * 100}%`,
    top: `${(-y / h) * 100}%`,
  };

  return (
    <div
      ref={frameRef}
      role="img"
      aria-label={clip.label}
      className={`mascot relative w-full overflow-hidden ${className}`}
      style={frameStyle}
    >
      {staticFrame ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={clip.posterEnd}
          alt=""
          aria-hidden
          decoding="async"
          className="absolute max-w-none object-cover"
          style={mediaStyle}
        />
      ) : (
        <video
          ref={videoRef}
          className="absolute max-w-none object-cover"
          style={mediaStyle}
          poster={clip.posterStart}
          muted
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          preload={priority ? "auto" : "none"}
          aria-hidden
          tabIndex={-1}
        >
          <source src={clip.src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
