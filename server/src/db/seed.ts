/**
 * Seed file — Eredivisie 2026/27 players, all 18 clubs.
 * Run with: npm run db:seed
 * Also exports ensurePlayers() for auto-seed on startup.
 */
import "dotenv/config";
import { players } from "../../../shared/schema.js";
import { db } from "./index.js";

const PLAYERS: Array<Omit<typeof players.$inferInsert, "id">> = [
  // === AJAX ===
  { name: "Remko Pasveer", club: "Ajax", position: "GK", price: 6.0 },
  { name: "Diant Ramaj", club: "Ajax", position: "GK", price: 5.0 },
  { name: "Jorrel Hato", club: "Ajax", position: "DEF", price: 15.0 },
  { name: "Devyne Rensch", club: "Ajax", position: "DEF", price: 10.0 },
  { name: "Josip Sutalo", club: "Ajax", position: "DEF", price: 9.0 },
  { name: "Owen Wijndal", club: "Ajax", position: "DEF", price: 7.0 },
  { name: "Kenneth Taylor", club: "Ajax", position: "MID", price: 14.0 },
  { name: "Jordan Henderson", club: "Ajax", position: "MID", price: 7.0 },
  { name: "Branco van den Boomen", club: "Ajax", position: "MID", price: 9.0 },
  { name: "Chuba Akpom", club: "Ajax", position: "FWD", price: 14.0 },
  { name: "Wout Weghorst", club: "Ajax", position: "FWD", price: 12.0 },
  { name: "Carlos Forbs", club: "Ajax", position: "FWD", price: 8.0 },

  // === PSV ===
  { name: "Walter Benítez", club: "PSV", position: "GK", price: 9.0 },
  { name: "Joël Drommel", club: "PSV", position: "GK", price: 4.0 },
  { name: "Olivier Boscagli", club: "PSV", position: "DEF", price: 11.0 },
  { name: "Jordan Teze", club: "PSV", position: "DEF", price: 10.0 },
  { name: "Armando Obispo", club: "PSV", position: "DEF", price: 9.0 },
  { name: "Fredrik Oppegård", club: "PSV", position: "DEF", price: 6.0 },
  { name: "Joey Veerman", club: "PSV", position: "MID", price: 19.0 },
  { name: "Guus Til", club: "PSV", position: "MID", price: 14.0 },
  { name: "Ismael Saibari", club: "PSV", position: "MID", price: 13.0 },
  { name: "Luuk de Jong", club: "PSV", position: "FWD", price: 20.0 },
  { name: "Ricardo Pepi", club: "PSV", position: "FWD", price: 18.0 },
  { name: "Noa Lang", club: "PSV", position: "FWD", price: 24.0 },

  // === FEYENOORD ===
  { name: "Timon Wellenreuther", club: "Feyenoord", position: "GK", price: 7.0 },
  { name: "Justin Bijlow", club: "Feyenoord", position: "GK", price: 6.0 },
  { name: "David Hancko", club: "Feyenoord", position: "DEF", price: 14.0 },
  { name: "Gernot Trauner", club: "Feyenoord", position: "DEF", price: 10.0 },
  { name: "Hugo Bueno", club: "Feyenoord", position: "DEF", price: 7.0 },
  { name: "Thomas Beelen", club: "Feyenoord", position: "DEF", price: 6.0 },
  { name: "Quinten Timber", club: "Feyenoord", position: "MID", price: 16.0 },
  { name: "Ramiz Zerrouki", club: "Feyenoord", position: "MID", price: 9.0 },
  { name: "Luka Ivanusec", club: "Feyenoord", position: "MID", price: 10.0 },
  { name: "Santiago Giménez", club: "Feyenoord", position: "FWD", price: 24.0 },
  { name: "Calvin Stengs", club: "Feyenoord", position: "FWD", price: 11.0 },
  { name: "Anis Hadj Moussa", club: "Feyenoord", position: "FWD", price: 8.0 },

  // === AZ ===
  { name: "Hobie Verhulst", club: "AZ", position: "GK", price: 5.5 },
  { name: "Rome-Jayden Owusu-Oduro", club: "AZ", position: "GK", price: 3.5 },
  { name: "Milos Kerkez", club: "AZ", position: "DEF", price: 13.0 },
  { name: "Yukinari Sugawara", club: "AZ", position: "DEF", price: 10.0 },
  { name: "Bruno Martins Indi", club: "AZ", position: "DEF", price: 5.0 },
  { name: "Maximiliano Wouter", club: "AZ", position: "DEF", price: 6.0 },
  { name: "Tijjani Reijnders", club: "AZ", position: "MID", price: 18.0 },
  { name: "Dani de Wit", club: "AZ", position: "MID", price: 10.0 },
  { name: "Sven Mijnans", club: "AZ", position: "MID", price: 8.0 },
  { name: "Vangelis Pavlidis", club: "AZ", position: "FWD", price: 20.0 },
  { name: "Myron van Brederode", club: "AZ", position: "FWD", price: 9.0 },
  { name: "Ibrahim Sadiq", club: "AZ", position: "FWD", price: 8.0 },

  // === FC UTRECHT ===
  { name: "Vasilis Barkas", club: "FC Utrecht", position: "GK", price: 5.0 },
  { name: "Maarten Paes", club: "FC Utrecht", position: "GK", price: 4.5 },
  { name: "Souffian El Karouani", club: "FC Utrecht", position: "DEF", price: 6.0 },
  { name: "Ruben Gabrielsen", club: "FC Utrecht", position: "DEF", price: 5.5 },
  { name: "Nick Viergever", club: "FC Utrecht", position: "DEF", price: 4.5 },
  { name: "Jens Toornstra", club: "FC Utrecht", position: "MID", price: 7.0 },
  { name: "Sander van de Streek", club: "FC Utrecht", position: "MID", price: 6.5 },
  { name: "Bart Ramselaar", club: "FC Utrecht", position: "MID", price: 7.5 },
  { name: "Anastasios Douvikas", club: "FC Utrecht", position: "FWD", price: 10.0 },
  { name: "Adrian Grbić", club: "FC Utrecht", position: "FWD", price: 8.0 },
  { name: "Djevencio van der Kust", club: "FC Utrecht", position: "FWD", price: 6.0 },

  // === FC TWENTE ===
  { name: "Lars Unnerstall", club: "FC Twente", position: "GK", price: 5.5 },
  { name: "Przemysław Tytoń", club: "FC Twente", position: "GK", price: 3.0 },
  { name: "Mees Hilgers", club: "FC Twente", position: "DEF", price: 10.0 },
  { name: "Julio Pleguezuelo", club: "FC Twente", position: "DEF", price: 6.0 },
  { name: "Gijs Smal", club: "FC Twente", position: "DEF", price: 5.5 },
  { name: "Joshua Brenet", club: "FC Twente", position: "DEF", price: 5.0 },
  { name: "Sem Steijn", club: "FC Twente", position: "MID", price: 13.0 },
  { name: "Michel Vlap", club: "FC Twente", position: "MID", price: 8.0 },
  { name: "Youri Regeer", club: "FC Twente", position: "MID", price: 7.0 },
  { name: "Daan Rots", club: "FC Twente", position: "FWD", price: 9.0 },
  { name: "Virgil Misidjan", club: "FC Twente", position: "FWD", price: 6.5 },
  { name: "Ricky van Wolfswinkel", club: "FC Twente", position: "FWD", price: 5.5 },

  // === NEC NIJMEGEN ===
  { name: "Mattijs Branderhorst", club: "NEC Nijmegen", position: "GK", price: 4.5 },
  { name: "Robin Roefs", club: "NEC Nijmegen", position: "GK", price: 3.5 },
  { name: "Bram Nuytinck", club: "NEC Nijmegen", position: "DEF", price: 5.0 },
  { name: "Ivan Márquez", club: "NEC Nijmegen", position: "DEF", price: 5.5 },
  { name: "Bart van Rooij", club: "NEC Nijmegen", position: "DEF", price: 4.5 },
  { name: "Rodrigo Guth", club: "NEC Nijmegen", position: "DEF", price: 4.0 },
  { name: "Mathias Kjølø", club: "NEC Nijmegen", position: "MID", price: 6.0 },
  { name: "Koki Ogawa", club: "NEC Nijmegen", position: "MID", price: 7.0 },
  { name: "Landry Dimata", club: "NEC Nijmegen", position: "FWD", price: 7.5 },
  { name: "Sontje Hansen", club: "NEC Nijmegen", position: "FWD", price: 7.0 },
  { name: "Brian Plat", club: "NEC Nijmegen", position: "FWD", price: 5.0 },

  // === SPARTA ROTTERDAM ===
  { name: "Nick Olij", club: "Sparta Rotterdam", position: "GK", price: 5.0 },
  { name: "Ariel Harush", club: "Sparta Rotterdam", position: "GK", price: 3.5 },
  { name: "Adil Auassar", club: "Sparta Rotterdam", position: "DEF", price: 5.0 },
  { name: "Shurandy Sambo", club: "Sparta Rotterdam", position: "DEF", price: 5.5 },
  { name: "Dirk Abels", club: "Sparta Rotterdam", position: "DEF", price: 4.5 },
  { name: "Tobias Lauritsen", club: "Sparta Rotterdam", position: "FWD", price: 8.0 },
  { name: "Anass Salah-Eddine", club: "Sparta Rotterdam", position: "MID", price: 7.0 },
  { name: "Mats Wieffer", club: "Sparta Rotterdam", position: "MID", price: 9.0 },
  { name: "Patrick Smit", club: "Sparta Rotterdam", position: "MID", price: 5.0 },
  { name: "Manuel Benson", club: "Sparta Rotterdam", position: "FWD", price: 7.5 },
  { name: "Mohamed Nassoh", club: "Sparta Rotterdam", position: "FWD", price: 5.5 },

  // === GO AHEAD EAGLES ===
  { name: "Jay Gorter", club: "Go Ahead Eagles", position: "GK", price: 4.5 },
  { name: "Thijs Jansen", club: "Go Ahead Eagles", position: "GK", price: 3.0 },
  { name: "Bas Kuipers", club: "Go Ahead Eagles", position: "DEF", price: 5.0 },
  { name: "Joris Kramer", club: "Go Ahead Eagles", position: "DEF", price: 5.0 },
  { name: "Mats Deijl", club: "Go Ahead Eagles", position: "DEF", price: 4.0 },
  { name: "Philippe Rommens", club: "Go Ahead Eagles", position: "MID", price: 6.0 },
  { name: "Finn Stokkers", club: "Go Ahead Eagles", position: "MID", price: 5.5 },
  { name: "Oliver Antman", club: "Go Ahead Eagles", position: "MID", price: 5.0 },
  { name: "Enric Llansana", club: "Go Ahead Eagles", position: "FWD", price: 7.0 },
  { name: "Mats Kohlert", club: "Go Ahead Eagles", position: "FWD", price: 6.5 },
  { name: "Lois Openda", club: "Go Ahead Eagles", position: "FWD", price: 7.5 },

  // === PEC ZWOLLE ===
  { name: "Xavier Mous", club: "PEC Zwolle", position: "GK", price: 4.0 },
  { name: "Jasper Schendelaar", club: "PEC Zwolle", position: "GK", price: 3.0 },
  { name: "Bram van Polen", club: "PEC Zwolle", position: "DEF", price: 4.5 },
  { name: "Thomas Lam", club: "PEC Zwolle", position: "DEF", price: 4.5 },
  { name: "Melayro Bogarde", club: "PEC Zwolle", position: "DEF", price: 5.0 },
  { name: "Dean Huiberts", club: "PEC Zwolle", position: "MID", price: 5.5 },
  { name: "Daishawn Redan", club: "PEC Zwolle", position: "MID", price: 5.0 },
  { name: "Clint Leemans", club: "PEC Zwolle", position: "MID", price: 5.0 },
  { name: "Mustafa Saymak", club: "PEC Zwolle", position: "FWD", price: 6.0 },
  { name: "Bram Nuytinck", club: "PEC Zwolle", position: "FWD", price: 5.5 },
  { name: "Sai van Wermeskerken", club: "PEC Zwolle", position: "FWD", price: 5.0 },

  // === FC GRONINGEN ===
  { name: "Michael Verrips", club: "FC Groningen", position: "GK", price: 4.0 },
  { name: "Sergio Padt", club: "FC Groningen", position: "GK", price: 3.5 },
  { name: "Ko Itakura", club: "FC Groningen", position: "DEF", price: 6.0 },
  { name: "Bart Vriends", club: "FC Groningen", position: "DEF", price: 4.5 },
  { name: "Wessel Dammers", club: "FC Groningen", position: "DEF", price: 4.0 },
  { name: "Tijs Velthuis", club: "FC Groningen", position: "DEF", price: 4.0 },
  { name: "Laros Duarte", club: "FC Groningen", position: "MID", price: 6.0 },
  { name: "Ramon Pascal Lundqvist", club: "FC Groningen", position: "MID", price: 5.5 },
  { name: "Jørgen Strand Larsen", club: "FC Groningen", position: "FWD", price: 9.0 },
  { name: "Cyril Ngonge", club: "FC Groningen", position: "FWD", price: 7.5 },
  { name: "Thijs Oosting", club: "FC Groningen", position: "FWD", price: 5.0 },

  // === HERACLES ALMELO ===
  { name: "Janis Blaswich", club: "Heracles Almelo", position: "GK", price: 4.0 },
  { name: "Stef de Vrij", club: "Heracles Almelo", position: "GK", price: 3.0 },
  { name: "Lasse Wehmeyer", club: "Heracles Almelo", position: "DEF", price: 4.5 },
  { name: "Tim Siekman", club: "Heracles Almelo", position: "DEF", price: 4.0 },
  { name: "Kenzo Goudmijn", club: "Heracles Almelo", position: "DEF", price: 4.0 },
  { name: "Nikolai Laursen", club: "Heracles Almelo", position: "MID", price: 5.5 },
  { name: "Sinan Bakis", club: "Heracles Almelo", position: "MID", price: 5.0 },
  { name: "Tomas Kalinauskas", club: "Heracles Almelo", position: "MID", price: 5.0 },
  { name: "Isac Lidberg", club: "Heracles Almelo", position: "FWD", price: 7.0 },
  { name: "Anas Tahiri", club: "Heracles Almelo", position: "FWD", price: 6.0 },
  { name: "Mohamed Ihattaren", club: "Heracles Almelo", position: "FWD", price: 6.5 },

  // === RKC WAALWIJK ===
  { name: "Etienne Vaessen", club: "RKC Waalwijk", position: "GK", price: 4.0 },
  { name: "Yanick van Osch", club: "RKC Waalwijk", position: "GK", price: 3.0 },
  { name: "Yassin Oukili", club: "RKC Waalwijk", position: "DEF", price: 4.5 },
  { name: "Dario van den Buijs", club: "RKC Waalwijk", position: "DEF", price: 4.5 },
  { name: "Jurien Gaari", club: "RKC Waalwijk", position: "DEF", price: 4.0 },
  { name: "Michiel Kramer", club: "RKC Waalwijk", position: "MID", price: 5.0 },
  { name: "Iliass Bel Hassani", club: "RKC Waalwijk", position: "MID", price: 5.5 },
  { name: "Finn Stokkers", club: "RKC Waalwijk", position: "MID", price: 5.0 },
  { name: "Cyron Stabije", club: "RKC Waalwijk", position: "FWD", price: 6.0 },
  { name: "Zakaria Eddahchouri", club: "RKC Waalwijk", position: "FWD", price: 6.5 },
  { name: "Oskar Zawada", club: "RKC Waalwijk", position: "FWD", price: 6.0 },

  // === NAC BREDA ===
  { name: "Nick Olij", club: "NAC Breda", position: "GK", price: 4.5 },
  { name: "Roy Kortsmit", club: "NAC Breda", position: "GK", price: 3.5 },
  { name: "Jan van den Berg", club: "NAC Breda", position: "DEF", price: 5.5 },
  { name: "Boy Kemper", club: "NAC Breda", position: "DEF", price: 5.0 },
  { name: "Leo Østigård", club: "NAC Breda", position: "DEF", price: 5.5 },
  { name: "Leo Sauer", club: "NAC Breda", position: "MID", price: 6.0 },
  { name: "Sydney van Hooijdonk", club: "NAC Breda", position: "MID", price: 7.0 },
  { name: "Niek Vossebelt", club: "NAC Breda", position: "MID", price: 5.0 },
  { name: "Mihailo Ristic", club: "NAC Breda", position: "FWD", price: 6.0 },
  { name: "Kaj Sierhuis", club: "NAC Breda", position: "FWD", price: 7.5 },
  { name: "Sven Mijnans", club: "NAC Breda", position: "FWD", price: 6.0 },

  // === SC HEERENVEEN ===
  { name: "Andries Noppert", club: "SC Heerenveen", position: "GK", price: 5.0 },
  { name: "Mickey van der Hart", club: "SC Heerenveen", position: "GK", price: 3.5 },
  { name: "Fabian Serrarens", club: "SC Heerenveen", position: "DEF", price: 5.0 },
  { name: "Pawel Bochniewicz", club: "SC Heerenveen", position: "DEF", price: 5.0 },
  { name: "Milan van Ewijk", club: "SC Heerenveen", position: "DEF", price: 6.0 },
  { name: "Joey Veerman", club: "SC Heerenveen", position: "MID", price: 8.0 },
  { name: "Lasse Schöne", club: "SC Heerenveen", position: "MID", price: 5.0 },
  { name: "Amin Sarr", club: "SC Heerenveen", position: "FWD", price: 7.0 },
  { name: "Henk Veerman", club: "SC Heerenveen", position: "FWD", price: 7.5 },
  { name: "Rami Kaib", club: "SC Heerenveen", position: "FWD", price: 5.5 },
  { name: "Mats Seuntjens", club: "SC Heerenveen", position: "MID", price: 5.5 },

  // === WILLEM II ===
  { name: "Aro Muric", club: "Willem II", position: "GK", price: 5.0 },
  { name: "Robbin Ruiter", club: "Willem II", position: "GK", price: 3.5 },
  { name: "Freek Heerkens", club: "Willem II", position: "DEF", price: 4.5 },
  { name: "Derrick Köhn", club: "Willem II", position: "DEF", price: 5.5 },
  { name: "Stef Peeters", club: "Willem II", position: "DEF", price: 4.0 },
  { name: "Jordi Tibe", club: "Willem II", position: "MID", price: 6.0 },
  { name: "Pol García", club: "Willem II", position: "MID", price: 5.5 },
  { name: "Ché Nunnely", club: "Willem II", position: "MID", price: 5.5 },
  { name: "Kwasi Wriedt", club: "Willem II", position: "FWD", price: 7.0 },
  { name: "Halil Dervisoglu", club: "Willem II", position: "FWD", price: 7.5 },
  { name: "Marios Vrousai", club: "Willem II", position: "FWD", price: 6.5 },

  // === ALMERE CITY ===
  { name: "Nordin Bakker", club: "Almere City", position: "GK", price: 3.5 },
  { name: "Jari van der Griendt", club: "Almere City", position: "GK", price: 3.0 },
  { name: "Jeredy Hilterman", club: "Almere City", position: "DEF", price: 4.5 },
  { name: "Thomas Verheydt", club: "Almere City", position: "DEF", price: 4.0 },
  { name: "Gino Coutinho", club: "Almere City", position: "DEF", price: 4.5 },
  { name: "Carel Eiting", club: "Almere City", position: "MID", price: 6.5 },
  { name: "Arsenio Valpoort", club: "Almere City", position: "MID", price: 5.5 },
  { name: "Jizz Hornkamp", club: "Almere City", position: "FWD", price: 7.0 },
  { name: "Leandro Bacuna", club: "Almere City", position: "MID", price: 5.0 },
  { name: "Sylla Sow", club: "Almere City", position: "FWD", price: 6.0 },
  { name: "Elayis Tavsan", club: "Almere City", position: "FWD", price: 5.5 },

  // === FORTUNA SITTARD ===
  { name: "Yanick van Osch", club: "Fortuna Sittard", position: "GK", price: 3.5 },
  { name: "Alexei Koselev", club: "Fortuna Sittard", position: "GK", price: 3.0 },
  { name: "Zian Flemming", club: "Fortuna Sittard", position: "MID", price: 8.0 },
  { name: "Lisandro Semedo", club: "Fortuna Sittard", position: "DEF", price: 5.0 },
  { name: "Stef Peeters", club: "Fortuna Sittard", position: "DEF", price: 4.5 },
  { name: "Ivo Pinto", club: "Fortuna Sittard", position: "DEF", price: 4.0 },
  { name: "Dario Čanađija", club: "Fortuna Sittard", position: "MID", price: 5.0 },
  { name: "Tesfaldet Tekie", club: "Fortuna Sittard", position: "MID", price: 5.5 },
  { name: "Luca Plogmann", club: "Fortuna Sittard", position: "FWD", price: 5.0 },
  { name: "Burak Yilmaz", club: "Fortuna Sittard", position: "FWD", price: 7.0 },
  { name: "Rodrigo Guth", club: "Fortuna Sittard", position: "FWD", price: 5.5 },
];

/** Auto-seed players on startup if the table is empty. */
export async function ensurePlayers() {
  const existing = db.select().from(players).all();
  if (existing.length === 0) {
    await db.insert(players).values(PLAYERS);
    console.log(`Auto-seeded ${PLAYERS.length} players.`);
  }
}

// Allow running directly: npm run db:seed
if (process.argv[1]?.includes("seed")) {
  (async () => {
    console.log("Seeding players...");
    await db.delete(players);
    await db.insert(players).values(PLAYERS);
    console.log(`Inserted ${PLAYERS.length} players.`);
  })().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
}
