import { Suspense } from "react";
import { AuthLinkScreen, AuthLoading } from "@/components/auth/AuthScreen";

export const metadata = {
  title: "Verify your email · WeCodee",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

async function LinkScreen({ searchParams }: PageProps<"/verify-email">) {
  const { token, request } = await searchParams;
  const link = typeof token === "string" ? token : undefined;
  return <AuthLinkScreen key={link ?? (request ? "fresh-link" : "verify")} mode="verify" token={link} />;
}

export default function Page(props: PageProps<"/verify-email">) {
  return <Suspense fallback={<AuthLoading />}><LinkScreen {...props} /></Suspense>;
}
