import { Hono } from "hono";

export const oauthRoute = new Hono();

oauthRoute.get("/oauth/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");

  if (!code || !state) {
    return c.json({ ok: false, error: "Missing code or state." }, 400);
  }

  return c.json({
    ok: true,
    codeReceived: true,
    stateReceived: true
  });
});
