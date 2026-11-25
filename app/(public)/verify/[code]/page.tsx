import { Suspense } from "react";
import { verifyPublicCertificate } from "@/lib/workspace/public-actions";
import { VerifyLayout } from "@/components/workspace/verify-page";

export const metadata = { title: "Verify a certificate · WeCodee", robots: { index: false } };

/** The QR code on a certificate opens this page with its code already checked. */
export default function VerifyCode({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<VerifyLayout />}>
      <Checked params={params} />
    </Suspense>
  );
}

async function Checked({ params }: { params: Promise<{ code: string }> }) {
  const code = decodeURIComponent((await params).code).slice(0, 20);
  return <VerifyLayout code={code} result={await verifyPublicCertificate(code)} />;
}
