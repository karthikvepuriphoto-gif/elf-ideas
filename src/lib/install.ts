export function isMobileBrowser(
  ua: string,
  opts?: { platform?: string; maxTouchPoints?: number; coarse?: boolean; narrow?: boolean },
): boolean {
  if (/Android|iPhone|iPad|iPod/i.test(ua)) return true;
  if (opts?.platform === "MacIntel" && (opts.maxTouchPoints ?? 0) > 1) return true;
  return Boolean(opts?.coarse && opts?.narrow);
}

export function detectMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 900px)").matches;
  return isMobileBrowser(navigator.userAgent || "", {
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    coarse,
    narrow,
  });
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.matchMedia("(display-mode: fullscreen)").matches) return true;
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}
