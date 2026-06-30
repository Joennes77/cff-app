/**
 * Production build script.
 * 1. Builds the Vite client into dist/public
 * 2. Bundles the Express server into dist/index.cjs
 */
import { build as viteBuild } from "vite";
import esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

console.log("Building client…");
await viteBuild({ configFile: path.join(root, "vite.config.ts") });

console.log("Building server…");
await esbuild.build({
  entryPoints: [path.join(root, "server/src/index.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: path.join(root, "dist/index.cjs"),
  external: ["better-sqlite3", "bcryptjs", "vite", "lightningcss", "esbuild"],
  sourcemap: true,
});

console.log("Build complete.");
