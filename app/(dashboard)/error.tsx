"use client";

import Link from "next/link";
import "@/components/workspace/workspace.css";
import { EmptyState } from "@/components/workspace/ui";

export default function WorkspaceError({ reset, retry }: { reset: () => void; retry?: () => void }) {
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  return (
    <div className="ws-content ws-content-narrow">
      <div className="ws-card">
        <EmptyState
          still={offline ? "cable" : undefined}
          art={offline ? undefined : "admin/maintenance"}
          title={offline ? "You’re offline" : "We couldn’t load this page"}
          actions={<>
            <button type="button" className="ws-btn ws-btn-primary" onClick={retry ?? reset}>Try again</button>
            <Link href="/workspace" className="ws-btn ws-btn-secondary">Back to overview</Link>
          </>}
        >
          {offline ? "Reconnect to the internet and try again." : "Try loading the page again or return to your overview."}
        </EmptyState>
      </div>
    </div>
  );
}
