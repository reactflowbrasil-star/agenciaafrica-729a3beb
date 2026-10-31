import { describe, expect, it } from "vitest";
import { getNarrationFrame } from "@/lib/narration";

describe("Narration closing sentence timing", () => {
  it("finishes short words before the following word starts", () => {
    const frame = getNarrationFrame(30.315);
    expect(frame.fullText.slice(0, frame.typed)).toBe("Muito prazer, somos a");
  });

  it("finishes agência before África begins at 30.48 seconds", () => {
    const frame = getNarrationFrame(30.46);
    expect(frame.fullText.slice(0, frame.typed)).toBe("Muito prazer, somos a agência");
  });

  it("finishes the closing phrase before the audio ends at 30.85 seconds", () => {
    const frame = getNarrationFrame(30.75);
    expect(frame.fullText.slice(0, frame.typed)).toBe("Muito prazer, somos a agência África.");
  });

  it("does not reveal the final phrase before its recorded start", () => {
    expect(getNarrationFrame(29.79).fullText).toBe("porque quem respeita a propaganda honra a sua história.");
  });

  it("keeps the final word ahead of the end of a shorter encoded narration", () => {
    const mediaDuration = 29.4;
    const frame = getNarrationFrame(mediaDuration * 0.999, mediaDuration);
    expect(frame.fullText.slice(0, frame.typed)).toBe("Muito prazer, somos a agência África.");
  });
});
