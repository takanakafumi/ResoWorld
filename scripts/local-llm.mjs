import http from "node:http";

/**
 * Usage:
 *   node scripts/local-llm.mjs --prompt "テキスト..." [--model "qwen/qwen3-14b"] [--system "システム指示"]
 */

const args = process.argv.slice(2);
function getArg(flag, defaultValue = "") {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue;
}

const model = getArg("--model", "qwen/qwen3-14b");
const prompt = getArg("--prompt", "");
const system = getArg("--system", "You are a helpful assistant.");
const maxTokens = Number.parseInt(getArg("--max-tokens", "2048"), 10);
const temperature = Number.parseFloat(getArg("--temperature", "0.2"));

if (!prompt) {
  console.error("Error: --prompt is required.");
  process.exit(1);
}

const payload = JSON.stringify({
  model,
  messages: [
    { role: "system", content: system },
    { role: "user", content: prompt },
  ],
  max_tokens: maxTokens,
  temperature,
  stream: false,
});

const req = http.request(
  {
    hostname: "127.0.0.1",
    port: 1234,
    path: "/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  },
  (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      try {
        const json = JSON.parse(data);
        if (json.choices && json.choices.length > 0) {
          console.log(json.choices[0].message.content.trim());
        } else {
          console.error("Unexpected response:", data);
        }
      } catch (err) {
        console.error("JSON parse error:", err.message, data);
        process.exit(1);
      }
    });
  }
);

req.on("error", (err) => {
  console.error("Connection error to LM Studio (127.0.0.1:1234):", err.message);
  process.exit(1);
});

req.write(payload);
req.end();
