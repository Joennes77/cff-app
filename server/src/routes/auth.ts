import { Router } from "express";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import rateLimit from "express-rate-limit";
import { db } from "../db/index.js";
import { users } from "../../../shared/schema.js";
import { registerSchema, loginSchema } from "../../../shared/schema.js";
import { eq } from "drizzle-orm";
import type { AuthedRequest, Sessions } from "../types.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Te veel pogingen. Probeer het later opnieuw." },
});

export function makeAuthRouter(sessions: Sessions) {
  // POST /api/auth/register
  router.post("/register", authLimiter, async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }
    const { username, email, password } = parsed.data;

    const existing = db.select().from(users).where(eq(users.email, email)).get();
    if (existing) {
      return res.status(409).json({ message: "E-mailadres is al in gebruik" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(users)
      .values({ username, email, passwordHash })
      .returning();

    const token = randomBytes(32).toString("hex");
    sessions.set(token, { userId: user.id, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 });

    const { passwordHash: _, ...publicUser } = user;
    return res.status(201).json({ token, user: publicUser });
  });

  // POST /api/auth/login
  router.post("/login", authLimiter, async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }
    const { email, password } = parsed.data;

    const user = db.select().from(users).where(eq(users.email, email)).get();
    if (!user) {
      return res.status(401).json({ message: "Ongeldig e-mailadres of wachtwoord" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Ongeldig e-mailadres of wachtwoord" });
    }

    const token = randomBytes(32).toString("hex");
    sessions.set(token, { userId: user.id, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 });

    const { passwordHash: _, ...publicUser } = user;
    return res.json({ token, user: publicUser });
  });

  // GET /api/auth/me
  router.get("/me", (req: AuthedRequest, res) => {
    if (!req.userId) return res.status(401).json({ message: "Niet ingelogd" });
    const user = db.select().from(users).where(eq(users.id, req.userId)).get();
    if (!user) return res.status(404).json({ message: "Gebruiker niet gevonden" });
    const { passwordHash: _, ...publicUser } = user;
    return res.json(publicUser);
  });

  // POST /api/auth/logout
  router.post("/logout", (req, res) => {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (token) sessions.delete(token);
    return res.json({ ok: true });
  });

  return router;
}
