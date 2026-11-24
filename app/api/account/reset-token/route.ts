import { authUnavailable, getAuth } from "@/lib/auth";

export async function POST(request: Request) {
  const respond = (code: string, status: number) =>
    Response.json({ code }, { status, headers: { "Cache-Control": "no-store" } });

  const auth = await getAuth();
  if (!auth) return authUnavailable();

  const context = await auth.$context;
  if (request.headers.get("origin") !== new URL(context.baseURL).origin) {
    return respond("FORBIDDEN", 403);
  }

  const body = await request.json().catch(() => null);
  if (typeof body?.token !== "string" || !/^[a-zA-Z0-9_-]{16,128}$/.test(body.token)) {
    return respond("INVALID_TOKEN", 400);
  }
  const record = await context.internalAdapter.findVerificationValue("reset-password:" + body.token);
  if (!record) return respond("INVALID_TOKEN", 400);
  if (record.expiresAt.getTime() <= Date.now()) return respond("TOKEN_EXPIRED", 410);
  return respond("VALID", 200);
}
