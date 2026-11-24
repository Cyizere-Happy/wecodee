import { authUnavailable, getAuth } from "@/lib/auth";

export async function POST(request: Request) {
  const auth = await getAuth();
  if (!auth) return authUnavailable();

  const context = await auth.$context;
  const origin = new URL(context.baseURL).origin;
  if (request.headers.get("origin") !== origin) {
    return Response.json({ code: "FORBIDDEN" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (typeof body?.token !== "string" || !/^[a-zA-Z0-9._-]{12,2048}$/.test(body.token)) {
    return Response.json({ code: "INVALID_TOKEN" }, { status: 400 });
  }

  const location = new URL("/api/auth/verify-email", origin);
  location.searchParams.set("token", body.token);
  return auth.handler(new Request(location, { headers: request.headers }));
}
