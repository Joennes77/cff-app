import { Router } from "express";
import { db } from "../db/index.js";
import {
  userTeams,
  userTeamPlayers,
  players,
  poolMembers,
  transferWindows,
  transfers,
  saveTeamSchema,
} from "../../../shared/schema.js";
import { eq, and } from "drizzle-orm";
import type { AuthedRequest } from "../types.js";

export const teamsRouter = Router();

const BUDGET = 250; // €250M

// GET /api/teams/:poolId — get my team for a pool
teamsRouter.get("/:poolId", async (req: AuthedRequest, res) => {
  const poolId = parseInt(req.params.poolId);

  const member = db
    .select()
    .from(poolMembers)
    .where(and(eq(poolMembers.poolId, poolId), eq(poolMembers.userId, req.userId!)))
    .get();
  if (!member) return res.status(403).json({ message: "Geen toegang" });

  const team = db
    .select()
    .from(userTeams)
    .where(and(eq(userTeams.userId, req.userId!), eq(userTeams.poolId, poolId)))
    .get();

  if (!team) return res.json(null);

  const teamPlayers = db
    .select()
    .from(userTeamPlayers)
    .where(eq(userTeamPlayers.userTeamId, team.id))
    .all();

  const allPlayers = db.select().from(players).all();

  const starters = teamPlayers
    .filter((tp) => tp.isStarter)
    .map((tp) => allPlayers.find((p) => p.id === tp.playerId))
    .filter(Boolean);

  const subs = teamPlayers
    .filter((tp) => !tp.isStarter)
    .map((tp) => allPlayers.find((p) => p.id === tp.playerId))
    .filter(Boolean);

  const totalPrice = [...starters, ...subs].reduce((sum, p) => sum + (p?.price ?? 0), 0);

  return res.json({ team, starters, subs, totalPrice });
});

// POST /api/teams/:poolId — save/update my team
teamsRouter.post("/:poolId", async (req: AuthedRequest, res) => {
  const poolId = parseInt(req.params.poolId);

  const member = db
    .select()
    .from(poolMembers)
    .where(and(eq(poolMembers.poolId, poolId), eq(poolMembers.userId, req.userId!)))
    .get();
  if (!member) return res.status(403).json({ message: "Geen toegang" });

  const parsed = saveTeamSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

  const { starterIds, subIds } = parsed.data;
  const allIds = [...starterIds, ...subIds];

  // Validate no duplicates
  if (new Set(allIds).size !== allIds.length) {
    return res.status(400).json({ message: "Geen dubbele spelers toegestaan" });
  }

  // Validate budget
  const selectedPlayers = db.select().from(players).all().filter((p) => allIds.includes(p.id));
  if (selectedPlayers.length !== allIds.length) {
    return res.status(400).json({ message: "Ongeldige spelers" });
  }
  const total = selectedPlayers.reduce((s, p) => s + p.price, 0);
  if (total > BUDGET) {
    return res.status(400).json({ message: `Budget overschreden (€${total.toFixed(1)}M van €${BUDGET}M)` });
  }

  const now = new Date().toISOString();

  // Check if this is an update (existing team) — if so, require open transfer window
  const existingTeamCheck = db
    .select()
    .from(userTeams)
    .where(and(eq(userTeams.userId, req.userId!), eq(userTeams.poolId, poolId)))
    .get();

  if (existingTeamCheck) {
    const openWindow = db.select().from(transferWindows).where(eq(transferWindows.isOpen, 1)).get();
    if (!openWindow) {
      return res.status(403).json({ message: "Er is geen open transferwindow. Je kunt je team nu niet wijzigen." });
    }
  }

  // Upsert team
  let team = existingTeamCheck;

  if (team) {
    // Log transfers (players that changed)
    const oldPlayers = db.select().from(userTeamPlayers).where(eq(userTeamPlayers.userTeamId, team.id)).all();
    const oldIds = new Set(oldPlayers.map((p) => p.playerId));
    const newIds = new Set(allIds);
    const removedIds = [...oldIds].filter((id) => !newIds.has(id));
    const addedIds = [...newIds].filter((id) => !oldIds.has(id));
    const openWindow = db.select().from(transferWindows).where(eq(transferWindows.isOpen, 1)).get();

    for (let i = 0; i < Math.min(removedIds.length, addedIds.length); i++) {
      await db.insert(transfers).values({
        userId: req.userId!,
        poolId,
        transferWindowNumber: openWindow!.windowNumber,
        playerOutId: removedIds[i],
        playerInId: addedIds[i],
        createdAt: now,
      });
    }

    await db.update(userTeams).set({ updatedAt: now }).where(eq(userTeams.id, team.id));
    await db.delete(userTeamPlayers).where(eq(userTeamPlayers.userTeamId, team.id));
  } else {
    const [newTeam] = await db
      .insert(userTeams)
      .values({ userId: req.userId!, poolId, createdAt: now, updatedAt: now })
      .returning();
    team = newTeam;
  }

  // Insert player assignments
  const rows = [
    ...starterIds.map((id) => ({ userTeamId: team!.id, playerId: id, isStarter: 1 })),
    ...subIds.map((id) => ({ userTeamId: team!.id, playerId: id, isStarter: 0 })),
  ];
  await db.insert(userTeamPlayers).values(rows);

  return res.json({ ok: true, teamId: team.id });
});
