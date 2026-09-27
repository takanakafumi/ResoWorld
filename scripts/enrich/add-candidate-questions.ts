import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { LensKnowledgePackSchema, type LensKnowledgePack } from "../../apps/web/src/domain/lens-packs/schema";

async function queryLmStudio(prompt: string, systemPrompt: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch("http://127.0.0.1:1234/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const json = await res.json();
    return json.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

function parseAiOutput(output: string): { question: string; reason: string } | null {
  const questionMatch = output.match(/question[:：]\s*(.+)/i);
  const reasonMatch = output.match(/reason[:：]\s*(.+)/i);

  if (questionMatch && reasonMatch) {
    return {
      question: questionMatch[1].trim(),
      reason: reasonMatch[1].trim(),
    };
  }
  return null;
}

export async function enrichPackWithQuestions(packPath: string) {
  const raw = await readFile(packPath, "utf-8");
  const pack: LensKnowledgePack = LensKnowledgePackSchema.parse(JSON.parse(raw));

  const entityById = new Map(pack.entities.map((e) => [e.id, e]));

  for (const preset of pack.presets) {
    for (const connection of preset.mapConnections) {
      if (!connection.explorationQuestions) {
        connection.explorationQuestions = {};
      }

      for (const placeId of connection.placeEntityIds) {
        if (connection.explorationQuestions[placeId]) {
          continue;
        }

        const place = entityById.get(placeId);
        if (!place) continue;

        // Find associated deities / assertions
        const relatedAssertions = pack.assertions.filter(
          (a) => a.objectId === placeId || a.subjectId === placeId
        );
        const relatedEntityIds = relatedAssertions.flatMap((a) => [a.subjectId, a.objectId]);
        const deities = relatedEntityIds
          .map((id) => entityById.get(id))
          .filter((e) => e && e.kind === "deity")
          .map((e) => e!.label);
        const deityText = deities.length > 0 ? deities.join("、") : "";

        const systemPrompt = "あなたは知的好奇心旺盛な歴史旅行者のためのフィールドワークガイドです。";
        const prompt = `以下の候補地について、現地で何を観察すべきか（question）と、なぜ行く価値があるのか（reason）をそれぞれ100文字以内で作成してください。

【候補地】
- 名称: ${place.label}
${deityText ? `- 祭神: ${deityText}\n` : ""}- 由緒・特徴: ${place.description ?? "歴史的史跡"}
- 関連ネットワーク: ${connection.label}（${connection.description}）

【出力形式】
必ず以下の形式のみで出力してください（他の解説は不要）：
question: 現地で観察・確認すべき痕跡や空間的特徴（一人称の問い）
reason: なぜこのネットワークの中でここを訪れる価値があるのか`;

        console.log(`[enrich] Querying for ${place.label}...`);
        const aiResponse = await queryLmStudio(prompt, systemPrompt);

        let parsed = aiResponse ? parseAiOutput(aiResponse) : null;
        if (!parsed) {
          console.log(`[enrich] LM Studio not available or parsing failed. Using structured template for ${place.label}.`);
          parsed = deityText
            ? {
                question: `${place.label}（祭神: ${deityText}）の鎮座地において、${connection.label}に関連する地形的特徴や古代祭祀の痕跡をどのように確認できるか？`,
                reason: `${place.description ?? `${place.label}は古代の重要祭祀拠点`}であり、${connection.label}の空間配置を検証する上で欠かせない結節点であるため。`,
              }
            : {
                question: `${place.label}の現地において、${connection.label}に関連する地形的特徴や防衛・交通要衝としての痕跡をどのように確認できるか？`,
                reason: `${place.description ?? `${place.label}は古代の重要拠点`}であり、${connection.label}の空間配置を検証する上で欠かせない結節点であるため。`,
              };
        }

        connection.explorationQuestions[placeId] = parsed;
        console.log(`  -> question: ${parsed.question}`);
        console.log(`  -> reason: ${parsed.reason}`);
      }
    }
  }

  // Validate strictly with Zod
  const validated = LensKnowledgePackSchema.parse(pack);
  await writeFile(packPath, JSON.stringify(validated, null, 2), "utf-8");
  console.log(`[enrich] Successfully enriched pack: ${packPath}`);
  return validated;
}

if (require.main === module || process.argv[1]?.endsWith("add-candidate-questions.ts")) {
  const root = resolve(__dirname, "../..");
  const packPath = process.argv[2]
    ? resolve(process.cwd(), process.argv[2])
    : resolve(root, "data/knowledge-packs/shikinaisha-chikuzen-buzen.json");

  enrichPackWithQuestions(packPath).catch((err) => {
    console.error("[enrich] Error:", err);
    process.exit(1);
  });
}
