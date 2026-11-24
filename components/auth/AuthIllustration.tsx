"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AuthText } from "./AuthText";

const stillQuery = "(prefers-reduced-motion: reduce), (max-width: 767px)";
function subscribe(listener: () => void) {
  const query = window.matchMedia(stillQuery);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

type Props = {
  video?: string;
  poster?: string;
  still: string;
  description: string;
  position?: string;
  crop?: string;
  title?: string;
  caption?: string;
  compact?: boolean;
  accentPeriod?: boolean;
};

export function AuthIllustration({
  video, poster, still, description, position, crop, title, caption, compact = false, accentPeriod,
}: Props) {
  const media = useRef<HTMLVideoElement>(null);
  const [failed, fail] = useState(false);
  const [imageFailed, failImage] = useState(false);
  const preferStill = useSyncExternalStore(subscribe, () => window.matchMedia(stillQuery).matches, () => false);
  const shouldPlay = video && !preferStill && !failed;

  useEffect(() => {
    const element = media.current;
    if (!shouldPlay || !element) return;

    let ready = false;
    let disposed = false;
    const play = () => {
      if (!ready || document.hidden || element.ended) return;
      element.muted = true;
      void element.play().catch((error: DOMException) => {
        if (!disposed && error.name !== "AbortError") fail(true);
      });
    };
    const timer = window.setTimeout(() => {
      ready = true;
      play();
    }, 400);
    const onVisibility = () => {
      if (document.hidden) element.pause();
      else play();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      element.pause();
    };
  }, [shouldPlay]);

  return (
    <figure className={"auth-scene" + (compact ? " auth-scene-compact" : "")}>
      <div
        className={"auth-art" + (video ? " auth-art-video" : "")}
        role="img"
        aria-label={description}
        style={{ clipPath: crop }}
      >
        {shouldPlay ? (
          <video
            ref={media}
            src={video}
            poster={poster}
            preload="metadata"
            muted
            playsInline
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden
            onError={() => fail(true)}
            style={{ objectPosition: position }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageFailed ? "/brand/sheep-mark.png" : still}
            alt=""
            decoding="async"
            onError={() => failImage(true)}
            style={{ objectPosition: position }}
          />
        )}
      </div>
      {title && (
        <figcaption>
          <p><AuthText accentPeriod={accentPeriod}>{title}</AuthText></p>
          {caption && <span><AuthText accentPeriod={accentPeriod}>{caption}</AuthText></span>}
        </figcaption>
      )}
    </figure>
  );
}
