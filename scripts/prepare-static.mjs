import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
for (const name of ["index.html", "dashboard.html", "quote.html", "contact.html", "services.html", "portfolio.html"]) {
  const html = fs.readFileSync(path.join(root, name), "utf8").replace(/((?:src|href)=["'])public\//g, "$1/");
  fs.writeFileSync(path.join(root, "public", name), html);
}
for (const name of ["js", "css"]) fs.cpSync(path.join(root, name), path.join(root, "public", name), { recursive: true });
fs.mkdirSync(path.join(root, "public/data"), { recursive: true });
fs.copyFileSync(path.join(root, "data/site-data.json"), path.join(root, "public/data/site-data.json"));
