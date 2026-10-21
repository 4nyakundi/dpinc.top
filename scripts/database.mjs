import fs from "node:fs";
import { spawnSync } from "node:child_process";
// Load local configuration without printing secrets; explicit shell variables take precedence.
const inherited = new Set(Object.keys(process.env));
for (const name of [".env", ".env.local"]) {
  if (!fs.existsSync(name)) continue;
  // Node's dotenv parser supports quoted secrets and comments.
  const parsed = (await import("node:util")).parseEnv(fs.readFileSync(name, "utf8"));
  for (const [key, value] of Object.entries(parsed)) if (!inherited.has(key)) process.env[key] = value;
}
process.env.DIRECT_DATABASE_URL ||= process.env.DATABASE_URL;
const action = process.argv[2];
const commands = {
  generate: ["node_modules/prisma/build/index.js", "generate"],
  "baseline-xampp": ["node_modules/prisma/build/index.js", "migrate", "resolve", "--applied", "20261019000000_xampp_legacy_baseline"],
  deploy: ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  status: ["node_modules/prisma/build/index.js", "migrate", "status"],
  seed: ["prisma/seed.js"],
  admin: ["scripts/create-admin.mjs"],
  import: ["--experimental-strip-types", "scripts/import-legacy.mjs", ...process.argv.slice(3)],
};
if (!commands[action]) throw new Error("Unknown database action");
if (["baseline-xampp", "deploy", "status", "seed", "admin"].includes(action) && !/^mysql:\/\//.test(process.env.DATABASE_URL ?? "")) throw new Error("Configure a MySQL/MariaDB DATABASE_URL first. No database changes were made.");
const result = spawnSync(process.execPath, commands[action], { stdio: "inherit", env: process.env });
process.exit(result.status ?? 1);
