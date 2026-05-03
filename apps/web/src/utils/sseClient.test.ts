import { describe, it, expect, vi, beforeEach } from "vitest";
import { streamInterpretation } from "./sseClient";
import type { ReadingRequest } from "@tarot-saju/shared";

const mockRequest: ReadingRequest = {
  themeId: "daily-today",
  cards: [
    { cardId: 0, positionIndex: 0, isReversed: false },
    { cardId: 5, positionIndex: 1, isReversed: true },
    { cardId: 10, positionIndex: 2, isReversed: false },
  ],
};

function createMockSSEResponse(chunks: string[]): Response {
  let index = 0;
  const stream = new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(new TextEncoder().encode(chunks[index]));
        index++;
      } else {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });
}

describe("sseClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should call onChunk for each streamed chunk", async () => {
    const chunks = ["Hello ", "World", "!"];
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createMockSSEResponse(chunks),
    );

    const onChunk = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    await streamInterpretation(mockRequest, onChunk, onComplete, onError);

    expect(onChunk).toHaveBeenCalledTimes(3);
    expect(onChunk).toHaveBeenNthCalledWith(1, "Hello ");
    expect(onChunk).toHaveBeenNthCalledWith(2, "World");
    expect(onChunk).toHaveBeenNthCalledWith(3, "!");
  });

  it("should call onComplete with full text", async () => {
    const chunks = ["Hello ", "World"];
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createMockSSEResponse(chunks),
    );

    const onChunk = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    await streamInterpretation(mockRequest, onChunk, onComplete, onError);

    expect(onComplete).toHaveBeenCalledWith("Hello World");
  });

  it("should call onError on network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network down"));

    const onChunk = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    await streamInterpretation(mockRequest, onChunk, onComplete, onError);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toContain("Network down");
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("should call onError on non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response('{"error":"bad request"}', { status: 400 }),
    );

    const onChunk = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    await streamInterpretation(mockRequest, onChunk, onComplete, onError);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("should handle abort gracefully", async () => {
    const controller = new AbortController();
    const abortError = new DOMException("The operation was aborted.", "AbortError");

    vi.spyOn(globalThis, "fetch").mockRejectedValue(abortError);

    const onChunk = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    controller.abort();

    await streamInterpretation(
      mockRequest,
      onChunk,
      onComplete,
      onError,
      controller.signal,
    );

    // Should not call onComplete or onError when aborted
    expect(onComplete).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });
});
