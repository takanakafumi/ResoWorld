import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { evaluateClaims } from "../src/domain/evaluation/evaluate-claims.ts";
import { ClaimSchema, KnowledgeDatasetSchema } from "../src/domain/knowledge/schema.ts";
import {
  reviewPriorityTier,
  type ReviewPriorityTier,
} from "../src/domain/review/priority.ts";

type EvaluationTier = ReviewPriorityTier | "all";

function usage(): never {
  throw new Error(
    "Usage: node --experimental-strip-types scripts/evaluate-extraction.ts [--tier=focus|supporting|resolved|all] <gold-dataset.json> <report.json> <prediction.json> [prediction-2.json ...]",
  );
}

const argumentsWithoutRuntime = process.argv.slice(2);
const tierArgument = argumentsWithoutRuntime.find((argument) =>
  argument.startsWith("--tier="),
);
const positionalArguments = argumentsWithoutRuntime.filter(
  (argument) => !argument.startsWith("--tier="),
);
const [goldPathArgument, reportPathArgument, ...predictionPathArguments] =
  positionalArguments;
const tier = (tierArgument?.slice("--tier=".length) ?? "all") as EvaluationTier;
if (!goldPathArgument || !reportPathArgument || predictionPathArguments.length === 0) {
  usage();
}
if (!["focus", "supporting", "resolved", "all"].includes(tier)) usage();

const goldPath = resolve(goldPathArgument);
const reportPath = resolve(reportPathArgument);

const gold = KnowledgeDatasetSchema.parse(
  JSON.parse(await readFile(goldPath, "utf8")),
);
const allPredictionClaims = (
  await Promise.all(
    predictionPathArguments.map(async (pathArgument) => {
      const predictionJson = JSON.parse(
        await readFile(resolve(pathArgument), "utf8"),
      );
      const claims = Array.isArray(predictionJson.claims)
        ? predictionJson.claims
        : predictionJson.extraction?.claims;
      if (!Array.isArray(claims)) usage();
      return claims.map((claim: unknown) => ClaimSchema.parse(claim));
    }),
  )
).flat();
const predictionClaims =
  tier === "all"
    ? allPredictionClaims
    : allPredictionClaims.filter((claim) => reviewPriorityTier(claim) === tier);

const evaluation = evaluateClaims(gold.claims, predictionClaims);
const report = {
  generatedAt: new Date().toISOString(),
  method: {
    name: "evidence-anchor-and-bigram-greedy-match",
    threshold: evaluation.threshold,
    presentationTier: tier,
    note: "Candidate matching is deterministic. Borderline and unmatched items require human review before the recall figure is accepted.",
  },
  ...evaluation,
};

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(
  JSON.stringify(
    {
      reportPath,
      matched: report.matchedCount,
      gold: report.goldCount,
      predicted: report.predictedCount,
      recall: report.recall,
      precision: report.precision,
      presentationTier: tier,
    },
    null,
    2,
  ),
);
