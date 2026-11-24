"use client";

import { StatusPage } from "@/components/auth/StatusPage";

export default function AuthError({ reset, retry }: { reset: () => void; retry?: () => void }) {
  return <StatusPage code="500" retry={retry ?? reset} />;
}
