import fs from "node:fs/promises";
import path from "node:path";
import { readTripSource, root } from "./lib.mjs";

const { data } = await readTripSource();
const template = await fs.readFile(path.join(root, "src", "template.html"), "utf8");
const dist = path.join(root, "dist");

await fs.mkdir(dist, { recursive: true });
await Promise.all([
  fs.copyFile(path.join(root, "src", "styles.css"), path.join(dist, "styles.css")),
  fs.copyFile(path.join(root, "src", "app.js"), path.join(dist, "app.js")),
  fs.writeFile(path.join(dist, "trip.json"), `${JSON.stringify(data, null, 2)}\n`, "utf8"),
  fs.writeFile(
    path.join(dist, "index.html"),
    template
      .replaceAll("{{TRIP_TITLE}}", escapeHtml(data.trip.title))
      .replaceAll("{{TRIP_DESCRIPTION}}", escapeHtml(`${data.trip.start_date} 至 ${data.trip.end_date} · ${data.trip.subtitle || "旅行手册"}`)),
    "utf8"
  )
]);

console.log("✓ 网页已生成到 dist/");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
