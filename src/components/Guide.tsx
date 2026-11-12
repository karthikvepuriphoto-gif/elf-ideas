import { createContext, useContext, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AddSquareIcon, DotsIcon, PhonePlusIcon, ShareIcon } from "./Icons";

const OpenGuideContext = createContext<() => void>(() => {});

export function OpenGuideProvider({ open, children }: { open: () => void; children: ReactNode }) {
  return <OpenGuideContext.Provider value={open}>{children}</OpenGuideContext.Provider>;
}

export function useOpenGuide(): () => void {
  return useContext(OpenGuideContext);
}

function Step({ n, icon, text }: { n: number; icon: ReactNode; text: string }) {
  return (
    <li className="step">
      <span className="step-icon">
        {icon}
        <span className="step-num">{n}</span>
      </span>
      <span className="step-text">{text}</span>
    </li>
  );
}

export function Guide({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return createPortal(
    <div className="guide" role="dialog" aria-modal="true" aria-labelledby="guide-title">
      <div className="guide-card">
        <p className="eyebrow">Keep it on your phone</p>
        <h2 id="guide-title">Add Elf Ideas to your Home Screen</h2>
        <p className="lede">
          It opens full screen, like any other app. Your list still stays on this phone.
        </p>

        <section className="guide-os" aria-label="iPhone">
          <h3>iPhone</h3>
          <ol>
            <Step n={1} icon={<ShareIcon />} text="Tap the Share button" />
            <Step n={2} icon={<AddSquareIcon />} text="Tap Add to Home Screen" />
            <Step n={3} icon={<span className="add-pill">Add</span>} text="Tap Add" />
          </ol>
        </section>

        <section className="guide-os" aria-label="Android">
          <h3>Android</h3>
          <ol>
            <Step n={1} icon={<DotsIcon />} text="Tap the ⋮ menu" />
            <Step n={2} icon={<PhonePlusIcon />} text="Tap Add to Home screen or Install app" />
          </ol>
        </section>

        <button type="button" className="primary wide" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>,
    document.body,
  );
}
