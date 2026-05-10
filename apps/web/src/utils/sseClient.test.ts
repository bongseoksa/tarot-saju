import { describe, it, expect, vi, beforeEach } from "vitest";
import { requestInterpretation } from "@/utils/sseClient";
import type { InterpretRequest } from "@tarot-saju/shared";

const testRequest: InterpretRequest = {
  themeId: "today",
  cards: [
    { cardId: 0, positionIndex: 0, isReversed: false },
    { cardId: 1, positionIndex: 1, isReversed: true },
    { cardId: 2, positionIndex: 2, isReversed: false },
  ],
};

function makeSSEStream(events: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const payload = events.join("\n") + "\n";
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(payload));
      controller.close();
    },
  });
}

function makeChunkedSSEStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

describe("sseClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls onChunk for each chunk event and onComplete for done", async () => {
    const chunks: string[] = [];
    const onChunk = vi.fn((text: string) => chunks.push(text));
    const onComplete = vi.fn();
    const onError = vi.fn();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        makeSSEStream([
          'data: {"type":"chunk","data":"Hello "}',
          'data: {"type":"chunk","data":"world"}',
          'data: {"type":"done","data":"final result"}',
        ]),
        { status: 200 },
      ),
    );

    await requestInterpretation(testRequest, { onChunk, onComplete, onError }, "/api");

    expect(onChunk).toHaveBeenCalledTimes(2);
    expect(chunks).toEqual(["Hello ", "world"]);
    expect(onComplete).toHaveBeenCalledWith("final result");
    expect(onError).not.toHaveBeenCalled();
  });

  it("calls onError on HTTP error status", async () => {
    const onChunk = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Internal Server Error", { status: 500 }),
    );

    await requestInterpretation(testRequest, { onChunk, onComplete, onError }, "/api");

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toContain("500");
    expect(onChunk).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("skips malformed JSON lines gracefully", async () => {
    const onChunk = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        makeSSEStream([
          'data: {"type":"chunk","data":"ok"}',
          "data: {INVALID JSON",
          'data: {"type":"done","data":"result"}',
        ]),
        { status: 200 },
      ),
    );

    await requestInterpretation(testRequest, { onChunk, onComplete, onError }, "/api");

    expect(onChunk).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("result");
    expect(onError).not.toHaveBeenCalled();
  });

  it("handles chunks split across multiple reads", async () => {
    const onChunk = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    // Split a single SSE event across two chunks
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        makeChunkedSSEStream([
          'data: {"type":"chu',
          'nk","data":"hello"}\n',
          'data: {"type":"done","data":"fin"}\n',
        ]),
        { status: 200 },
      ),
    );

    await requestInterpretation(testRequest, { onChunk, onComplete, onError }, "/api");

    expect(onChunk).toHaveBeenCalledWith("hello");
    expect(onComplete).toHaveBeenCalledWith("fin");
  });

  it("ignores non-data lines (comments, empty lines)", async () => {
    const onChunk = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        makeSSEStream([
          ": this is a comment",
          "",
          'data: {"type":"chunk","data":"text"}',
          "event: something",
          'data: {"type":"done","data":"end"}',
        ]),
        { status: 200 },
      ),
    );

    await requestInterpretation(testRequest, { onChunk, onComplete, onError }, "/api");

    expect(onChunk).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("end");
  });

  it("calls onError when error event is received", async () => {
    const onChunk = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        makeSSEStream([
          'data: {"type":"chunk","data":"partial"}',
          'data: {"type":"error","data":"AI model failed"}',
        ]),
        { status: 200 },
      ),
    );

    await requestInterpretation(testRequest, { onChunk, onComplete, onError }, "/api");

    expect(onChunk).toHaveBeenCalledWith("partial");
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe("AI model failed");
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("retries once on AbortError (timeout)", async () => {
    const onChunk = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    const abortError = new DOMException("The operation was aborted", "AbortError");
    vi.spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(abortError) // first attempt times out
      .mockResolvedValueOnce(
        new Response(
          makeSSEStream(['data: {"type":"done","data":"retry ok"}']),
          { status: 200 },
        ),
      );

    await requestInterpretation(testRequest, { onChunk, onComplete, onError }, "/api");

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenCalledWith("retry ok");
    expect(onError).not.toHaveBeenCalled();
  });

  it("calls onError when both attempts fail with AbortError", async () => {
    const onChunk = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    const abortError = new DOMException("The operation was aborted", "AbortError");
    vi.spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(abortError)
      .mockRejectedValueOnce(abortError);

    await requestInterpretation(testRequest, { onChunk, onComplete, onError }, "/api");

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("calls onError immediately on non-AbortError (no retry)", async () => {
    const onChunk = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await requestInterpretation(testRequest, { onChunk, onComplete, onError }, "/api");

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe("Failed to fetch");
  });

  it("handles empty chunk data", async () => {
    const onChunk = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        makeSSEStream([
          'data: {"type":"chunk","data":""}',
          'data: {"type":"done","data":"end"}',
        ]),
        { status: 200 },
      ),
    );

    await requestInterpretation(testRequest, { onChunk, onComplete, onError }, "/api");

    expect(onChunk).toHaveBeenCalledWith("");
    expect(onComplete).toHaveBeenCalledWith("end");
  });

  it("sends correct request headers", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(makeSSEStream(['data: {"type":"done","data":"ok"}']), { status: 200 }),
    );

    await requestInterpretation(
      testRequest,
      { onChunk: vi.fn(), onComplete: vi.fn(), onError: vi.fn() },
      "/api/interpret",
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/interpret",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(testRequest),
      }),
    );
  });
});
