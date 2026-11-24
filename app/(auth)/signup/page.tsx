import { AuthScreen } from "@/components/auth/AuthScreen";

export const metadata = {
  title: "Create an account · WeCodee",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function Page() {
  return <AuthScreen mode="signup" />;
}
