import { Router } from "express";
import { randomBytes } from "node:crypto";
import { db } from "../db/index.js";
import {
  pools,
  poolMembers,
  userTeams,
  userTeamPlayers,
  players,
  playerStats,
  roundPredictions,
  rounds,
  users,
  createPoolSchema,
  joinPoolSchema,
} from "../../../shared/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { calcPlayerPoints, calcPredictionPoints } from "../../../shared/scoring.js";
import type { AuthedRequest } from "../types.js";

export const poolsRouter = Router();

// POST /api/pools — create a pool
poolsRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = createPoolSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

  const accessCode = randomBytes(3).toString("hex").toUpperCase(); // e.g. "A1B2C3"
  const [pool] = await db
    .insert(pools)
    .values({ name: parsed.data.name, accessCode, ownerId: req.userId! })
    .returning();

  // Owner is also a member
  await db.insert(poolMembers).values({ poolId: pool.id, userId: req.userId! });

  return res.status(201).json(pool);
});

// POST /api/pools/join — join a pool with access code
poolsRouter.post("/join", async (req: AuthedRequest, res) => {
  const parsed = joinPoolSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

  const pool = db.select().from(pools).where(eq(pools.accessCode, parsed.data.accessCode.toUpperCase())).get();
  if (!pool) return res.status(404).json({ message: "Pool niet gevonden" });

  const existing = db
    .select()
    .from(poolMembers)
    .where(and(eq(poolMembers.poolId, pool.id), eq(poolMembers.userId, req.userId!)))
    .get();
  if (existing) return res.status(409).json({ message: "Je bent al lid van deze pool" });

  await db.insert(poolMembers).values({ poolId: pool.id, userId: req.userId! });
  return res.json(pool);
});

// GET /api/pools — my pools
poolsRouter.get("/", async (req: AuthedRequest, res) => {
  const memberships = db
    .select()
    .from(poolMembers)
    .where(eq(poolMembers.userId, req.userId!))
    .all();

  const myPools = memberships.map((m) =>
    db.select().from(pools).where(eq(pools.id, m.poolId)).get()
  ).filter(Boolean);

  return res.json(myPools);
});

// GET /api/pools/:id — pool detail
poolsRouter.get("/:id", async (req: AuthedRequest, res) => {
  const poolId = parseInt(req.params.id);
  const pool = db.select().from(pools).where(eq(pools.id, poolId)).get();
  if (!pool) return res.status(404).json({ message: "Pool niet gevonden" });

  const member = db
    .select()
    .from(poolMembers)
    .where(and(eq(poolMembers.poolId, poolId), eq(poolMembers.userId, req.userId!)))
    .get();
  if (!member) return res.status(403).json({ message: "Geen toegang tot deze pool" });

  const members = db.select().from(poolMembers).where(eq(poolMembers.poolId, poolId)).all();
  return res.json({ pool, memberCount: members.length });
});

// GET /api/pools/:id/standings — leaderboard
poolsRouter.get("/:id/standings", async (req: AuthedRequest, res) => {
  const poolId = parseInt(req.params.id);

  const member = db
    .select()
    .from(poolMembers)
    .where(and(eq(poolMembers.poolId, poolId), eq(poolMembers.userId, req.userId!)))
    .get();
  if (!member) return res.status(403).json({ message: "Geen toegang" });

  const members = db.select().from(poolMembers).where(eq(poolMembers.poolId, poolId)).all();
  const allRounds = db.select().from(rounds).all();
  const allStats = db.select().from(playerStats).all();
  const allPlayers = db.select().from(players).all();
  const allPredictions = db.select().from(roundPredictions).where(eq(roundPredictions.poolId, poolId)).all();
  const allUsers = db.select().from(users).all();

  const standings = members.map((m) => {
    const team = db
      .select()
      .from(userTeams)
      .where(and(eq(userTeams.userId, m.userId), eq(userTeams.poolId, poolId)))
      .get();

    let points = 0;

    if (team) {
      const teamPlayers = db
        .select()
        .from(userTeamPlayers)
        .where(eq(userTeamPlayers.userTeamId, team.id))
        .all();

      for (const round of allRounds) {
        for (const tp of teamPlayers) {
          const player = allPlayers.find((p) => p.id === tp.playerId);
          const stat = allStats.find(
            (s) => s.playerId === tp.playerId && s.roundId === round.id
          );
          if (player && stat) {
            points += calcPlayerPoints(player, stat);
          }
        }

        // Prediction bonus
        const prediction = allPredictions.find(
          (p) => p.userId === m.userId && p.roundId === round.id
        );
        if (prediction) {
          const roundStats = allStats.filter((s) => s.roundId === round.id);
          const topscorer = roundStats.reduce(
            (best, s) => (s.goals > (best?.goals ?? -1) ? s : best),
            null as typeof allStats[0] | null
          );
          const goalscorers = roundStats
            .filter((s) => s.goals > 0)
            .map((s) => s.playerId);

          points += calcPredictionPoints({
            predictedTopscorerId: prediction.predictedTopscorerId,
            predictedGoalscorerIds: prediction.predictedGoalscorerIds
              ? JSON.parse(prediction.predictedGoalscorerIds)
              : [],
            actualTopscorerId: topscorer?.playerId ?? null,
            actualGoalscorerIds: goalscorers,
          });
        }
      }
    }

    const user = allUsers.find((u) => u.id === m.userId);
    return { userId: m.userId, username: user?.username ?? "Onbekend", points, hasTeam: !!team };
  });

  standings.sort((a, b) => b.points - a.points);
  const ranked = standings.map((s, i) => ({ ...s, rank: i + 1 }));
  return res.json(ranked);
});
