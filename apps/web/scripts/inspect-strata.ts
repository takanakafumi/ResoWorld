import d from "../src/data/published-review-dataset.json";
import { getSpotStratumMemberships, CHRONOLOGICAL_STRATA, buildClaimsByIdMap } from "../src/domain/review/stratum-types";

const claimsById = buildClaimsByIdMap(d.claims as never);
const memberships = getSpotStratumMemberships(d.atlas.spots as never, CHRONOLOGICAL_STRATA, { claimsById });

console.log("=== STRATUM SPOT COUNTS ===");
CHRONOLOGICAL_STRATA.forEach(s => {
  const count = [...memberships.values()].filter(m => m.strata.some(st => st.id === s.id)).length;
  console.log(`L${s.order} ${s.code.padEnd(22)}: ${count} spots`);
});

console.log("\n=== MULTI-LAYERED SPOTS BREAKDOWN ===");
const multi = [...memberships.values()]
  .filter(m => m.strataCount >= 1)
  .sort((a,b) => b.strataCount - a.strataCount);

multi.forEach(m => {
  const spot = d.atlas.spots.find(s => s.id === m.spotId);
  const layers = m.strata.map(s => "L" + s.order).join(",");
  console.log(`${spot?.name.padEnd(22)} [${m.strataCount}層: ${layers.padEnd(12)}] (${spot?.kind} / ${spot?.region})`);
});
