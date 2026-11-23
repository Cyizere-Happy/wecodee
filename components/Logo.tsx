import Image from "next/image";
import Link from "next/link";

/** The sheep is the logo; the wordmark only names it. */
export function Logo({
  size = 28,
  className = "",
  wordmarkClassName = "text-lg",
}: {
  size?: number;
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <Link
      href="/#top"
      aria-label="WeCodee home"
      className={`group inline-flex items-center gap-2 ${className}`}
    >
      <Image
        src="/brand/sheep-mark.png"
        alt=""
        width={size}
        height={size}
        preload
        className="transition-transform duration-500 ease-out-expo group-hover:-rotate-6"
      />
      <span
        className={`font-bold tracking-[-0.025em] text-ink ${wordmarkClassName}`}
      >
        wecodee<span className="text-signal">.</span>
      </span>
    </Link>
  );
}
