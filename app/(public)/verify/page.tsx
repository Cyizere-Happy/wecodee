import { VerifyLayout } from "@/components/workspace/verify-page";

export const metadata = { title: "Verify a certificate · WeCodee" };

/** FR-51: anyone can enter a code to check that a certificate is genuine. */
export default function VerifyPage() {
  return <VerifyLayout />;
}
