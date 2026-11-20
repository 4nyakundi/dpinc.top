import fs from "node:fs";
import { spawnSync } from "node:child_process";
if (process.env.TEST_DATABASE_URL) process.exit(0);
fs.mkdirSync(".database-backups", { recursive: true });
const source = fs.readFileSync("prisma/schema.prisma", "utf8")
  .replace(/model \w+ \{(?:(?!\n\}).)*@@ignore(?:(?!\n\}).)*\n\}/gs, "")
  .replace(/^.*directUrl.*$/gm, "")
  .replace(/enum \w+ \{.*?\n\}/gs, "")
  .replace(/url\s*= env\("DATABASE_URL"\)/, 'url = "file:./placeholder.db"')
  .replace(/provider\s*= "mysql"/, 'provider = "sqlite"')
  .replace(/ @db\.\w+(?:\([^)]*\))?/g, "")
  .replace('provider = "prisma-client-js"', 'provider = "prisma-client-js"\n  output = "./test-client"');
fs.writeFileSync(".database-backups/test-schema.prisma", source);
for (const args of [
  ["generate", "--schema", ".database-backups/test-schema.prisma"],
  ["migrate", "diff", "--from-empty", "--to-schema-datamodel", ".database-backups/test-schema.prisma", "--script", "--output", ".database-backups/test-schema.sql"],
]) {
  const result = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", ...args], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
