import { Hono } from "hono";
import { z } from "zod";

const interactionSchema = z.object({
  type: z.number(),
  data: z
    .object({
      name: z.string()
    })
    .optional()
});

export const interactionsRoute = new Hono();

interactionsRoute.post("/interactions", async (c) => {
  const payload = interactionSchema.parse(await c.req.json());

  if (payload.type === 1) {
    return c.json({ type: 1 });
  }

  if (payload.data?.name === "strats refresh") {
    return c.json({
      type: 4,
      data: { content: "Queued a role refresh request." }
    });
  }

  return c.json({
    type: 4,
    data: { content: "Command scaffolded but not implemented yet." }
  });
});
