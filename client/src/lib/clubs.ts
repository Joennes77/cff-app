const FP = "https://en.wikipedia.org/wiki/Special:FilePath";

/** Club logo URLs via Wikipedia Special:FilePath (browser follows redirect automatically) */
export const CLUB_LOGOS: Record<string, string> = {
  "Ajax":             `${FP}/Ajax_Amsterdam.svg`,
  "PSV":              `${FP}/PSV_Eindhoven.svg`,
  "Feyenoord":        `${FP}/Feyenoord_logo_since_2024.svg`,
  "AZ":               `${FP}/AZ_Alkmaar.svg`,
  "FC Utrecht":       `${FP}/FC_Utrecht.svg`,
  "FC Twente":        `${FP}/FC_Twente.svg`,
  "NEC Nijmegen":     `${FP}/NEC_Nijmegen_logo.svg`,
  "Sparta Rotterdam": `${FP}/Sparta_Rotterdam_logo.svg`,
  "Go Ahead Eagles":  `${FP}/Go_Ahead_Eagles_logo.svg`,
  "PEC Zwolle":       `${FP}/PEC_Zwolle_logo.svg`,
  "FC Groningen":     `${FP}/FC_Groningen_logo.svg`,
  "Excelsior":        `${FP}/SBV_Excelsior.svg`,
  "Fortuna Sittard":  `${FP}/Fortuna_Sittard_Logo.svg`,
  "SC Cambuur":       `${FP}/SC_Cambuur_logo.svg`,
  "SC Heerenveen":    `${FP}/SC_Heerenveen_logo.svg`,
  "SC Telstar":       `${FP}/SC_Telstar_logo.svg`,
  "Willem II":        `${FP}/Willem_II_logo.svg`,
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
