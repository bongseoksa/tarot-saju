import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StreamingText from "./StreamingText";

describe("StreamingText", () => {
  it("renders the provided text", () => {
    render(<StreamingText text="Hello world" isStreaming={false} />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("shows cursor when streaming", () => {
    const { container } = render(
      <StreamingText text="Loading..." isStreaming={true} />,
    );
    const cursor = container.querySelector("[data-cursor]");
    expect(cursor).toBeInTheDocument();
  });

  it("hides cursor when not streaming", () => {
    const { container } = render(
      <StreamingText text="Done" isStreaming={false} />,
    );
    const cursor = container.querySelector("[data-cursor]");
    expect(cursor).not.toBeInTheDocument();
  });

  it("renders empty text without error", () => {
    const { container } = render(
      <StreamingText text="" isStreaming={true} />,
    );
    expect(container).toBeTruthy();
  });

  it("preserves whitespace formatting", () => {
    render(<StreamingText text="Line 1\n\nLine 2" isStreaming={false} />);
    expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    expect(screen.getByText(/Line 2/)).toBeInTheDocument();
  });
});
