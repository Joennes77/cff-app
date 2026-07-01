const FP = "https://en.wikipedia.org/wiki/Special:FilePath";

/** Club logo URLs via Wikipedia Special:FilePath (no hash needed, browser follows redirect) */
export const CLUB_LOGOS: Record<string, string> = {
  "Ajax":             `${FP}/Ajax_Amsterdam.svg`,
  "PSV":              `${FP}/PSV_Eindhoven.svg`,
  "Feyenoord":        `${FP}/Feyenoord_Rotterdam_logo.svg`,
  "AZ":               `${FP}/AZ_Alkmaar.svg`,
  "FC Utrecht":       `${FP}/FC_Utrecht.svg`,
  "FC Twente":        `${FP}/FC_Twente.svg`,
  "NEC Nijmegen":     `${FP}/NEC_Nijmegen.svg`,
  "Sparta Rotterdam": `${FP}/Sparta_Rotterdam.svg`,
  "Go Ahead Eagles":  `${FP}/Go_Ahead_Eagles.svg`,
  "PEC Zwolle":       `${FP}/PEC_Zwolle.svg`,
  "FC Groningen":     `${FP}/FC_Groningen_logo.svg`,
  "Excelsior":        `${FP}/SBV_Excelsior.svg`,
  "Fortuna Sittard":  `${FP}/Fortuna_Sittard.svg`,
  "SC Cambuur":       `${FP}/Cambuur.svg`,
  "SC Heerenveen":    `${FP}/SC_Heerenveen.svg`,
  "SC Telstar":       `${FP}/Telstar_FC.svg`,
  "Willem II":        `${FP}/Willem_II_Tilburg.svg`,
  "ADO Den Haag":     `${FP}/ADO_Den_Haag_logo.svg`,
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
