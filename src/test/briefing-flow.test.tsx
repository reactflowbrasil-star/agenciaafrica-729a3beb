import React, { useEffect } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/draw-line-text", () => ({
  DrawLineText: ({ onDrawComplete }: { onDrawComplete?: () => void }) => {
    useEffect(() => onDrawComplete?.(), [onDrawComplete]);
    return React.createElement("svg", { "aria-label": "AFRICA" });
  },
}));

import { Route } from "@/routes/index";

const Intro = Route.options.component as unknown as ComponentType;

describe("briefing intro flow", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("reaches the first questionnaire step when the narration stream errors", async () => {
    vi.useFakeTimers();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    render(<Intro />);

    fireEvent.click(screen.getByRole("button", { name: "Iniciar" }));
    const narration = document.querySelectorAll("audio")[1];
    expect(narration).toBeDefined();
    fireEvent.error(narration!);

    await act(async () => { await vi.advanceTimersByTimeAsync(800); });
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    await act(async () => { await vi.advanceTimersByTimeAsync(900); });
    await act(async () => { await vi.advanceTimersByTimeAsync(2700); });

    expect(screen.getByText("1 →")).toBeInTheDocument();
  });
});
