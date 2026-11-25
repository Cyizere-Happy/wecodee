"use client";

import { useState, useTransition } from "react";
import { verifyCertificate, type VerifyResult } from "@/lib/workspace/actions";
import { formatDate } from "@/lib/workspace/rules";
import { stills } from "@/lib/workspace/mascot";
import { Icon } from "./Icon";

/** FR-51. Signed-in pages use the workspace lookup; the public page passes its own `verify`. */
export function VerifyCertificate({ initial = "", initialResult = null, verify = verifyCertificate }: { initial?: string; initialResult?: VerifyResult | null; verify?: (code: string) => Promise<VerifyResult> }) {
  const [code, setCode] = useState(initial);
  const [result, setResult] = useState<VerifyResult | null>(initialResult);
  const [pending, start] = useTransition();
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <form className="ws-row" onSubmit={(e) => { e.preventDefault(); if (code.trim()) start(async () => setResult(await verify(code))); }}>
        <label htmlFor="verify-code" className="ws-sr">Certificate code</label>
        <input id="verify-code" className="ws-input mono" value={code} onChange={(e) => { setCode(e.target.value); setResult(null); }} placeholder="WCD-XXXX-XXXX" maxLength={20} autoCapitalize="characters" spellCheck={false} />
        <button className="ws-btn ws-btn-secondary" disabled={pending || !code.trim()}>{pending && <span className="ws-spinner" aria-hidden />}Verify</button>
      </form>
      <div aria-live="polite">
        {result && !result.found && (
          <div className="ws-row" style={{ alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stills.map} alt="" width={58} height={58} style={{ objectFit: "contain" }} />
            <p className="ws-small"><strong>No certificate with that code.</strong><br /><span className="ws-muted">Check for typos. Codes look like WCD-7K2M-Q9TA.</span></p>
          </div>
        )}
        {result?.found && (
          <div className="ws-feedback" data-tone={result.revoked ? "error" : "success"}>
            <Icon name={result.revoked ? "alert" : "check"} size={12.5} />
            <span>
              <strong>{result.revoked ? "Revoked certificate" : "Genuine certificate"}</strong><br />
              {result.learnerName}, {result.role} on {result.projectTitle}. Completed {formatDate(result.completedAt)}, supervised by {result.supervisorName}.
              {result.revoked && result.revokeReason && <><br />Reason: {result.revokeReason}</>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function PrintButton() {
  return <button type="button" className="ws-btn ws-btn-primary" onClick={() => window.print()}><Icon name="download" size={13.5} />Download PDF</button>;
}
