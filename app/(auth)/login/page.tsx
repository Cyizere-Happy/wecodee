import { AuthScreen } from "@/components/auth/AuthScreen";

export const metadata = {
  title: "Sign in · WeCodee",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function Page() {
  return <AuthScreen mode="login" />;
}
