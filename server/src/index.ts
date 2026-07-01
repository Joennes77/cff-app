import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import helmet from "helmet";
import { createServer } from "node:http";
import { makeAuthRouter } from "./routes/auth.js";
import { poolsRouter } from "./routes/pools.js";
import { playersRouter } from "./routes/players.js";
import { teamsRouter } from "./routes/teams.js";
import { roundsRouter } from "./routes/rounds.js";
import { adminRouter } from "./routes/admin.js";
import logosRouter from "./routes/logos.js";
import { db } from "./db/index.js";
import { users } from "../../shared/schema.js";
import { eq } from "drizzle-orm";
import { ensurePlayers } from "./db/seed.js";
import type { AuthedRequest, Sessions } from "./types.js";

const app = express();
const httpServer = createServer(app);

/* ----------------------------------------------------------------
 * Session store (in-memory, Bearer token)
 * ---------------------------------------------------------------- */
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const sessions: Sessions = new Map();

// Prune expired sessions hourly
setInterval(() => {
  const now = Date.now();
  sessions.forEach((s, token) => {
    if (s.expiresAt < now) sessions.delete(token);
  });
}, 60 * 60 * 1000).unref();

/* ----------------------------------------------------------------
 * Middleware
 * ---------------------------------------------------------------- */
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const ms = Date.now() - start;
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${ms}ms`);
    }
  });
  next();
});

/* ----------------------------------------------------------------
 * Auth middleware
 * ---------------------------------------------------------------- */
function getSession(req: Request): number | undefined {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const s = sessions.get(token);
  if (!s) return undefined;
  if (s.expiresAt < Date.now()) { sessions.delete(token); return undefined; }
  return s.userId;
}

async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const userId = getSession(req);
  if (!userId) return res.status(401).json({ message: "Niet ingelogd" });
  req.userId = userId;
  next();
}

async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const userId = getSession(req);
  if (!userId) return res.status(401).json({ message: "Niet ingelogd" });
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user?.isAdmin) return res.status(403).json({ message: "Geen beheerderstoegang" });
  req.userId = userId;
  next();
}

/* ----------------------------------------------------------------
 * Routes
 * ---------------------------------------------------------------- */
app.use("/api/auth", makeAuthRouter(sessions));
app.use("/api/pools", requireAuth, poolsRouter);
app.use("/api/players", requireAuth, playersRouter);
app.use("/api/teams", requireAuth, teamsRouter);
app.use("/api/rounds", requireAuth, roundsRouter);
app.use("/api/admin", requireAdmin, adminRouter);
app.use("/api/club-logos", logosRouter);

/* ----------------------------------------------------------------
 * Error handler
 * ---------------------------------------------------------------- */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error("Server error:", err);
  if (!res.headersSent) res.status(status).json({ message });
});

/* ----------------------------------------------------------------
 * Start
 * ---------------------------------------------------------------- */
async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) return;
  await db.update(users).set({ isAdmin: 1 }).where(eq(users.email, email));
}

async function main() {
  await ensurePlayers();
  await ensureAdmin();

  if (process.env.NODE_ENV === "production") {
    const { serveStatic } = await import("./static.js");
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite.js");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT ?? "5000", 10);
  httpServer.listen({ port, host: "0.0.0.0" }, () => {
    console.log(`CFF server running on port ${port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
