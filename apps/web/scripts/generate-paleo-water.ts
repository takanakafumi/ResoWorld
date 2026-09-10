import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const zoom = 10;
const tileRange = { minX: 881, maxX: 884, minY: 409, maxY: 412 };
const thresholdMeters = 3;
const tileSize = 256;
const width = (tileRange.maxX - tileRange.minX + 1) * tileSize;
const height = (tileRange.maxY - tileRange.minY + 1) * tileSize;

function longitudeAt(globalX: number) {
  return globalX / (tileSize * 2 ** zoom) * 360 - 180;
}

function latitudeAt(globalY: number) {
  const mercator = Math.PI * (1 - 2 * globalY / (tileSize * 2 ** zoom));
  return Math.atan(Math.sinh(mercator)) * 180 / Math.PI;
}

async function loadTile(x: number, y: number) {
  const url = `https://cyberjapandata.gsi.go.jp/xyz/dem/${zoom}/${x}/${y}.txt`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`DEM tile ${x}/${y}: ${response.status}`);
  return (await response.text()).trim().split("\n").map((row) => row.trim().split(",").map((value) => value === "e" ? null : Number(value)));
}

const wetCandidate = new Uint8Array(width * height);
const oceanSeed = new Uint8Array(width * height);

async function main() {
for (let tileY = tileRange.minY; tileY <= tileRange.maxY; tileY += 1) {
  for (let tileX = tileRange.minX; tileX <= tileRange.maxX; tileX += 1) {
    const rows = await loadTile(tileX, tileY);
    for (let localY = 0; localY < tileSize; localY += 1) {
      for (let localX = 0; localX < tileSize; localX += 1) {
        const x = (tileX - tileRange.minX) * tileSize + localX;
        const y = (tileY - tileRange.minY) * tileSize + localY;
        const index = y * width + x;
        const elevation = rows[localY]?.[localX] ?? null;
        if (elevation === null || elevation <= thresholdMeters) wetCandidate[index] = 1;
        if (elevation === null) oceanSeed[index] = 1;
      }
    }
  }
}

const connectedWater = new Uint8Array(width * height);
const queue = new Int32Array(width * height);
let head = 0;
let tail = 0;
for (let index = 0; index < oceanSeed.length; index += 1) {
  if (!oceanSeed[index]) continue;
  connectedWater[index] = 1;
  queue[tail++] = index;
}
while (head < tail) {
  const index = queue[head++];
  const x = index % width;
  const neighbors = [index - width, index + width, x > 0 ? index - 1 : -1, x + 1 < width ? index + 1 : -1];
  for (const neighbor of neighbors) {
    if (neighbor < 0 || neighbor >= connectedWater.length || connectedWater[neighbor] || !wetCandidate[neighbor]) continue;
    connectedWater[neighbor] = 1;
    queue[tail++] = neighbor;
  }
}

type Rectangle = { startX: number; endX: number; startY: number; endY: number };
const rectangles: Rectangle[] = [];
let active = new Map<string, Rectangle>();
for (let y = 0; y < height; y += 1) {
  const runs: Array<[number, number]> = [];
  let start = -1;
  for (let x = 0; x <= width; x += 1) {
    const wet = x < width && connectedWater[y * width + x] === 1;
    if (wet && start < 0) start = x;
    if (!wet && start >= 0) {
      runs.push([start, x]);
      start = -1;
    }
  }
  const next = new Map<string, Rectangle>();
  for (const [startX, endX] of runs) {
    const key = `${startX}:${endX}`;
    const rectangle = active.get(key) ?? { startX, endX, startY: y, endY: y };
    rectangle.endY = y + 1;
    next.set(key, rectangle);
  }
  for (const [key, rectangle] of active) if (!next.has(key)) rectangles.push(rectangle);
  active = next;
}
rectangles.push(...active.values());

const globalStartX = tileRange.minX * tileSize;
const globalStartY = tileRange.minY * tileSize;
const coordinates = rectangles.map((rectangle) => {
  const west = longitudeAt(globalStartX + rectangle.startX);
  const east = longitudeAt(globalStartX + rectangle.endX);
  const north = latitudeAt(globalStartY + rectangle.startY);
  const south = latitudeAt(globalStartY + rectangle.endY);
  return [[[west, south], [east, south], [east, north], [west, north], [west, south]]];
});

const geojson = {
  type: "FeatureCollection",
  name: "northern-kyushu-elevation-3m-connected-water",
  metadata: {
    label: "弥生期の景観を考える推定水域",
    method: "現在DEMの標高3m以下かつ現在の海域と連続するセルを抽出した参考試算",
    warning: "堆積、隆起・沈降、河道変化、干拓・埋立を補正した古海岸線復元ではありません",
    source: "国土地理院 標高タイル DEM10B",
    sourceUrl: "https://maps.gsi.go.jp/development/ichiran.html",
    zoom,
    thresholdMeters,
    generatedAt: new Date().toISOString(),
  },
  features: [{
    type: "Feature",
    properties: { scenario: "reference", thresholdMeters },
    geometry: { type: "MultiPolygon", coordinates },
  }],
};

const output = path.resolve(process.cwd(), "public/maps/paleo/northern-kyushu-late-yayoi.geojson");
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(geojson)}\n`, "utf8");
console.log(`Wrote ${rectangles.length} merged cells to ${output}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
