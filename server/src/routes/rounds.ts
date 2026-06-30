import { Router } from "express";
import { db } from "../db/index.js";
import {
  rounds,
  roundPredictions,
  poolMembers,
  predictionSchema,
} from "../../../shared/schema.js";
import { eq, and } from "drizzle-orm";
import type { AuthedRequest } from "../types.js";

export const roundsRouter = Router();

// GET /api/rounds/active
roundsRouter.get("/active", (_req, res) => {
  const round = db.select().from(rounds).where(eq(rounds.isActive, 1)).get();
  return res.json(round ?? null);
});

// GET /api/rounds
roundsRouter.get("/", (_req, res) => {
  const all = db.select().from(rounds).all();
  return res.json(all);
});

// POST /api/rounds/:id/predictions — save prediction for a round
roundsRouter.post("/:id/predictions", async (req: AuthedRequest, res) => {
  const roundId = parseInt(req.params.id);
  const { poolId } = req.body as { poolId?: number };

  if (!poolId) return res.status(400).json({ message: "poolId is verplicht" });

  const member = db
    .select()
    .from(poolMembers)
    .where(and(eq(poolMembers.poolId, poolId), eq(poolMembers.userId, req.userId!)))
    .get();
  if (!member) return res.status(403).json({ message: "Geen toegang" });

  const round = db.select().from(rounds).where(eq(rounds.id, roundId)).get();
  if (!round) return res.status(404).json({ message: "Speelronde niet gevonden" });

  const parsed = predictionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

  const existing = db
    .select()
    .from(roundPredictions)
    .where(
      and(
        eq(roundPredictions.userId, req.userId!),
        eq(roundPredictions.poolId, poolId),
        eq(roundPredictions.roundId, roundId)
      )
    )
    .get();

  const values = {
    userId: req.userId!,
    poolId,
    roundId,
    predictedTopscorerId: parsed.data.predictedTopscorerId ?? null,
    predictedGoalscorerIds: parsed.data.predictedGoalscorerIds
      ? JSON.stringify(parsed.data.predictedGoalscorerIds)
      : null,
  };

  if (existing) {
    await db.update(roundPredictions).set(values).where(eq(roundPredictions.id, existing.id));
  } else {
    await db.insert(roundPredictions).values(values);
  }

  return res.json({ ok: true });
});

// GET /api/rounds/:id/predictions/:poolId — get my prediction
roundsRouter.get("/:id/predictions/:poolId", async (req: AuthedRequest, res) => {
  const roundId = parseInt(req.params.id);
  const poolId = parseInt(req.params.poolId);

  const prediction = db
    .select()
    .from(roundPredictions)
    .where(
      and(
        eq(roundPredictions.userId, req.userId!),
        eq(roundPredictions.poolId, poolId),
        eq(roundPredictions.roundId, roundId)
      )
    )
    .get();

  return res.json(prediction ?? null);
});
