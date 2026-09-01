import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import type { PlaceResolutionCandidate } from "@/domain/imports/place-resolution";

const responseSchema = z.array(z.object({
  osm_type: z.string(),
  osm_id: z.number(),
  lat: z.string(),
  lon: z.string(),
  display_name: z.string(),
  category: z.string().optional().default(""),
  type: z.string().optional().default(""),
  address: z.record(z.string(), z.string()).optional().default({}),
}));

type SearchResult = {
  provider: "nominatim";
  query: string;
  cached: boolean;
  candidates: PlaceResolutionCandidate[];
};

let requestQueue: Promise<void> = Promise.resolve();
let lastRequestStartedAt = 0;

function config() {
  const enabled = process.env.RESOWORLD_GEOCODING_ENABLED === "true";
  const cacheDir = process.env.RESOWORLD_GEOCODING_CACHE_DIR?.trim() ?? "";
  const userAgent = process.env.RESOWORLD_NOMINATIM_USER_AGENT?.trim() ?? "";
  const baseUrl = process.env.RESOWORLD_NOMINATIM_BASE_URL?.trim() || "https://nominatim.openstreetmap.org";
  if (!enabled) throw new Error("Place search is not enabled.");
  if (!path.isAbsolute(cacheDir)) throw new Error("RESOWORLD_GEOCODING_CACHE_DIR must be an absolute path.");
  if (!userAgent) throw new Error("RESOWORLD_NOMINATIM_USER_AGENT is required.");
  return { cacheDir, userAgent, baseUrl };
}

function cachePath(cacheDir: string, query: string) {
  const key = createHash("sha256").update(query.normalize("NFKC").trim().toLocaleLowerCase("ja")).digest("hex");
  return path.join(cacheDir, `${key}.json`);
}

async function waitForRateLimit() {
  const delay = Math.max(0, 1_000 - (Date.now() - lastRequestStartedAt));
  if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
  lastRequestStartedAt = Date.now();
}

async function serializedFetch(url: URL, userAgent: string) {
  let release!: () => void;
  const previous = requestQueue;
  requestQueue = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  try {
    await waitForRateLimit();
    return await fetch(url, {
      headers: { "Accept-Language": "ja", "User-Agent": userAgent },
      signal: AbortSignal.timeout(15_000),
    });
  } finally {
    release();
  }
}

export async function searchPlaceCandidates(rawQuery: string): Promise<SearchResult> {
  const query = rawQuery.normalize("NFKC").trim();
  const { cacheDir, userAgent, baseUrl } = config();
  const file = cachePath(cacheDir, query);
  try {
    const cached = JSON.parse(await readFile(file, "utf8")) as Omit<SearchResult, "cached">;
    return { ...cached, cached: true };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }

  const url = new URL("search", `${baseUrl.replace(/\/$/, "")}/`);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");
  const response = await serializedFetch(url, userAgent);
  if (!response.ok) throw new Error(`Nominatim returned HTTP ${response.status}.`);
  const parsed = responseSchema.parse(await response.json());
  const result: Omit<SearchResult, "cached"> = {
    provider: "nominatim",
    query,
    candidates: parsed.map((item) => ({
      id: `${item.osm_type}:${item.osm_id}`,
      provider: "nominatim",
      displayName: item.display_name,
      latitude: Number(item.lat),
      longitude: Number(item.lon),
      category: item.category,
      type: item.type,
      address: item.address,
      attribution: "© OpenStreetMap contributors",
    })),
  };
  await mkdir(cacheDir, { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  await rename(temporary, file);
  return { ...result, cached: false };
}
