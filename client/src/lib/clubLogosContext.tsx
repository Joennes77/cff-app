import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// How our seed club names map to TheSportsDB team names
const TDB_MAP: Record<string, string> = {
  "Ajax":             "AFC Ajax",
  "PSV":              "PSV Eindhoven",
  "Feyenoord":        "Feyenoord",
  "AZ":               "AZ Alkmaar",
  "FC Utrecht":       "FC Utrecht",
  "FC Twente":        "FC Twente",
  "NEC Nijmegen":     "NEC Nijmegen",
  "Sparta Rotterdam": "Sparta Rotterdam",
  "Go Ahead Eagles":  "Go Ahead Eagles",
  "PEC Zwolle":       "PEC Zwolle",
  "FC Groningen":     "FC Groningen",
  "Excelsior":        "Excelsior Rotterdam",
  "Fortuna Sittard":  "Fortuna Sittard",
  "SC Cambuur":       "SC Cambuur",
  "SC Heerenveen":    "sc Heerenveen",
  "SC Telstar":       "Telstar",
  "Willem II":        "Willem II",
  "ADO Den Haag":     "ADO Den Haag",
};

type LogoMap = Record<string, string>;

const ClubLogosContext = createContext<LogoMap>({});

async function fetchLogos(): Promise<LogoMap> {
  const logos: LogoMap = {};
  try {
    const res = await fetch(
      "https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=Dutch+Eredivisie",
      { cache: "force-cache" }
    );
    const json = await res.json();
    const byTDB: Record<string, string> = {};
    for (const t of json.teams ?? []) {
      if (t.strTeamBadge) byTDB[t.strTeam] = t.strTeamBadge;
    }
    for (const [ourName, tdbName] of Object.entries(TDB_MAP)) {
      if (byTDB[tdbName]) logos[ourName] = byTDB[tdbName];
    }

    // For any club not found in the league search, try individual lookup
    const missing = Object.entries(TDB_MAP).filter(([ourName]) => !logos[ourName]);
    await Promise.allSettled(
      missing.map(async ([ourName, tdbName]) => {
        try {
          const r = await fetch(
            `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(tdbName)}`
          );
          const j = await r.json();
          const team = j.teams?.[0];
          if (team?.strTeamBadge) logos[ourName] = team.strTeamBadge;
        } catch {
          // ignore
        }
      })
    );
  } catch {
    // API unavailable — components will show initials fallback
  }
  return logos;
}

export function ClubLogosProvider({ children }: { children: ReactNode }) {
  const [logos, setLogos] = useState<LogoMap>({});

  useEffect(() => {
    fetchLogos().then(setLogos);
  }, []);

  return (
    <ClubLogosContext.Provider value={logos}>
      {children}
    </ClubLogosContext.Provider>
  );
}

export function useClubLogos(): LogoMap {
  return useContext(ClubLogosContext);
}
