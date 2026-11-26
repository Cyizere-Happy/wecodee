import { scenes } from "@/lib/workspace/mascot";

/** Page-level placeholder that keeps the layout steady while data streams in. */
export function PageSkeleton({ label = "Loading your workspace…" }: { label?: string }) {
  return (
    <div className="ws-content" aria-busy="true">
      <p className="ws-sr" role="status">{label}</p>
      <span className="ws-skel ws-skel-line" style={{ width: 90, marginBottom: 10 }} />
      <span className="ws-skel ws-skel-title" />
      <span className="ws-skel ws-skel-line" style={{ width: "min(378px, 80%)", marginTop: 12 }} />
      <div className="ws-grid" style={{ marginTop: 28 }}>
        <span className="ws-skel ws-skel-card" />
        <span className="ws-skel ws-skel-card" />
        <span className="ws-skel ws-skel-card" />
      </div>
      <span className="ws-skel ws-skel-card" style={{ marginTop: 16, height: 220 }} />
    </div>
  );
}

/** First paint before the session resolves: the sheep at the desk, as on the sign-up screen. */
export function ShellSkeleton() {
  return (
    <div className="ws" aria-busy="true">
      <aside className="ws-sidebar ws-desktop-only" aria-hidden>
        <div className="ws-side-head"><span className="ws-skel" style={{ width: 30, height: 30, borderRadius: 8 }} /><span className="ws-skel ws-skel-line" style={{ width: 120 }} /></div>
        <div style={{ padding: "7px 14.5px", display: "grid", gap: 14 }}>
          {Array.from({ length: 9 }, (_, i) => <span key={i} className="ws-skel ws-skel-line" style={{ width: `${50 + ((i * 17) % 40)}%` }} />)}
        </div>
      </aside>
      <div className="ws-main">
        <div className="ws-topbar"><span className="ws-skel ws-skel-line" style={{ width: 160 }} /></div>
        <div className="ws-loading" role="status">
          <span className="ws-mascot" data-scene="">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={scenes.desk} alt="" />
          </span>
          <strong>Opening your workspace…</strong>
        </div>
      </div>
    </div>
  );
}
