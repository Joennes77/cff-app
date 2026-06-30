import { createServer as createViteServer } from "vite";
import type { Express } from "express";
import type { Server } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function setupVite(httpServer: Server, app: Express) {
  const vite = await createViteServer({
    configFile: path.resolve(__dirname, "../../vite.config.ts"),
    server: {
      middlewareMode: true,
      hmr: { server: httpServer },
    },
    appType: "spa",
  });

  app.use(vite.middlewares);
}
