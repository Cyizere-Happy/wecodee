import { authUnavailable, getAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await getAuth();
  if (!auth) return authUnavailable();

  const response = await auth.handler(request);
  const retry = response.headers.get("X-Retry-After");
  if (response.status !== 429 || !retry) return response;

  const headers = new Headers(response.headers);
  headers.set("Retry-After", retry);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const POST = GET;
