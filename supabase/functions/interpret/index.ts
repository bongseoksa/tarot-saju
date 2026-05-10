import {
  buildPrompt,
  validateResponse,
  parseResponse,
  TAROT_CARDS,
  THREE_CARD_SPREAD,
} from "../_shared/mod.ts";
import type { SSEEvent } from "../_shared/mod.ts";

const OLLAMA_URL = Deno.env.get("OLLAMA_URL") ?? "http://localhost:11434";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const { themeId, cards } = await req.json();

    if (!themeId || !Array.isArray(cards) || cards.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: themeId and cards required" }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    const prompt = buildPrompt(
      { themeId, cards },
      TAROT_CARDS,
      THREE_CARD_SPREAD,
    );

    const ollamaRes = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma2:2b",
        prompt,
        stream: true,
      }),
    });

    if (!ollamaRes.ok || !ollamaRes.body) {
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        {
          status: 502,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    const encoder = new TextEncoder();
    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    const stream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          const guardResult = validateResponse(fullText);
          const parsed = parseResponse(fullText);

          const doneEvent: SSEEvent = {
            type: "done",
            data: JSON.stringify(parsed),
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(doneEvent)}\n\n`),
          );

          if (!guardResult.pass) {
            const errorEvent: SSEEvent = {
              type: "error",
              data: `Guard failures: ${guardResult.failures.join(", ")}`,
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`),
            );
          }

          controller.close();
          return;
        }

        const text = decoder.decode(value, { stream: true });
        for (const line of text.split("\n").filter(Boolean)) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              fullText += json.response;
              const chunkEvent: SSEEvent = {
                type: "chunk",
                data: json.response,
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(chunkEvent)}\n\n`),
              );
            }
          } catch {
            // skip malformed Ollama lines
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      },
    );
  }
});
