/**
 * Report: format and display test results.
 */

import type { EvalResult } from "./evaluator.js";
import type { Scenario } from "./scenarios.js";

export interface TestResult {
  scenario: Scenario;
  eval: EvalResult;
  durationMs: number;
  rawResponse: string;
}

export function printReport(results: TestResult[]): void {
  const passed = results.filter((r) => r.eval.pass);
  const failed = results.filter((r) => !r.eval.pass);
  const total = results.length;
  const passRate = ((passed.length / total) * 100).toFixed(1);
  const avgDuration = (
    results.reduce((sum, r) => sum + r.durationMs, 0) / total
  ).toFixed(0);
  const avgLength = (
    results.reduce((sum, r) => sum + r.eval.responseLength, 0) / total
  ).toFixed(0);

  console.log("\n" + "=".repeat(60));
  console.log("AI Test Report");
  console.log("=".repeat(60));
  console.log(`Total: ${total} | Passed: ${passed.length} | Failed: ${failed.length}`);
  console.log(`Pass Rate: ${passRate}%`);
  console.log(`Avg Duration: ${avgDuration}ms | Avg Length: ${avgLength} chars`);

  if (failed.length > 0) {
    console.log("\n--- Failed Scenarios ---");
    for (const r of failed) {
      console.log(`  [FAIL] ${r.scenario.name}`);
      console.log(`         Failures: ${r.eval.failures.join(", ")}`);
      console.log(`         Length: ${r.eval.responseLength} chars`);
    }
  }

  // Failure type breakdown
  const failureTypes: Record<string, number> = {};
  for (const r of failed) {
    for (const f of r.eval.failures) {
      failureTypes[f] = (failureTypes[f] ?? 0) + 1;
    }
  }
  if (Object.keys(failureTypes).length > 0) {
    console.log("\n--- Failure Type Breakdown ---");
    for (const [type, count] of Object.entries(failureTypes).sort(
      (a, b) => b[1] - a[1],
    )) {
      console.log(`  ${type}: ${count}`);
    }
  }

  console.log("\n" + "=".repeat(60));
}
