import { VerifyCertificate } from "./certificate";
import { Mascot } from "./ui";
import { verifyPublicCertificate } from "@/lib/workspace/public-actions";
import type { VerifyResult } from "@/lib/workspace/actions";

/** FR-51 public certificate check, shared by /verify and /verify/[code]. */
export function VerifyLayout({ code = "", result = null }: { code?: string; result?: VerifyResult | null }) {
  return (
    <div className="ws-content ws-content-narrow">
      <section className="ws-card" style={{ overflow: "hidden" }}>
        <div className="ws-public-hero">
          <div style={{ display: "grid", gap: 9, padding: "22px 22px 24px" }}>
            <span className="ws-eyebrow">Certificate check</span>
            <h1 className="ws-title">Is this WeCodee certificate genuine?</h1>
            <p className="ws-muted">Enter the code printed on the certificate, or scan its QR code. You’ll see the learner, project, role and completion date.</p>
            <VerifyCertificate initial={code} initialResult={result} verify={verifyPublicCertificate} showSteps />
          </div>
          <Mascot still="badge" className="ws-public-art" />
        </div>
      </section>
    </div>
  );
}
