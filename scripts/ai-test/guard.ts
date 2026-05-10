/**
 * Guard: ensure AI tests only run against local Ollama.
 * 3-layer defense: URL whitelist, connection check, env var isolation.
 */

const DEFAULT_URL = "http://localhost:11434";

export function getTestOllamaUrl(): string {
  return process.env.TEST_OLLAMA_URL ?? DEFAULT_URL;
}

export function assertLocalUrl(url: string): void {
  const parsed = new URL(url);
  const allowed = ["localhost", "127.0.0.1"];
  if (!allowed.includes(parsed.hostname)) {
    throw new Error(
      `[GUARD] Blocked: "${url}" is not a local URL. AI tests must only target localhost or 127.0.0.1.`,
    );
  }
}

export async function assertOllamaRunning(url: string): Promise<void> {
  try {
    const res = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      throw new Error(`Ollama returned ${res.status}`);
    }
  } catch (err) {
    throw new Error(
      `[GUARD] Ollama is not running at ${url}. Start it with "ollama serve". (${err instanceof Error ? err.message : err})`,
    );
  }
}

export async function runGuard(): Promise<string> {
  const url = getTestOllamaUrl();
  assertLocalUrl(url);
  await assertOllamaRunning(url);
  return url;
}
