import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* ----------------------------------------------------------------
 * Scoring constants
 * ---------------------------------------------------------------- */
export const SCORING = {
  GOAL: 2,
  MATCH_PLAYED: 1,
  CLEAN_SHEET: 2, // only GK + DEF
  WIN: 3,
  DRAW: 1,
  LOSS: 0,
  TOPSCORER_BONUS: 5, // correct topscorer prediction for round
  GOALSCORER_BONUS: 2, // per correct goalscorer prediction
} as const;

/* ----------------------------------------------------------------
 * Users
 * ---------------------------------------------------------------- */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(), // email used as username
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: integer("is_admin").notNull().default(0),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  passwordHash: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, "passwordHash">;

/* ----------------------------------------------------------------
 * Pools (poules)
 * ---------------------------------------------------------------- */
export const pools = sqliteTable("pools", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  accessCode: text("access_code").notNull().unique(),
  ownerId: integer("owner_id").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertPoolSchema = createInsertSchema(pools).pick({
  name: true,
});

export type InsertPool = z.infer<typeof insertPoolSchema>;
export type Pool = typeof pools.$inferSelect;

/* ----------------------------------------------------------------
 * Pool members
 * ---------------------------------------------------------------- */
export const poolMembers = sqliteTable("pool_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  poolId: integer("pool_id").notNull(),
  userId: integer("user_id").notNull(),
  joinedAt: text("joined_at").notNull().default(new Date().toISOString()),
});

export type PoolMember = typeof poolMembers.$inferSelect;

/* ----------------------------------------------------------------
 * Players
 * ---------------------------------------------------------------- */
export const players = sqliteTable("players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  club: text("club").notNull(),
  position: text("position").notNull(), // GK | DEF | MID | FWD
  price: real("price").notNull(), // in millions of euros
  imageUrl: text("image_url"),
});

export type Player = typeof players.$inferSelect;

/* ----------------------------------------------------------------
 * User teams
 * ---------------------------------------------------------------- */
export const userTeams = sqliteTable("user_teams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  poolId: integer("pool_id").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export type UserTeam = typeof userTeams.$inferSelect;

/* ----------------------------------------------------------------
 * User team players (11 starters + 5 subs)
 * ---------------------------------------------------------------- */
export const userTeamPlayers = sqliteTable("user_team_players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userTeamId: integer("user_team_id").notNull(),
  playerId: integer("player_id").notNull(),
  isStarter: integer("is_starter").notNull().default(1), // 1 = starter, 0 = sub
});

export type UserTeamPlayer = typeof userTeamPlayers.$inferSelect;

/* ----------------------------------------------------------------
 * Rounds (speelronden)
 * ---------------------------------------------------------------- */
export const rounds = sqliteTable("rounds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roundNumber: integer("round_number").notNull().unique(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  isActive: integer("is_active").notNull().default(0),
});

export type Round = typeof rounds.$inferSelect;

/* ----------------------------------------------------------------
 * Player stats per round
 * ---------------------------------------------------------------- */
export const playerStats = sqliteTable("player_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  playerId: integer("player_id").notNull(),
  roundId: integer("round_id").notNull(),
  goals: integer("goals").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  cleanSheet: integer("clean_sheet").notNull().default(0), // 1 or 0
  minutesPlayed: integer("minutes_played").notNull().default(0),
  teamResult: text("team_result").notNull().default("L"), // W | D | L
});

export type PlayerStat = typeof playerStats.$inferSelect;

/* ----------------------------------------------------------------
 * Round predictions
 * ---------------------------------------------------------------- */
export const roundPredictions = sqliteTable("round_predictions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  poolId: integer("pool_id").notNull(),
  roundId: integer("round_id").notNull(),
  predictedTopscorerId: integer("predicted_topscorer_id"), // player id
  predictedGoalscorerIds: text("predicted_goalscorer_ids"), // JSON array of player ids
});

export type RoundPrediction = typeof roundPredictions.$inferSelect;

/* ----------------------------------------------------------------
 * Transfers
 * ---------------------------------------------------------------- */
export const transfers = sqliteTable("transfers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  poolId: integer("pool_id").notNull(),
  transferWindowNumber: integer("transfer_window_number").notNull(), // 1 | 2 | 3
  playerOutId: integer("player_out_id").notNull(),
  playerInId: integer("player_in_id").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export type Transfer = typeof transfers.$inferSelect;

/* ----------------------------------------------------------------
 * Auth schemas (Zod)
 * ---------------------------------------------------------------- */
export const registerSchema = z.object({
  username: z.string().min(2, "Gebruikersnaam is te kort").max(40),
  email: z.string().email("Voer een geldig e-mailadres in"),
  password: z.string().min(6, "Minimaal 6 tekens"),
});

export const loginSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in"),
  password: z.string().min(1, "Voer je wachtwoord in"),
});

export const joinPoolSchema = z.object({
  accessCode: z.string().min(4, "Voer een geldige toegangscode in"),
});

export const createPoolSchema = z.object({
  name: z.string().min(2, "Poolnaam is te kort").max(60),
});

export const saveTeamSchema = z.object({
  starterIds: z.array(z.number().int()).length(11, "Kies precies 11 basisspelers"),
  subIds: z.array(z.number().int()).length(5, "Kies precies 5 reserves"),
});

export const predictionSchema = z.object({
  predictedTopscorerId: z.number().int().optional(),
  predictedGoalscorerIds: z.array(z.number().int()).optional(),
});

/* ----------------------------------------------------------------
 * Composite view types (API responses)
 * ---------------------------------------------------------------- */
export type StandingsEntry = {
  userId: number;
  username: string;
  points: number;
  rank: number;
  hasTeam: boolean;
};

export type TeamWithPlayers = {
  team: UserTeam;
  starters: Player[];
  subs: Player[];
  totalPrice: number;
};

export type RoundWithStats = {
  round: Round;
  stats: PlayerStat[];
};
