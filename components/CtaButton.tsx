import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
};

function Arrow() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="size-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M2 8h11M9 4l4 4-4 4" />
    </svg>
  );
}

export function CtaButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: Props) {
  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className={`inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:text-signal hover:decoration-signal ${className}`}
      >
        {children}
        <Arrow />
      </Link>
    );
  }

  const pad = {
    sm: "min-h-10 gap-2 px-4 text-sm",
    md: "min-h-11 gap-2.5 px-4 text-base",
    lg: "h-14 gap-3 pl-7 pr-6 text-base",
  }[size];

  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-lg bg-ink font-semibold text-white transition-colors hover:bg-signal ${pad} ${className}`}
    >
      <span>{children}</span>
      <Arrow />
    </Link>
  );
}
