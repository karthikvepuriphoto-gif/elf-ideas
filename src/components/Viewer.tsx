import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { photoUrl } from "../lib/media";
import { CloseIcon } from "./Icons";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function Viewer({
  photos,
  title,
  startIndex,
  onClose,
}: {
  photos: string[];
  title: string;
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [drag, setDrag] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const scaleRef = useRef(1);
  const txRef = useRef(0);
  const tyRef = useRef(0);
  const indexRef = useRef(startIndex);

  const apply = useCallback((nextScale: number, nextX: number, nextY: number) => {
    const scaleValue = clamp(nextScale, 1, 4);
    const limited = scaleValue <= 1.01 ? { x: 0, y: 0 } : panLimits(scaleValue);
    const x = scaleValue <= 1.01 ? 0 : clamp(nextX, -limited.x, limited.x);
    const y = scaleValue <= 1.01 ? 0 : clamp(nextY, -limited.y, limited.y);
    scaleRef.current = scaleValue <= 1.01 ? 1 : scaleValue;
    txRef.current = x;
    tyRef.current = y;
    setScale(scaleRef.current);
    setTx(x);
    setTy(y);
  }, []);

  const go = useCallback(
    (delta: number) => {
      setIndex((current) => {
        const next = clamp(current + delta, 0, photos.length - 1);
        indexRef.current = next;
        return next;
      });
      apply(1, 0, 0);
      setDrag(0);
    },
    [apply, photos.length],
  );

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "+" || event.key === "=") apply(scaleRef.current + 0.5, txRef.current, tyRef.current);
      if (event.key === "-" || event.key === "_") apply(scaleRef.current - 0.5, txRef.current, tyRef.current);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [apply, go, onClose]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let mode: "none" | "pan" | "pinch" | "swipe" = "none";
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    let originScale = 1;
    let startDist = 0;
    let pinchX = 0;
    let pinchY = 0;
    let centerX = 0;
    let centerY = 0;
    let swipeDx = 0;
    let lastTap = 0;

    const distance = (a: Touch, b: Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

    const onStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        mode = "pinch";
        const first = event.touches[0]!;
        const second = event.touches[1]!;
        startDist = Math.max(1, distance(first, second));
        originScale = scaleRef.current;
        originX = txRef.current;
        originY = tyRef.current;
        const rect = root.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
        const midX = (first.clientX + second.clientX) / 2;
        const midY = (first.clientY + second.clientY) / 2;
        pinchX = (midX - centerX - originX) / originScale;
        pinchY = (midY - centerY - originY) / originScale;
      } else if (event.touches.length === 1) {
        const touch = event.touches[0]!;
        startX = touch.clientX;
        startY = touch.clientY;
        originX = txRef.current;
        originY = tyRef.current;
        originScale = scaleRef.current;
        swipeDx = 0;
        mode = originScale > 1.02 ? "pan" : "swipe";
      }
    };

    const onMove = (event: TouchEvent) => {
      if (mode === "none") return;
      event.preventDefault();
      if (mode === "pinch" && event.touches.length >= 2) {
        const first = event.touches[0]!;
        const second = event.touches[1]!;
        const dist = distance(first, second);
        const nextScale = clamp(originScale * (dist / startDist), 1, 4);
        const midX = (first.clientX + second.clientX) / 2;
        const midY = (first.clientY + second.clientY) / 2;
        apply(nextScale, midX - centerX - pinchX * nextScale, midY - centerY - pinchY * nextScale);
      } else if (mode === "pan" && event.touches.length === 1) {
        const touch = event.touches[0]!;
        apply(originScale, originX + touch.clientX - startX, originY + touch.clientY - startY);
      } else if (mode === "swipe" && event.touches.length === 1) {
        const touch = event.touches[0]!;
        swipeDx = touch.clientX - startX;
        const swipeDy = touch.clientY - startY;
        if (Math.abs(swipeDy) > Math.abs(swipeDx) + 12) setDrag(0);
        else setDrag(swipeDx);
      }
    };

    const onEnd = (event: TouchEvent) => {
      if (mode === "swipe" && event.touches.length === 0) {
        const swipeDy = event.changedTouches[0] ? event.changedTouches[0].clientY - startY : 0;
        if (swipeDx > 56 && Math.abs(swipeDx) > Math.abs(swipeDy)) go(-1);
        else if (swipeDx < -56 && Math.abs(swipeDx) > Math.abs(swipeDy)) go(1);
        else if (Math.abs(swipeDx) < 12 && Math.abs(swipeDy) < 12) {
          const now = Date.now();
          if (now - lastTap < 280) {
            if (scaleRef.current > 1.05) apply(1, 0, 0);
            else apply(2.5, 0, 0);
            lastTap = 0;
          } else lastTap = now;
        }
        setDrag(0);
      }
      if (event.touches.length === 0) mode = "none";
      else if (event.touches.length === 1 && mode === "pinch") mode = scaleRef.current > 1.02 ? "pan" : "none";
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const next = scaleRef.current + (event.deltaY < 0 ? 0.25 : -0.25);
      apply(next, txRef.current, tyRef.current);
    };

    root.addEventListener("touchstart", onStart, { passive: true });
    root.addEventListener("touchmove", onMove, { passive: false });
    root.addEventListener("touchend", onEnd);
    root.addEventListener("touchcancel", onEnd);
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      root.removeEventListener("touchstart", onStart);
      root.removeEventListener("touchmove", onMove);
      root.removeEventListener("touchend", onEnd);
      root.removeEventListener("touchcancel", onEnd);
      root.removeEventListener("wheel", onWheel);
    };
  }, [apply, go]);

  const photo = photos[index] ?? photos[0];
  if (!photo) return null;

  return createPortal(
    <div className="viewer" ref={rootRef} role="dialog" aria-modal="true" aria-label={`${title} photos`}>
      <div className="viewer-bar">
        <button type="button" className="icon-button light" onClick={onClose} aria-label="Close photos">
          <CloseIcon />
        </button>
        <p>
          {index + 1} of {photos.length}
        </p>
        <div className="viewer-zoom">
          <button type="button" onClick={() => apply(scaleRef.current - 0.5, tx, ty)} aria-label="Zoom out">
            −
          </button>
          <button type="button" onClick={() => apply(scaleRef.current + 0.5, tx, ty)} aria-label="Zoom in">
            +
          </button>
        </div>
      </div>
      <img
        ref={imgRef}
        src={photoUrl(photo)}
        alt={`${title}, photo ${index + 1} of ${photos.length}`}
        draggable={false}
        style={{ transform: `translate(${tx + drag}px, ${ty}px) scale(${scale})` }}
      />
      {photos.length > 1 && scale === 1 && (
        <>
          <button type="button" className="viewer-nav prev" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous photo">
            ‹
          </button>
          <button
            type="button"
            className="viewer-nav next"
            onClick={() => go(1)}
            disabled={index === photos.length - 1}
            aria-label="Next photo"
          >
            ›
          </button>
        </>
      )}
      <p className="viewer-hint">{photos.length > 1 ? "Pinch to zoom. Swipe for the next photo." : "Pinch to zoom."}</p>
    </div>,
    document.body,
  );
}

function panLimits(scale: number): { x: number; y: number } {
  const img = document.querySelector<HTMLImageElement>(".viewer img");
  const root = document.querySelector<HTMLElement>(".viewer");
  if (!img || !root) return { x: 0, y: 0 };
  return {
    x: Math.max(0, (img.offsetWidth * scale - root.clientWidth) / 2),
    y: Math.max(0, (img.offsetHeight * scale - root.clientHeight) / 2),
  };
}
