import { SCORING } from "./schema.js";
import type { PlayerStat, Player } from "./schema.js";

/**
 * Calculate points for a single player in a round based on their stats.
 */
export function calcPlayerPoints(
  player: Pick<Player, "position">,
  stats: Pick<PlayerStat, "goals" | "minutesPlayed" | "cleanSheet" | "teamResult">
): number {
  let pts = 0;

  // Match played
  if (stats.minutesPlayed > 0) pts += SCORING.MATCH_PLAYED;

  // Goals
  pts += stats.goals * SCORING.GOAL;

  // Clean sheet (only GK and DEF)
  if (stats.cleanSheet && (player.position === "GK" || player.position === "DEF")) {
    pts += SCORING.CLEAN_SHEET;
  }

  // Team result
  if (stats.teamResult === "W") pts += SCORING.WIN;
  else if (stats.teamResult === "D") pts += SCORING.DRAW;

  return pts;
}

/**
 * Calculate prediction bonus points for a round.
 */
export function calcPredictionPoints(opts: {
  predictedTopscorerId: number | null | undefined;
  predictedGoalscorerIds: number[];
  actualTopscorerId: number | null | undefined;
  actualGoalscorerIds: number[];
}): number {
  let pts = 0;

  // Topscorer bonus
  if (
    opts.predictedTopscorerId &&
    opts.actualTopscorerId &&
    opts.predictedTopscorerId === opts.actualTopscorerId
  ) {
    pts += SCORING.TOPSCORER_BONUS;
  }

  // Per goalscorer
  if (opts.predictedGoalscorerIds.length && opts.actualGoalscorerIds.length) {
    for (const id of opts.predictedGoalscorerIds) {
      if (opts.actualGoalscorerIds.includes(id)) {
        pts += SCORING.GOALSCORER_BONUS;
      }
    }
  }

  return pts;
}
