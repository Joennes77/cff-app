/** Club logo URLs (Wikipedia/Wikimedia SVG) and short display names */
export const CLUB_LOGOS: Record<string, string> = {
  "Ajax":             "https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg",
  "PSV":              "https://upload.wikimedia.org/wikipedia/en/0/05/PSV_Eindhoven.svg",
  "Feyenoord":        "https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Feyenoord.svg",
  "AZ":               "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/AZ_Alkmaar_logo_%282023%E2%80%93present%29.svg/240px-AZ_Alkmaar_logo_%282023%E2%80%93present%29.svg.png",
  "FC Utrecht":       "https://upload.wikimedia.org/wikipedia/en/5/5a/FC_Utrecht.svg",
  "FC Twente":        "https://upload.wikimedia.org/wikipedia/en/0/03/FC_Twente.svg",
  "NEC Nijmegen":     "https://upload.wikimedia.org/wikipedia/en/f/fe/NEC_Nijmegen.svg",
  "Sparta Rotterdam": "https://upload.wikimedia.org/wikipedia/en/5/56/Sparta_Rotterdam.svg",
  "Go Ahead Eagles":  "https://upload.wikimedia.org/wikipedia/en/7/7d/Go_Ahead_Eagles.svg",
  "PEC Zwolle":       "https://upload.wikimedia.org/wikipedia/en/5/54/PEC_Zwolle.svg",
  "FC Groningen":     "https://upload.wikimedia.org/wikipedia/commons/f/f8/FC_Groningen_logo.svg",
  "Excelsior":        "https://upload.wikimedia.org/wikipedia/en/4/43/SBV_Excelsior.svg",
  "Fortuna Sittard":  "https://upload.wikimedia.org/wikipedia/en/a/a1/Fortuna_Sittard.svg",
  "SC Cambuur":       "https://upload.wikimedia.org/wikipedia/en/9/94/Cambuur.svg",
  "SC Heerenveen":    "https://upload.wikimedia.org/wikipedia/en/b/ba/SC_Heerenveen.svg",
  "SC Telstar":       "https://upload.wikimedia.org/wikipedia/en/9/93/Telstar_FC.svg",
  "Willem II":        "https://upload.wikimedia.org/wikipedia/en/b/b7/Willem_II_Tilburg.svg",
  "ADO Den Haag":     "https://upload.wikimedia.org/wikipedia/en/7/73/ADO_Den_Haag_logo.svg",
};

export function getClubLogo(club: string): string | undefined {
  return CLUB_LOGOS[club];
}

/** 2-letter abbreviation fallback */
export function clubAbbr(club: string): string {
  const words = club.replace(/^(FC|SC|sc|SBV|ADO)\s+/i, "").split(" ");
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
