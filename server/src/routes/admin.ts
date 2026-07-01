import { Router } from "express";
import { db } from "../db/index.js";
import { rounds, playerStats, users, players, transferWindows } from "../../../shared/schema.js";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { AuthedRequest } from "../types.js";

export const adminRouter = Router();

const createRoundSchema = z.object({
  roundNumber: z.number().int().min(1),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean().optional(),
});

const enterStatsSchema = z.object({
  roundId: z.number().int(),
  stats: z.array(
    z.object({
      playerId: z.number().int(),
      goals: z.number().int().min(0).default(0),
      assists: z.number().int().min(0).default(0),
      cleanSheet: z.boolean().default(false),
      minutesPlayed: z.number().int().min(0).default(0),
      teamResult: z.enum(["W", "D", "L"]),
    })
  ),
});

// POST /api/admin/rounds — create or update a round
adminRouter.post("/rounds", async (req: AuthedRequest, res) => {
  const parsed = createRoundSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

  const { roundNumber, startDate, endDate, isActive } = parsed.data;

  if (isActive) {
    // Deactivate all other rounds first
    await db.update(rounds).set({ isActive: 0 });
  }

  const existing = db.select().from(rounds).where(eq(rounds.roundNumber, roundNumber)).get();
  if (existing) {
    const [updated] = await db
      .update(rounds)
      .set({ startDate, endDate, isActive: isActive ? 1 : existing.isActive })
      .where(eq(rounds.id, existing.id))
      .returning();
    return res.json(updated);
  }

  const [round] = await db
    .insert(rounds)
    .values({ roundNumber, startDate, endDate, isActive: isActive ? 1 : 0 })
    .returning();
  return res.status(201).json(round);
});

// POST /api/admin/stats — enter player stats for a round
adminRouter.post("/stats", async (req: AuthedRequest, res) => {
  const parsed = enterStatsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

  const { roundId, stats } = parsed.data;

  for (const s of stats) {
    const existing = db
      .select()
      .from(playerStats)
      .where(
        // Check by playerId + roundId
        eq(playerStats.playerId, s.playerId)
      )
      .all()
      .find((x) => x.roundId === roundId);

    const values = {
      playerId: s.playerId,
      roundId,
      goals: s.goals,
      assists: s.assists,
      cleanSheet: s.cleanSheet ? 1 : 0,
      minutesPlayed: s.minutesPlayed,
      teamResult: s.teamResult,
    };

    if (existing) {
      await db.update(playerStats).set(values).where(eq(playerStats.id, existing.id));
    } else {
      await db.insert(playerStats).values(values);
    }
  }

  return res.json({ ok: true, count: stats.length });
});

// GET /api/admin/users — list all users
adminRouter.get("/users", async (_req, res) => {
  const all = db.select().from(users).all();
  return res.json(all.map(({ passwordHash: _, ...u }) => u));
});

// PATCH /api/admin/users/:id/admin — toggle admin
adminRouter.patch("/users/:id/admin", async (req: AuthedRequest, res) => {
  const userId = parseInt(req.params.id);
  const { isAdmin } = req.body as { isAdmin: boolean };
  const [updated] = await db
    .update(users)
    .set({ isAdmin: isAdmin ? 1 : 0 })
    .where(eq(users.id, userId))
    .returning();
  if (!updated) return res.status(404).json({ message: "Gebruiker niet gevonden" });
  const { passwordHash: _, ...publicUser } = updated;
  return res.json(publicUser);
});

// GET /api/admin/rounds — list all rounds
adminRouter.get("/rounds", async (_req, res) => {
  const all = db.select().from(rounds).all();
  return res.json(all);
});

// GET /api/admin/transfer-windows
adminRouter.get("/transfer-windows", async (_req, res) => {
  const all = db.select().from(transferWindows).all();
  return res.json(all);
});

// POST /api/admin/transfer-windows
adminRouter.post("/transfer-windows", async (req, res) => {
  const { windowNumber, startDate, endDate, isOpen } = req.body as {
    windowNumber: number; startDate: string; endDate: string; isOpen?: boolean;
  };
  const existing = db.select().from(transferWindows).where(eq(transferWindows.windowNumber, windowNumber)).get();
  if (existing) {
    const [updated] = await db.update(transferWindows)
      .set({ startDate, endDate, isOpen: isOpen ? 1 : existing.isOpen })
      .where(eq(transferWindows.id, existing.id)).returning();
    return res.json(updated);
  }
  const [created] = await db.insert(transferWindows).values({ windowNumber, startDate, endDate, isOpen: isOpen ? 1 : 0 }).returning();
  return res.status(201).json(created);
});

// PATCH /api/admin/transfer-windows/:id/toggle
adminRouter.patch("/transfer-windows/:id/toggle", async (req, res) => {
  const id = parseInt(req.params.id);
  const win = db.select().from(transferWindows).where(eq(transferWindows.id, id)).get();
  if (!win) return res.status(404).json({ message: "Niet gevonden" });
  const [updated] = await db.update(transferWindows).set({ isOpen: win.isOpen ? 0 : 1 }).where(eq(transferWindows.id, id)).returning();
  return res.json(updated);
});

// PATCH /api/admin/rounds/:id/activate — set a round active
adminRouter.patch("/rounds/:id/activate", async (req: AuthedRequest, res) => {
  const roundId = parseInt(req.params.id);
  // Deactivate all
  await db.update(rounds).set({ isActive: 0 });
  const [round] = await db
    .update(rounds)
    .set({ isActive: 1 })
    .where(eq(rounds.id, roundId))
    .returning();
  if (!round) return res.status(404).json({ message: "Ronde niet gevonden" });
  return res.json(round);
});
