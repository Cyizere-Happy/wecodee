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
  /** Play once from beginning to end, even if the frame scrolls out of view. */
  playThrough?: boolean;
  /** Called once, the first time playback actually starts (or immediately for reduced motion). */
  onStart?: () => void;
};

/**
 * A mascot animation treated as a living illustration rather than a player:
 * no controls, cropped to its action, and dissolved into the white page.
 */
export function MascotVideo({
  clip,
  className = "",
  priority = false,
  threshold = 0.5,
  playThrough = false,
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
    let disposed = false;

    // Warm the file shortly before it is needed, never all at once.
    const warm = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (video.preload !== "auto") {
          video.preload = "auto";
          if (!playThrough) video.load();
        }
        warm.disconnect();
      },
      { rootMargin: "400px 0px" },
    );

    const play = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          if (!playThrough) video.pause();
          return;
        }

        if (playThrough) {
          if (entry.intersectionRatio < threshold) return;
          play.disconnect();
          warm.disconnect();
        } else {
          video.currentTime = 0;
        }

        video.muted = true;
        video
          .play()
          .then(() => {
            if (!disposed && firstPlay) onStartRef.current?.();
            firstPlay = false;
          })
          .catch((err: DOMException) => {
            if (!disposed && (playThrough || err.name !== "AbortError")) {
              setFallback(true);
            }
          });
      },
      { threshold },
    );

    warm.observe(frame);
    play.observe(frame);
    return () => {
      disposed = true;
      warm.disconnect();
      play.disconnect();
    };
  }, [staticFrame, threshold, playThrough]);

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
          src={clip.src}
          className="absolute max-w-none object-cover"
          style={mediaStyle}
          poster={clip.posterStart}
          muted
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          preload={priority ? "auto" : "none"}
          onError={() => setFallback(true)}
          aria-hidden
          tabIndex={-1}
        />
      )}
    </div>
  );
}
