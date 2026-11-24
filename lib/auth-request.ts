type AuthError = { code: string; status: number; retryAfter?: number };

export async function authRequest(path: string, body?: Record<string, string | boolean>): Promise<AuthError | null> {
  try {
    const response = await fetch(path, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    if (response.ok) return null;

    const data = await response.json().catch(() => null);
    const retry = response.headers.get("Retry-After") ?? response.headers.get("X-Retry-After");
    const retryAfter = retry
      ? Math.max(1, Number(retry) || Math.ceil((Date.parse(retry) - Date.now()) / 1000) || 60)
      : undefined;

    return { code: typeof data?.code === "string" ? data.code : "", status: response.status, retryAfter };
  } catch {
    return { code: navigator.onLine ? "NETWORK" : "OFFLINE", status: 0 };
  }
}

export function signInDestination(next: string | null) {
  if (!next?.startsWith("/") || /[\\\s]/.test(next)) return "/workspace";
  try {
    const origin = "https://wecodee.local";
    const url = new URL(next, origin);
    if (url.origin !== origin || url.pathname.startsWith("/api/")) return "/workspace";
    if (["/login", "/signup", "/verify-email", "/forgot-password", "/reset-password"].includes(url.pathname)) {
      return "/workspace";
    }
    return url.pathname + url.search + url.hash;
  } catch {
    return "/workspace";
  }
}
