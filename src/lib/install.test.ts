import { describe, expect, it } from "vitest";
import { isMobileBrowser } from "./install";

describe("isMobileBrowser", () => {
  it("treats iPhone and Android as mobile and leaves desktop alone", () => {
    expect(isMobileBrowser("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(true);
    expect(isMobileBrowser("Mozilla/5.0 (Linux; Android 14; Pixel 8)")).toBe(true);
    expect(isMobileBrowser("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", { platform: "MacIntel", maxTouchPoints: 5 })).toBe(
      true,
    );
    expect(isMobileBrowser("Mozilla/5.0 (Windows NT 10.0)", { coarse: false, narrow: true })).toBe(false);
    expect(isMobileBrowser("Mozilla/5.0 (X11; Linux)", { coarse: true, narrow: true })).toBe(true);
  });
});
