import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { deflateSync } from "node:zlib";

const zoom = 8;
const tileRange = { minX: 214, maxX: 237, minY: 91, maxY: 113 };
const coreThresholdMeters = 3;
const broadThresholdMeters = 5;
const experimentalThresholdMeters = 10;
const higherThresholdMeters = [15, 20, 30] as const;
const tileSize = 256;
const width = (tileRange.maxX - tileRange.minX + 1) * tileSize;
const height = (tileRange.maxY - tileRange.minY + 1) * tileSize;

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer) {
  const typeBuffer = Buffer.from(type, "ascii");
  const result = Buffer.alloc(12 + data.length);
  result.writeUInt32BE(data.length, 0);
  typeBuffer.copy(result, 4);
  data.copy(result, 8);
  result.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return result;
}

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
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`DEM tile ${x}/${y}: ${response.status}`);
  return (await response.text()).trim().split("\n").map((row) => row.trim().split(",").map((value) => value === "e" ? null : Number(value)));
}

const wetCandidate = new Uint8Array(width * height);
const broadWetCandidate = new Uint8Array(width * height);
const experimentalWetCandidate = new Uint8Array(width * height);
const higherWetCandidates = higherThresholdMeters.map(() => new Uint8Array(width * height));
const oceanSeed = new Uint8Array(width * height);

async function main() {
const tiles: Array<{ x: number; y: number }> = [];
for (let y = tileRange.minY; y <= tileRange.maxY; y += 1) for (let x = tileRange.minX; x <= tileRange.maxX; x += 1) tiles.push({ x, y });
for (let offset = 0; offset < tiles.length; offset += 16) {
  const batch = tiles.slice(offset, offset + 16);
  const loaded = await Promise.all(batch.map(async ({ x, y }) => ({ x, y, rows: await loadTile(x, y) })));
  for (const { x: tileX, y: tileY, rows } of loaded) {
    for (let localY = 0; localY < tileSize; localY += 1) {
      for (let localX = 0; localX < tileSize; localX += 1) {
        const x = (tileX - tileRange.minX) * tileSize + localX;
        const y = (tileY - tileRange.minY) * tileSize + localY;
        const index = y * width + x;
        const elevation = rows?.[localY]?.[localX] ?? null;
        if (elevation === null || elevation <= coreThresholdMeters) wetCandidate[index] = 1;
        if (elevation === null || elevation <= broadThresholdMeters) broadWetCandidate[index] = 1;
        if (elevation === null || elevation <= experimentalThresholdMeters) experimentalWetCandidate[index] = 1;
        higherThresholdMeters.forEach((threshold, thresholdIndex) => {
          if (elevation === null || elevation <= threshold) higherWetCandidates[thresholdIndex][index] = 1;
        });
        if (elevation === null) oceanSeed[index] = 1;
      }
    }
  }
}

function connectToOcean(candidates: Uint8Array) {
  const connected = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;
  for (let index = 0; index < oceanSeed.length; index += 1) {
    if (!oceanSeed[index]) continue;
    connected[index] = 1;
    queue[tail++] = index;
  }
  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const neighbors = [index - width, index + width, x > 0 ? index - 1 : -1, x + 1 < width ? index + 1 : -1];
    for (const neighbor of neighbors) {
      if (neighbor < 0 || neighbor >= connected.length || connected[neighbor] || !candidates[neighbor]) continue;
      connected[neighbor] = 1;
      queue[tail++] = neighbor;
    }
  }
  return connected;
}

const connectedWater = connectToOcean(wetCandidate);
const connectedBroadWater = connectToOcean(broadWetCandidate);
const connectedExperimentalWater = connectToOcean(experimentalWetCandidate);
const connectedHigherWater = higherWetCandidates.map(connectToOcean);

type Rectangle = { startX: number; endX: number; startY: number; endY: number };
function mergeRectangles(mask: Uint8Array) {
const rectangles: Rectangle[] = [];
let active = new Map<string, Rectangle>();
for (let y = 0; y < height; y += 1) {
  const runs: Array<[number, number]> = [];
  let start = -1;
  for (let x = 0; x <= width; x += 1) {
    const index = y * width + x;
    const wet = x < width && mask[index] === 1 && oceanSeed[index] === 0;
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
return rectangles;
}

const rectangles = mergeRectangles(connectedWater);
const broadRectangles = mergeRectangles(connectedBroadWater);
const experimentalRectangles = mergeRectangles(connectedExperimentalWater);
const higherRectangles = connectedHigherWater.map(mergeRectangles);

const globalStartX = tileRange.minX * tileSize;
const globalStartY = tileRange.minY * tileSize;
const outputDirectory = path.resolve(process.cwd(), "public/maps/paleo");
await mkdir(outputDirectory, { recursive: true });
function createMask(items: Rectangle[]) {
const scanlineSize = 1 + width * 4;
const pixels = Buffer.alloc(scanlineSize * height);
for (const { startX, endX, startY, endY } of items) {
  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const offset = y * scanlineSize + 1 + x * 4;
      pixels[offset] = 0;
      pixels[offset + 1] = 229;
      pixels[offset + 2] = 255;
      pixels[offset + 3] = 255;
    }
  }
}
const header = Buffer.alloc(13);
header.writeUInt32BE(width, 0);
header.writeUInt32BE(height, 4);
header[8] = 8;
header[9] = 6;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  pngChunk("IHDR", header),
  pngChunk("IDAT", deflateSync(pixels)),
  pngChunk("IEND", Buffer.alloc(0)),
]);
return png;
}
const maskScenarios: Array<[number, Rectangle[]]> = [[coreThresholdMeters, rectangles], [broadThresholdMeters, broadRectangles], [experimentalThresholdMeters, experimentalRectangles], ...higherThresholdMeters.map((threshold, index) => [threshold, higherRectangles[index]] as [number, Rectangle[]])];
for (const [threshold, items] of maskScenarios) {
  const pngOutput = path.resolve(outputDirectory, `japan-sea-level-${threshold}m.png`);
  await writeFile(pngOutput, createMask(items));
}
const manifest = {
  id: "japan-virtual-sea-levels",
  label: "日本全土の仮想海抜比較",
  method: "現在DEMの指定標高以下かつ現在海域と連続するセルから、現在海域を除いて生成した表示用マスク",
  warning: "歴史的な海面・古海岸線の復元ではありません",
  source: "国土地理院 標高タイル DEM10B",
  sourceUrl: "https://maps.gsi.go.jp/development/ichiran.html",
  zoom,
  bounds: [longitudeAt(globalStartX), latitudeAt(globalStartY + height), longitudeAt(globalStartX + width), latitudeAt(globalStartY)],
  scenarios: maskScenarios.map(([threshold, items]) => ({ thresholdMeters: threshold, mergedCells: items.length, image: `japan-sea-level-${threshold}m.png` })),
  generatedAt: new Date().toISOString(),
};
const manifestOutput = path.resolve(outputDirectory, "japan-virtual-sea-levels.json");
await writeFile(manifestOutput, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote ${maskScenarios.map(([threshold, items]) => `+${threshold}m:${items.length}`).join(" ")} merged cells to ${manifestOutput}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
