import { Router } from "express";

const router = Router();

// TheSportsDB team name → our seed name mapping
const TDB_TO_OUR: Record<string, string> = {
  "AFC Ajax":            "Ajax",
  "PSV Eindhoven":       "PSV",
  "Feyenoord":           "Feyenoord",
  "AZ Alkmaar":          "AZ",
  "FC Utrecht":          "FC Utrecht",
  "FC Twente":           "FC Twente",
  "NEC Nijmegen":        "NEC Nijmegen",
  "Sparta Rotterdam":    "Sparta Rotterdam",
  "Go Ahead Eagles":     "Go Ahead Eagles",
  "PEC Zwolle":          "PEC Zwolle",
  "FC Groningen":        "FC Groningen",
  "Excelsior Rotterdam": "Excelsior",
  "SBV Excelsior":       "Excelsior",
  "Fortuna Sittard":     "Fortuna Sittard",
  "SC Cambuur":          "SC Cambuur",
  "sc Heerenveen":       "SC Heerenveen",
  "SC Heerenveen":       "SC Heerenveen",
  "Telstar":             "SC Telstar",
  "SC Telstar":          "SC Telstar",
  "Willem II":           "Willem II",
  "ADO Den Haag":        "ADO Den Haag",
};

// Individual search names for clubs likely missing from league endpoint
const EXTRA_SEARCHES: [string, string][] = [
  ["ADO Den Haag",   "ADO Den Haag"],
  ["SC Telstar",     "Telstar"],
  ["SC Cambuur",     "SC Cambuur"],
  ["Fortuna Sittard","Fortuna Sittard"],
  ["Excelsior",      "Excelsior Rotterdam"],
  ["Go Ahead Eagles","Go Ahead Eagles"],
  ["PEC Zwolle",     "PEC Zwolle"],
  ["FC Groningen",   "FC Groningen"],
];

let cachedLogos: Record<string, string> | null = null;
let fetchedAt = 0;
const TTL = 24 * 60 * 60 * 1000; // 24h

async function buildLogos(): Promise<Record<string, string>> {
  const logos: Record<string, string> = {};

  // 1. League-wide lookup
  try {
    const res = await fetch(
      "https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=Dutch+Eredivisie"
    );
    const json: any = await res.json();
    for (const t of json.teams ?? []) {
      const our = TDB_TO_OUR[t.strTeam];
      if (our && t.strTeamBadge) logos[our] = t.strTeamBadge;
    }
  } catch (_) { /* ignore */ }

  // 2. Individual searches for any still missing
  const missing = EXTRA_SEARCHES.filter(([ourName]) => !logos[ourName]);
  await Promise.allSettled(
    missing.map(async ([ourName, searchName]) => {
      try {
        const r = await fetch(
          `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(searchName)}`
        );
        const j: any = await r.json();
        const team = j.teams?.[0];
        if (team?.strTeamBadge) logos[ourName] = team.strTeamBadge;
      } catch (_) { /* ignore */ }
    })
  );

  return logos;
}

router.get("/", async (_req, res) => {
  if (cachedLogos && Date.now() - fetchedAt < TTL) {
    return res.json(cachedLogos);
  }
  cachedLogos = await buildLogos();
  fetchedAt = Date.now();
  res.json(cachedLogos);
});

export default router;
