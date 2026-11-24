import { Suspense } from "react";
import { AuthLinkScreen, AuthLoading } from "@/components/auth/AuthScreen";

export const metadata = {
  title: "Reset your password · WeCodee",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

async function LinkScreen({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  const link = typeof token === "string" ? token : undefined;
  return <AuthLinkScreen key={link} mode="reset" token={link} />;
}

export default function Page(props: PageProps<"/reset-password">) {
  return <Suspense fallback={<AuthLoading />}><LinkScreen {...props} /></Suspense>;
}
