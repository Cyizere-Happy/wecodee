"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { StatusPage } from "@/components/auth/StatusPage";

export default function ErrorPage({ reset, retry }: { reset: () => void; retry?: () => void }) {
  return <AuthShell><StatusPage code="500" retry={retry ?? reset} /></AuthShell>;
}
