"use server";

import { findCertificate } from "./public";
import type { VerifyResult } from "./actions";

/** FR-51: anyone can check a certificate code. No sign-in, no personal contact details. */
export async function verifyPublicCertificate(code: string): Promise<VerifyResult> {
  const cert = findCertificate(String(code ?? ""));
  if (!cert) return { found: false };
  return { found: true, learnerName: cert.learnerName, projectTitle: cert.projectTitle, role: cert.role, completedAt: cert.completedAt, supervisorName: cert.supervisorName, revoked: Boolean(cert.revokedAt), revokeReason: cert.revokeReason };
}
