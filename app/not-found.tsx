import { AuthShell } from "@/components/auth/AuthShell";
import { StatusPage } from "@/components/auth/StatusPage";

export default function NotFound() {
  return <AuthShell><StatusPage code="404" /></AuthShell>;
}
