import type { Request } from "express";

export interface AuthedRequest extends Request {
  userId?: number;
}

export type Sessions = Map<string, { userId: number; expiresAt: number }>;
