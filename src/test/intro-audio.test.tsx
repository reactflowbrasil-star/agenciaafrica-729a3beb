import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Route } from "@/routes/index";

const Intro = Route.options.component as unknown as ComponentType;

// The voice-over and the looping soundtrack must both start from the same tap
// on "Iniciar": browsers refuse audible playback no gesture produced.
describe("Briefing intro audio", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("starts the soundtrack and the narration together when Iniciar is clicked", () => {
    const played: HTMLMediaElement[] = [];
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      played.push(this);
      return Promise.resolve();
    });

    render(<Intro />);

    expect(played).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "Iniciar" }));

    const [soundtrack, narration] = Array.from(document.querySelectorAll("audio"));
    expect(soundtrack).toBeDefined();
    expect(narration).toBeDefined();
    expect(played).toContain(soundtrack);
    expect(played).toContain(narration);

    // The soundtrack sits low under the voice; the voice keeps full level.
    expect(soundtrack?.volume).toBeCloseTo(0.25);
    expect(narration?.volume).toBeCloseTo(1);
  });
});
