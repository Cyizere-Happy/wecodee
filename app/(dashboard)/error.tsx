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
          still={offline ? "cable" : "repair"}
          title={offline ? "Lost our connection." : "Even builders break things."}
          actions={<>
            <button type="button" className="ws-btn ws-btn-primary" onClick={retry ?? reset}>Try again</button>
            <Link href="/workspace" className="ws-btn ws-btn-secondary">Back to overview</Link>
          </>}
        >
          {offline ? "Reconnect to the internet to continue your journey." : "Something went wrong on our side while loading this page. Your work is safe."}
        </EmptyState>
      </div>
    </div>
  );
}
