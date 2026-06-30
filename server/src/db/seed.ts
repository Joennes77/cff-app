/**
 * Seed file — ~60 real Eredivisie players across 6 clubs.
 * Run with: npm run db:seed
 * Also exports ensurePlayers() for auto-seed on startup.
 */
import "dotenv/config";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { players } from "../../../shared/schema.js";
import { db } from "./index.js";

const PLAYERS: Array<Omit<typeof players.$inferInsert, "id">> = [
  // === AJAX ===
  { name: "Remko Pasveer", club: "Ajax", position: "GK", price: 6.5 },
  { name: "Jorrel Hato", club: "Ajax", position: "DEF", price: 14.0 },
  { name: "Devyne Rensch", club: "Ajax", position: "DEF", price: 10.0 },
  { name: "Josip Sutalo", club: "Ajax", position: "DEF", price: 9.5 },
  { name: "Owen Wijndal", club: "Ajax", position: "DEF", price: 7.0 },
  { name: "Kenneth Taylor", club: "Ajax", position: "MID", price: 13.0 },
  { name: "Jordan Henderson", club: "Ajax", position: "MID", price: 8.0 },
  { name: "Branco van den Boomen", club: "Ajax", position: "MID", price: 9.0 },
  { name: "Chuba Akpom", club: "Ajax", position: "FWD", price: 16.0 },
  { name: "Bertrand Traoré", club: "Ajax", position: "FWD", price: 7.5 },
  { name: "Carlos Forbs", club: "Ajax", position: "FWD", price: 8.0 },

  // === PSV ===
  { name: "Walter Benítez", club: "PSV", position: "GK", price: 9.0 },
  { name: "Olivier Boscagli", club: "PSV", position: "DEF", price: 11.0 },
  { name: "Jordan Teze", club: "PSV", position: "DEF", price: 10.5 },
  { name: "Armando Obispo", club: "PSV", position: "DEF", price: 9.0 },
  { name: "Fredrik Oppegård", club: "PSV", position: "DEF", price: 6.5 },
  { name: "Joey Veerman", club: "PSV", position: "MID", price: 18.0 },
  { name: "Guus Til", club: "PSV", position: "MID", price: 14.0 },
  { name: "Ismael Saibari", club: "PSV", position: "MID", price: 12.0 },
  { name: "Luuk de Jong", club: "PSV", position: "FWD", price: 22.0 },
  { name: "Ricardo Pepi", club: "PSV", position: "FWD", price: 20.0 },
  { name: "Noa Lang", club: "PSV", position: "FWD", price: 25.0 },

  // === FEYENOORD ===
  { name: "Timon Wellenreuther", club: "Feyenoord", position: "GK", price: 7.0 },
  { name: "David Hancko", club: "Feyenoord", position: "DEF", price: 14.0 },
  { name: "Gernot Trauner", club: "Feyenoord", position: "DEF", price: 10.0 },
  { name: "Hugo Bueno", club: "Feyenoord", position: "DEF", price: 7.5 },
  { name: "Quinten Timber", club: "Feyenoord", position: "MID", price: 16.0 },
  { name: "Ramiz Zerrouki", club: "Feyenoord", position: "MID", price: 9.0 },
  { name: "Luka Ivanusec", club: "Feyenoord", position: "MID", price: 10.0 },
  { name: "Santiago Giménez", club: "Feyenoord", position: "FWD", price: 24.0 },
  { name: "Alireza Jahanbakhsh", club: "Feyenoord", position: "FWD", price: 8.0 },
  { name: "Calvin Stengs", club: "Feyenoord", position: "FWD", price: 11.0 },

  // === AZ ===
  { name: "Hobie Verhulst", club: "AZ", position: "GK", price: 5.5 },
  { name: "Milos Kerkez", club: "AZ", position: "DEF", price: 13.0 },
  { name: "Maximiliano Wouter", club: "AZ", position: "DEF", price: 7.0 },
  { name: "Bruno Martins Indi", club: "AZ", position: "DEF", price: 5.0 },
  { name: "Yukinari Sugawara", club: "AZ", position: "DEF", price: 10.0 },
  { name: "Tijjani Reijnders", club: "AZ", position: "MID", price: 18.0 },
  { name: "Dani de Wit", club: "AZ", position: "MID", price: 10.0 },
  { name: "Sven Mijnans", club: "AZ", position: "MID", price: 8.5 },
  { name: "Vangelis Pavlidis", club: "AZ", position: "FWD", price: 20.0 },
  { name: "Myron van Brederode", club: "AZ", position: "FWD", price: 9.0 },

  // === FC UTRECHT ===
  { name: "Vasilis Barkas", club: "FC Utrecht", position: "GK", price: 5.0 },
  { name: "Souffian El Karouani", club: "FC Utrecht", position: "DEF", price: 6.0 },
  { name: "Ruben Gabrielsen", club: "FC Utrecht", position: "DEF", price: 5.5 },
  { name: "Jens Toornstra", club: "FC Utrecht", position: "MID", price: 7.0 },
  { name: "Sander van de Streek", club: "FC Utrecht", position: "MID", price: 6.5 },
  { name: "Bart Ramselaar", club: "FC Utrecht", position: "MID", price: 7.5 },
  { name: "Adrian Grbić", club: "FC Utrecht", position: "FWD", price: 9.0 },
  { name: "Anastasios Douvikas", club: "FC Utrecht", position: "FWD", price: 10.0 },

  // === FC TWENTE ===
  { name: "Lars Unnerstall", club: "FC Twente", position: "GK", price: 5.5 },
  { name: "Mees Hilgers", club: "FC Twente", position: "DEF", price: 9.0 },
  { name: "Julio Pleguezuelo", club: "FC Twente", position: "DEF", price: 6.0 },
  { name: "Gijs Smal", club: "FC Twente", position: "DEF", price: 5.5 },
  { name: "Sem Steijn", club: "FC Twente", position: "MID", price: 12.0 },
  { name: "Michel Vlap", club: "FC Twente", position: "MID", price: 8.0 },
  { name: "Daan Rots", club: "FC Twente", position: "FWD", price: 9.5 },
  { name: "Virgil Misidjan", club: "FC Twente", position: "FWD", price: 6.5 },
  { name: "Joshua Brenet", club: "FC Twente", position: "DEF", price: 5.0 },
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
