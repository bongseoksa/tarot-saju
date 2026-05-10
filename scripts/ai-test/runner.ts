/**
 * AI Test Runner: execute scenarios against local Ollama and evaluate results.
 *
 * Usage:
 *   pnpm test:ai:quick         # 25 scenarios
 *   pnpm test:ai:full          # 813 scenarios
 */

import { runGuard } from "./guard.js";
import { generateScenarios, type Scenario } from "./scenarios.js";
import { evaluate } from "./evaluator.js";
import { printReport, type TestResult } from "./report.js";
import { buildPrompt, TAROT_CARDS, THREE_CARD_SPREAD } from "@tarot-saju/shared";

const MODEL = "gemma2:2b";

async function callOllama(
  url: string,
  prompt: string,
): Promise<{ response: string; durationMs: number }> {
  const start = Date.now();
  const res = await fetch(`${url}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt, stream: false }),
  });

  if (!res.ok) {
    throw new Error(`Ollama returned ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  return {
    response: json.response ?? "",
    durationMs: Date.now() - start,
  };
}

async function runScenario(
  url: string,
  scenario: Scenario,
): Promise<TestResult> {
  const prompt = buildPrompt(
    { themeId: scenario.themeId, cards: scenario.cards },
    TAROT_CARDS,
    THREE_CARD_SPREAD,
  );

  const { response, durationMs } = await callOllama(url, prompt);
  const evalResult = evaluate(response, scenario.cards);

  return {
    scenario,
    eval: evalResult,
    durationMs,
    rawResponse: response,
  };
}

async function main() {
  const modeArg = process.argv.find((a) => a === "--mode");
  const modeIdx = process.argv.indexOf("--mode");
  const mode = (modeIdx >= 0 ? process.argv[modeIdx + 1] : "quick") as
    | "quick"
    | "full";

  if (mode !== "quick" && mode !== "full") {
    console.error('Usage: tsx runner.ts --mode <quick|full>');
    process.exit(1);
  }

  console.log(`[Runner] Mode: ${mode}`);

  // Guard check
  let url: string;
  try {
    url = await runGuard();
    console.log(`[Guard] OK — using ${url}`);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }

  const scenarios = generateScenarios(mode);
  console.log(`[Runner] ${scenarios.length} scenarios to run\n`);

  const results: TestResult[] = [];

  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];
    process.stdout.write(
      `  [${i + 1}/${scenarios.length}] ${scenario.name}... `,
    );

    try {
      const result = await runScenario(url, scenario);
      results.push(result);
      console.log(
        result.eval.pass
          ? `PASS (${result.durationMs}ms)`
          : `FAIL (${result.eval.failures.join(", ")})`,
      );
    } catch (err) {
      console.log(`ERROR: ${(err as Error).message}`);
      results.push({
        scenario,
        eval: {
          pass: false,
          failures: [`runtime_error:${(err as Error).message}`],
          summary: "",
          responseLength: 0,
        },
        durationMs: 0,
        rawResponse: "",
      });
    }
  }

  printReport(results);

  const passRate = results.filter((r) => r.eval.pass).length / results.length;
  process.exit(passRate >= 0.9 ? 0 : 1);
}

main();
