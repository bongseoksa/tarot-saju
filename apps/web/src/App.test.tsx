import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders home page at root route", () => {
    render(<App />);
    expect(screen.getByText("HomePage")).toBeInTheDocument();
  });
});
