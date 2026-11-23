import Link from "next/link";
import { Logo } from "./Logo";
import { navLinks } from "./navLinks";
import { START_HREF } from "@/lib/links";

export function Footer() {
  const year = 2026;

  return (
    <footer className="pb-8 md:pb-10">
      <div className="shell">
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-5 border-t border-rule pt-8 md:pt-10">
          <Logo size={30} />
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-5 gap-y-3">
              {[...navLinks, { href: START_HREF, label: "Start building" }].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted transition-colors hover:text-signal"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-5 text-sm text-muted">
          <span>© {year} WeCodee</span>
          <Link href="#top" className="transition-colors hover:text-signal">
            Back to top <span aria-hidden>↑</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
