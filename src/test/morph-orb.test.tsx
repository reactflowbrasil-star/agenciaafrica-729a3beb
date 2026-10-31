import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MorphOrb from "@/components/ui/morph-orb";

describe("briefing MorphOrb", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("submits the typed answer after the orb animation completes", async () => {
    vi.useFakeTimers();
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const onComplete = vi.fn();
    const onSubmit = vi.fn((text: string) => `Resposta registrada: ${text}`);

    render(<MorphOrb minThinkMs={0} onSubmit={onSubmit} onComplete={onComplete} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Sua resposta" }), { target: { value: "Meu briefing" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar resposta" }));

    await act(async () => { await vi.advanceTimersByTimeAsync(2500); });

    expect(onSubmit).toHaveBeenCalledWith("Meu briefing");
    expect(onComplete).toHaveBeenCalledWith("Meu briefing");
  });
});
