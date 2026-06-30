import { Router } from "express";
import { db } from "../db/index.js";
import { players } from "../../../shared/schema.js";
import { eq, like, and } from "drizzle-orm";
import type { AuthedRequest } from "../types.js";

export const playersRouter = Router();

// GET /api/players?club=Ajax&position=FWD&search=Luuk
playersRouter.get("/", (req: AuthedRequest, res) => {
  const { club, position, search } = req.query as Record<string, string | undefined>;

  let all = db.select().from(players).all();

  if (club) all = all.filter((p) => p.club === club);
  if (position) all = all.filter((p) => p.position === position);
  if (search) {
    const q = search.toLowerCase();
    all = all.filter((p) => p.name.toLowerCase().includes(q) || p.club.toLowerCase().includes(q));
  }

  return res.json(all);
});
