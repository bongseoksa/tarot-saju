import { http, HttpResponse } from "msw";

const MOCK_INTERPRETATION = `### 과거 해석
지나온 시간 속에서 당신은 이미 많은 것을 경험하셨습니다.
그 과정에서 쌓인 감정과 기억이 지금의 당신을 만들었습니다.

### 현재 해석
지금 이 순간, 새로운 가능성이 당신 앞에 펼쳐져 있습니다.
마음속 깊은 곳에서 들려오는 목소리에 귀를 기울여 보세요.

### 미래 해석
앞으로의 길에는 작은 전환점이 기다리고 있습니다.
지금의 선택이 미래를 밝히는 빛이 될 것입니다.

### 종합 조언
과거의 경험을 바탕으로 현재를 단단히 딛고 서세요.
미래는 당신의 용기 있는 한 걸음에서 시작됩니다.`;

const MOCK_SUMMARY = "새로운 시작이 다가오고 있어요";

export interface InterpretMockConfig {
  delay?: number;
  error?: boolean;
  timeout?: boolean;
}

let interpretConfig: InterpretMockConfig = {};

export function setInterpretConfig(config: InterpretMockConfig) {
  interpretConfig = config;
}

export function resetInterpretConfig() {
  interpretConfig = {};
}

export const interpretHandler = http.post(
  "*/functions/v1/interpret",
  async () => {
    // timeout: no response
    if (interpretConfig.timeout) {
      await new Promise(() => {
        /* never resolves */
      });
    }

    // error response
    if (interpretConfig.error) {
      return HttpResponse.json(
        { error: "Ollama connection failed" },
        { status: 500 },
      );
    }

    const delay = interpretConfig.delay ?? 0;
    if (delay > 0) {
      await new Promise((r) => setTimeout(r, delay));
    }

    // SSE streaming
    const chunks = MOCK_INTERPRETATION.split(/(?<=\n)/);
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for (const chunk of chunks) {
          const event = JSON.stringify({ type: "chunk", data: chunk });
          controller.enqueue(encoder.encode(`data: ${event}\n\n`));
          await new Promise((r) => setTimeout(r, 50));
        }
        const doneEvent = JSON.stringify({
          type: "done",
          data: JSON.stringify({
            interpretation: MOCK_INTERPRETATION,
            summary: MOCK_SUMMARY,
          }),
        });
        controller.enqueue(encoder.encode(`data: ${doneEvent}\n\n`));
        controller.close();
      },
    });

    return new HttpResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  },
);
