import Link from "next/link";
import { EmptyState } from "@/components/workspace/ui";

export default function WorkspaceNotFound() {
  return (
    <div className="ws-content ws-content-narrow">
      <div className="ws-card">
        <EmptyState still="map" title="Well, this wasn’t on the map." actions={<Link href="/workspace" className="ws-btn ws-btn-primary">Back to overview</Link>}>
          The page may have moved, or the item no longer exists.
        </EmptyState>
      </div>
    </div>
  );
}
