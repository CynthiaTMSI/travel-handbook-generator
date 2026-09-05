import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

export const root = path.resolve(import.meta.dirname, "..");
export const tripPath = path.join(root, "data", "trip.yaml");

export async function readTripSource() {
  const raw = await fs.readFile(tripPath, "utf8");
  const data = YAML.parse(raw);
  return { raw, data };
}

export function fail(messages) {
  for (const message of messages) console.error(`✖ ${message}`);
  process.exitCode = 1;
}

export function parseMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}
