---
name: resoworld-local-delegate
description: Offloads heavy text analysis, literature extraction (e.g. Wei Zhi Wajinden), and candidate screening to the local LM Studio instance to conserve cloud tokens.
---

# ResoWorld Local LLM Delegation Skill

This skill allows Antigravity to run massive text comprehension and candidate discovery on the user's local machine via LM Studio without consuming cloud tokens.

## When to Use
- Analyzing long historical text excerpts, research papers, or excavation records.
- Brainstorming/extracting candidate spots (e.g., Yoshinogari, Munakata, Usa) from raw sources.
- Pre-filtering data before writing to JSON datasets.

## How to Execute
Run the local LLM bridge script via `run_command`:

```powershell
node scripts/local-llm.mjs --model "qwen/qwen3-14b" --prompt "<YOUR_PROMPT>" --system "<OPTIONAL_SYSTEM_PROMPT>"
```

### Available Models in Local LM Studio
- **`qwen/qwen3-14b`** (Default): Excellent at Japanese comprehension, historical texts, and nuanced information extraction.
- **`mistralai/devstral-small-2507`**: Strong general-purpose reasoning with large context.
- **`deepseek-r1-distill-qwen-14b`**: Best for deep logical contradiction checks and chain-of-thought verification.
- **`qwen/qwen2.5-coder-14b`**: Code transformation and regex extraction tasks.

## Workflow Example
1. Prepare the text excerpt to analyze.
2. Execute `node scripts/local-llm.mjs --model "qwen/qwen3-14b" --prompt "以下の魏志倭人伝の記述から、言及されている地名と推定比定地をJSON形式で抽出してください：\n\n<TEXT>"`.
3. Capture the stdout response.
4. Integrate the extracted candidates into `travel-atlas.yamatai.json` or present them to the user.
