import { Router } from "express";

const router = Router();

// Our club name → search term for TheSportsDB
const CLUBS: [string, string][] = [
  ["Ajax",             "Ajax"],
  ["PSV",              "PSV Eindhoven"],
  ["Feyenoord",        "Feyenoord"],
  ["AZ",               "AZ Alkmaar"],
  ["FC Utrecht",       "FC Utrecht"],
  ["FC Twente",        "FC Twente"],
  ["NEC Nijmegen",     "NEC Nijmegen"],
  ["Sparta Rotterdam", "Sparta Rotterdam"],
  ["Go Ahead Eagles",  "Go Ahead Eagles"],
  ["PEC Zwolle",       "PEC Zwolle"],
  ["FC Groningen",     "FC Groningen"],
  ["Excelsior",        "Excelsior Rotterdam"],
  ["Fortuna Sittard",  "Fortuna Sittard"],
  ["SC Cambuur",       "Cambuur"],
  ["SC Heerenveen",    "Heerenveen"],
  ["SC Telstar",       "Telstar"],
  ["Willem II",        "Willem II"],
  ["ADO Den Haag",     "ADO Den Haag"],
];

let cachedLogos: Record<string, string> | null = null;
let fetchedAt = 0;
const TTL = 12 * 60 * 60 * 1000;

async function buildLogos(): Promise<Record<string, string>> {
  const logos: Record<string, string> = {};
  await Promise.allSettled(
    CLUBS.map(async ([ourName, searchTerm]) => {
      try {
        const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(searchTerm)}`;
        const res = await fetch(url);
        const json: any = await res.json();
        const badge = json.teams?.[0]?.strTeamBadge;
        if (badge) logos[ourName] = badge;
      } catch (_) { /* ignore */ }
    })
  );
  console.log(`[logos] fetched ${Object.keys(logos).length}/${CLUBS.length} club logos`);
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
