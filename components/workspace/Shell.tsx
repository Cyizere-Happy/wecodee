"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { accountItems, contextFor, navContexts, type NavItem } from "@/lib/workspace/nav";
import { helpFor } from "@/lib/workspace/help";
import { stills } from "@/lib/workspace/mascot";
import { authRequest } from "@/lib/auth-request";
import { resetSample, setPreviewRole, setSampleJourney } from "@/lib/workspace/actions";
import type { Role } from "@/lib/workspace/types";
import { Icon } from "./Icon";
import { Dialog, ToastProvider, useToast } from "./forms";
import { PALETTE_EVENT } from "./bits";
import { ActivitySignal, InstallItem, ServiceWorker } from "./pwa";

export type ShellViewer = { name: string; email: string; role: Role; preview: boolean };
export type SearchEntry = { href: string; label: string; group: string; hint?: string };

const roleLabel: Record<Role, string> = { learner: "Learner", supervisor: "Supervisor", admin: "Admin" };

/* ---------- breadcrumb override ---------- */
const CrumbContext = createContext<(label: string | null) => void>(() => {});
/** Lets a page name the last breadcrumb (for example a Hot Topic's title). */
export function PageCrumb({ label }: { label: string }) {
  const set = useContext(CrumbContext);
  useEffect(() => { set(label); return () => set(null); }, [label, set]);
  return null;
}

/* ---------- persisted UI state ---------- */
function useStoredFlag(key: string) {
  const subscribe = useCallback((cb: () => void) => { window.addEventListener("storage", cb); return () => window.removeEventListener("storage", cb); }, []);
  const value = useSyncExternalStore(subscribe, () => { try { return localStorage.getItem(key) === "1"; } catch { return false; } }, () => false);
  const set = useCallback((next: boolean) => {
    try { localStorage.setItem(key, next ? "1" : "0"); window.dispatchEvent(new StorageEvent("storage", { key })); } catch {}
  }, [key]);
  return [value, set] as const;
}

function useOnline() {
  return useSyncExternalStore(
    (cb) => { window.addEventListener("online", cb); window.addEventListener("offline", cb); return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); }; },
    () => navigator.onLine,
    () => true,
  );
}

function isActive(item: NavItem, pathname: string) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
}

/* ---------- small localStorage-backed lists (per viewer, per browser) ---------- */
function useStoredList<T>(key: string) {
  const subscribe = useCallback((cb: () => void) => { window.addEventListener("storage", cb); return () => window.removeEventListener("storage", cb); }, []);
  const raw = useSyncExternalStore(subscribe, () => { try { return localStorage.getItem(key) ?? "[]"; } catch { return "[]"; } }, () => "[]");
  const list = useMemo(() => { try { const v = JSON.parse(raw); return Array.isArray(v) ? (v as T[]) : []; } catch { return []; } }, [raw]);
  const set = useCallback((next: T[]) => {
    try { localStorage.setItem(key, JSON.stringify(next)); window.dispatchEvent(new StorageEvent("storage", { key })); } catch {}
  }, [key]);
  return [list, set] as const;
}

type Recent = { href: string; label: string; area: string };

/** Pages you opened recently, like Cloudflare's "Recents": a quick way back into deep pages. */
function useRecents(current: Recent | null) {
  const [recents, setRecents] = useStoredList<Recent>("wc-recents");
  useEffect(() => {
    if (!current) return;
    if (recents[0]?.href === current.href && recents[0]?.label === current.label) return;
    setRecents([current, ...recents.filter((r) => r.href !== current.href)].slice(0, 6));
  }, [current, recents, setRecents]);
  return recents;
}

/** A sidebar section whose heading discloses its links (progressive disclosure). */
function NavSection({ id, heading, open, onToggle, children }: { id: string; heading: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div className="ws-nav-group" data-open={open}>
      <button type="button" className="ws-nav-heading" aria-expanded={open} aria-controls={"ws-nav-" + id} onClick={onToggle}>
        <span>{heading}</span><Icon name="chevronRight" size={10.5} />
      </button>
      <div className="ws-nav-collapse" id={"ws-nav-" + id} inert={!open}>
        <div>{children}</div>
      </div>
    </div>
  );
}

/** One indicator slides to the active link instead of each link restyling itself. */
function useNavIndicator(deps: unknown[]) {
  const navRef = useRef<HTMLElement>(null);
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const active = nav.querySelector<HTMLElement>('.ws-nav-link[aria-current="page"]');
      const hidden = !active || active.closest('[inert]');
      setBox(hidden ? null : { top: active.offsetTop, height: active.offsetHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(nav.firstElementChild ?? nav);
    nav.addEventListener("transitionend", measure);
    return () => { ro.disconnect(); nav.removeEventListener("transitionend", measure); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { navRef, box };
}

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  return { open, setOpen, ref };
}

export function WorkspaceShell({ viewer, source, journey, counts, search, children }: {
  viewer: ShellViewer;
  source: "sample" | "live";
  journey: "team" | "new";
  counts: { notifications: number; reviews: number };
  search: SearchEntry[];
  children: ReactNode;
}) {
  return (
    <ToastProvider>
      <ShellFrame viewer={viewer} source={source} journey={journey} counts={counts} search={search}>{children}</ShellFrame>
    </ToastProvider>
  );
}

function ShellFrame({ viewer, source, journey, counts, search, children }: Parameters<typeof WorkspaceShell>[0]) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useStoredFlag("wc-sidebar-collapsed");
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [crumb, setCrumb] = useState<string | null>(null);
  const online = useOnline();
  const context = contextFor(pathname, viewer.role);
  const contexts = navContexts.filter((c) => c.roles.includes(viewer.role));

  // Close the mobile drawer whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) { setLastPath(pathname); setDrawer(false); }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((v) => !v); }
    };
    const onOpen = () => setPalette(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener(PALETTE_EVENT, onOpen); };
  }, []);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawer(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  const crumbs = useMemo(() => {
    const list: { href: string; label: string }[] = [{ href: context.root, label: context.label }];
    const items = context.groups.flatMap((g) => g.items).concat(accountItems);
    const section = items.filter((i) => i.href !== context.root && isActive(i, pathname)).sort((a, b) => b.href.length - a.href.length)[0];
    if (section) list.push({ href: section.href, label: section.label });
    if (crumb && pathname !== section?.href && pathname !== context.root) list.push({ href: pathname, label: crumb });
    return list;
  }, [context, pathname, crumb]);

  const here = crumbs[crumbs.length - 1];
  const current = useMemo<Recent | null>(() => (here ? { href: pathname, label: here.label, area: context.label } : null), [pathname, here, context.label]);
  const recents = useRecents(current);
  const otherRecents = recents.filter((r) => r.href !== pathname).slice(0, 5);

  // Collapsed sections are remembered; the section holding the current page always opens.
  const [closed, setClosed] = useStoredList<string>("wc-nav-closed");
  // A collapsed sidebar shows icons only, so every section stays open there.
  const sectionOpen = (id: string, holdsActive: boolean) => collapsed || holdsActive || !closed.includes(id);
  const toggleSection = (id: string, open: boolean) => setClosed(open ? [...closed, id] : closed.filter((c) => c !== id));
  const { navRef, box } = useNavIndicator([pathname, closed.join(), collapsed, otherRecents.length, context.id]);

  const renderLink = (item: NavItem) => {
    const count = item.badge ? counts[item.badge] : 0;
    return (
      <li key={item.href}>
        <Link href={item.href} className="ws-nav-link" aria-current={isActive(item, pathname) ? "page" : undefined} data-tip={item.label} data-tip-side="right">
          <Icon name={item.icon} size={15.5} />
          <span className="ws-nav-label">{item.label}</span>
          {count > 0 && <span className="ws-count" aria-label={`${count} new`}>{count > 99 ? "99+" : count}</span>}
        </Link>
      </li>
    );
  };

  const collapsedDesktop = collapsed;

  return (
    <CrumbContext value={setCrumb}>
      <div className="ws" data-collapsed={collapsedDesktop} data-drawer={drawer ? "open" : "closed"}>
        <a href="#ws-main" className="ws-skip">Skip to content</a>
        <ServiceWorker />
        {viewer.role === "learner" && <ActivitySignal />}
        <aside className="ws-sidebar" aria-label="Workspace navigation">
          <div className="ws-side-head">
            <Link href="/workspace" className="ws-brand" aria-label="WeCodee workspace home">
              <Image src="/brand/sheep-mark.png" alt="" width={27} height={27} priority />
            </Link>
            <Switcher current={context.id} contexts={contexts} />
          </div>
          <button type="button" className="ws-search-trigger" onClick={() => setPalette(true)} data-tip="Search" data-tip-side="right" aria-label="Quick search">
            <Icon name="search" size={13.5} /><span>Quick search…</span><span className="ws-kbd">Ctrl K</span>
          </button>
          <nav className="ws-nav" aria-label={context.label} ref={navRef}>
            <div className="ws-nav-inner">
              <span className="ws-nav-indicator" aria-hidden style={box ? { transform: `translateY(${box.top}px)`, height: box.height, opacity: 1 } : undefined} />
              {context.groups.map((group, i) => {
                if (!group.heading) {
                  return (
                    <div key={i}>
                      <div className="ws-nav-group"><ul>{group.items.map(renderLink)}</ul></div>
                      {i === 0 && !collapsed && otherRecents.length > 0 && (
                        <NavSection id="recents" heading="Recents" open={sectionOpen("recents", false)} onToggle={() => toggleSection("recents", sectionOpen("recents", false))}>
                          <ul>
                            {otherRecents.map((r) => (
                              <li key={r.href}>
                                <Link href={r.href} className="ws-nav-link ws-nav-recent" data-tip={r.label} data-tip-side="right">
                                  <Icon name="history" size={14.5} /><span className="ws-nav-label">{r.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </NavSection>
                      )}
                    </div>
                  );
                }
                const id = context.id + "-" + group.heading.toLowerCase();
                const holdsActive = group.items.some((item) => isActive(item, pathname));
                const open = sectionOpen(id, holdsActive);
                return (
                  <NavSection key={id} id={id} heading={group.heading} open={open} onToggle={() => toggleSection(id, open)}>
                    <ul>{group.items.map(renderLink)}</ul>
                  </NavSection>
                );
              })}
            </div>
          </nav>
          <div className="ws-side-foot">
            {accountItems.map((item) => (
              <Link key={item.href} href={item.href} className="ws-nav-link" aria-current={isActive(item, pathname) ? "page" : undefined}>
                <Icon name={item.icon} size={15.5} /><span className="ws-nav-label">{item.label}</span>
              </Link>
            ))}
            <button type="button" className="ws-icon-btn ws-desktop-only" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} data-tip={collapsed ? "Expand" : "Collapse"} data-tip-side="right" aria-pressed={collapsed}>
              <Icon name="panel" size={15.5} />
            </button>
          </div>
        </aside>
        {drawer && <div className="ws-scrim" onClick={() => setDrawer(false)} aria-hidden />}

        <div className="ws-main">
          <header className="ws-topbar">
            <button type="button" className="ws-icon-btn ws-mobile-only" aria-label="Open navigation" aria-expanded={drawer} onClick={() => setDrawer(true)}>
              <Icon name="menu" size={16} />
            </button>
            <nav className="ws-crumbs" aria-label="Breadcrumb">
              <ol>
                {crumbs.map((c, i) => (
                  <li key={c.href + i}>
                    {i > 0 && <Icon name="chevronRight" size={11.5} />}
                    {i === crumbs.length - 1 ? <span aria-current="page">{c.label}</span> : <Link href={c.href}>{c.label}</Link>}
                  </li>
                ))}
              </ol>
            </nav>
            <div className="ws-top-actions">
              <button type="button" className="ws-icon-btn ws-mobile-only" aria-label="Search" onClick={() => setPalette(true)}><Icon name="search" size={15.5} /></button>
              <Help pathname={pathname} />
              <Link href="/notifications" className="ws-icon-btn" aria-label={counts.notifications ? `Notifications, ${counts.notifications} unread` : "Notifications"} data-tip="Notifications" data-tip-side="bottom">
                <Icon name="bell" size={15.5} />{counts.notifications > 0 && <span className="ws-dot" />}
              </Link>
              <Account viewer={viewer} />
            </div>
          </header>
          {!online && <p className="ws-offline" role="status"><Icon name="wifiOff" size={13.5} />You’re offline. You can save a daily report from the open report page.</p>}
          {source === "sample" && <SampleStrip viewer={viewer} journey={journey} />}
          <main id="ws-main" tabIndex={-1} style={{ outline: "none" }}>{children}</main>
        </div>
        <Palette open={palette} onClose={() => setPalette(false)} role={viewer.role} extra={search} recents={otherRecents} />
      </div>
    </CrumbContext>
  );
}

function Switcher({ current, contexts }: { current: string; contexts: typeof navContexts }) {
  const { open, setOpen, ref } = usePopover();
  const active = contexts.find((c) => c.id === current) ?? contexts[0];
  if (contexts.length === 1) {
    return <div className="ws-switcher"><Link href="/workspace" style={{ display: "block", padding: "3.5px 7px", fontWeight: 650, letterSpacing: "-.02em" }}>wecodee<span style={{ color: "var(--ws-red)" }}>.</span></Link></div>;
  }
  return (
    <div className="ws-switcher" ref={ref}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="ws-switcher-label">{active.label}<small>{active.description}</small></span>
        <Icon name="chevronUpDown" size={13.5} />
      </button>
      {open && (
        <div className="ws-menu" role="menu" style={{ top: "calc(100% + 5.5px)", left: 0, right: -8 }}>
          {contexts.map((c) => (
            <Link key={c.id} href={c.root} role="menuitem" data-active={c.id === current} onClick={() => setOpen(false)}>
              <span style={{ flex: 1 }}><span style={{ display: "block", fontWeight: 600 }}>{c.label}</span><span className="ws-faint ws-small">{c.description}</span></span>
              {c.id === current && <Icon name="check" size={13.5} />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Help({ pathname }: { pathname: string }) {
  const { open, setOpen, ref } = usePopover();
  const topic = helpFor(pathname);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" className="ws-text-btn" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen(!open)}>
        <Icon name="help" size={14.5} /><span className="ws-desktop-only">Help</span>
      </button>
      {open && (
        <div className="ws-menu" role="dialog" aria-label={"Help: " + topic.title} style={{ right: 0, top: "calc(100% + 5.5px)", width: 320 }}>
          <div style={{ display: "flex", gap: 12, padding: "7px 7px 3.5px", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stills.badge} alt="" width={58} height={58} style={{ objectFit: "contain", flex: "none" }} />
            <div><strong style={{ display: "block", fontWeight: 650 }}>{topic.title}</strong><span className="ws-muted ws-small">A few things worth knowing.</span></div>
          </div>
          <ul style={{ display: "grid", gap: 8, padding: "7px 9px 9px" }}>
            {topic.tips.map((tip) => (
              <li key={tip} style={{ display: "flex", gap: 8, color: "#3d3d3d" }}><Icon name="check" size={12.5} className="ws-faint" /><span className="ws-small">{tip}</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Account({ viewer }: { viewer: ShellViewer }) {
  const { open, setOpen, ref } = usePopover();
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const initials = viewer.name.split(/\s+/).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");

  async function signOut() {
    setBusy(true);
    if (viewer.preview) { router.push("/"); return; }
    const error = await authRequest("/api/auth/sign-out", {});
    if (!error) { window.location.replace("/login"); return; }
    toast({ tone: "error", message: "We couldn’t sign you out. Please try again." });
    setBusy(false);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" className="ws-icon-btn" aria-haspopup="menu" aria-expanded={open} aria-label="Account menu" onClick={() => setOpen(!open)}>
        <span className="ws-avatar">{initials}</span>
      </button>
      {open && (
        <div className="ws-menu" role="menu" style={{ right: 0, top: "calc(100% + 5.5px)", width: 260 }}>
          <div className="ws-menu-head"><strong>{viewer.name}</strong><span>{viewer.email}</span><span style={{ display: "block", marginTop: 6 }}><span className="ws-badge" data-plain>{roleLabel[viewer.role]}</span></span></div>
          <hr />
          {viewer.role === "learner" && <Link role="menuitem" href="/learner/portfolio" onClick={() => setOpen(false)}><Icon name="user" size={13.5} />Portfolio</Link>}
          <Link role="menuitem" href="/settings" onClick={() => setOpen(false)}><Icon name="settings" size={13.5} />Settings</Link>
          <Link role="menuitem" href="/" onClick={() => setOpen(false)}><Icon name="home" size={13.5} />WeCodee website</Link>
          <InstallItem onDone={() => setOpen(false)} />
          <hr />
          <button role="menuitem" type="button" onClick={signOut} disabled={busy}><Icon name="logout" size={13.5} />{busy ? "Signing out…" : "Sign out"}</button>
        </div>
      )}
    </div>
  );
}

function SampleStrip({ viewer, journey }: { viewer: ShellViewer; journey: "team" | "new" }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <div className="ws-sample" role="note" aria-busy={pending}>
      <span className="ws-badge" data-tone="amber">Sample data</span>
      <span>The learning backend isn’t connected yet. <strong>Changes are kept on this server only and reset on restart.</strong></span>
      <div className="ws-sample-controls">
        <div className="ws-segment" role="group" aria-label="Sample journey">
          {(["new", "team"] as const).map((j) => (
            <button key={j} type="button" aria-pressed={journey === j} disabled={pending} onClick={() => start(() => setSampleJourney(j))}>
              {j === "new" ? "New builder" : "In a team"}
            </button>
          ))}
        </div>
        {viewer.preview && (
          <div className="ws-segment" role="group" aria-label="Preview as role">
            {(["learner", "supervisor", "admin"] as const).map((r) => (
              <button key={r} type="button" aria-pressed={viewer.role === r} disabled={pending} onClick={() => start(() => setPreviewRole(r))}>{roleLabel[r]}</button>
            ))}
          </div>
        )}
        <button type="button" className="ws-btn ws-btn-ghost ws-btn-sm" disabled={pending} onClick={() => start(async () => { const r = await resetSample(); toast({ tone: r.ok ? "success" : "error", message: r.message }); })}>Reset</button>
      </div>
    </div>
  );
}

function Palette({ open, onClose, role, extra, recents }: { open: boolean; onClose: () => void; role: Role; extra: SearchEntry[]; recents: Recent[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const entries = useMemo(() => {
    const pages: SearchEntry[] = navContexts.filter((c) => c.roles.includes(role)).flatMap((c) =>
      c.groups.flatMap((g) => g.items.map((i) => ({ href: i.href, label: i.label, group: c.label, hint: g.heading }))));
    return [...pages, { href: "/settings", label: "Settings", group: "Account" }, ...extra];
  }, [role, extra]);
  const q = query.trim().toLowerCase();
  const recentEntries: SearchEntry[] = recents.map((r) => ({ href: r.href, label: r.label, group: "Recent", hint: r.area }));
  const results = (q ? entries.filter((e) => (e.label + " " + (e.hint ?? "") + " " + e.group).toLowerCase().includes(q)) : [...recentEntries, ...entries]).slice(0, 40);
  const close = () => { setQuery(""); setActive(0); onClose(); };
  const go = (href: string) => { close(); router.push(href); };
  let lastGroup = "";

  return (
    <Dialog open={open} onClose={close} label="Search WeCodee" className="ws-palette">
      <div className="ws-palette-input">
        <Icon name="search" size={15.5} />
        <input
          autoFocus
          value={query}
          placeholder="Search pages, Hot Topics and articles…"
          aria-label="Search"
          aria-controls="ws-palette-list"
          aria-activedescendant={results[active] ? "ws-pal-" + active : undefined}
          onChange={(e) => { setQuery(e.target.value); setActive(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
            if (e.key === "Enter" && results[active]) { e.preventDefault(); go(results[active].href); }
          }}
        />
        <span className="ws-kbd">Esc</span>
      </div>
      <div className="ws-palette-list" id="ws-palette-list" role="listbox">
        {results.length === 0 && (
          <div className="ws-palette-empty">
            <span className="ws-mascot" data-soft="">{/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stills.map} alt="" /></span>
            <strong>Nothing on the map for “{query}”.</strong>
            <span className="ws-small">Try a page name, a Hot Topic or an article.</span>
          </div>
        )}
        {results.map((r, i) => {
          const header = r.group !== lastGroup ? r.group : null;
          lastGroup = r.group;
          return (
            <div key={r.href + i}>
              {header && <p className="ws-palette-group">{header}</p>}
              <a
                id={"ws-pal-" + i}
                role="option"
                aria-selected={i === active}
                data-active={i === active}
                href={r.href}
                onMouseMove={() => setActive(i)}
                onClick={(e) => { e.preventDefault(); go(r.href); }}
              >
                <Icon name="arrowRight" size={12.5} className="ws-faint" />{r.label}{r.hint && <small>{r.hint}</small>}
              </a>
            </div>
          );
        })}
      </div>
    </Dialog>
  );
}
