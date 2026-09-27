# Token Efficiency & Cost Minimization Rules

## 1. Strict File Reading Limits
- **Never read entire large files (>100 lines)** with `view_file` unless absolutely required.
- Use targeted grep / `Select-String` / line-number slicing to inspect only relevant portions.
- Avoid repetitive reads of the same file within a single session.

## 2. Offload Heavy Work to Local LLM (LM Studio)
- When extracting candidates, summarizing historical literature (e.g. Wei Zhi Wajinden), or performing initial text parsing:
  - **DO NOT** process massive raw texts through cloud LLM tokens.
  - Execute `node scripts/local-llm.mjs --model "qwen/qwen3-14b" --prompt "..."` to delegate the heavy lifting to the local GPU (zero token cost).
  - Use cloud tokens only for architectural decisions, UI integration, and final review.

## 3. Deterministic Operations via Scripts
- Data updates, JSON filtering, and calculations must be performed via short Node.js / PowerShell scripts rather than asking the LLM to rewrite entire JSON datasets.
- Always run `pnpm test` after data or UI modifications to verify consistency.
