import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { doneToday, useTracker } from "../context/Tracker";
import { formatMonthDay, formatNight } from "../lib/dates";
import { getIdea } from "../lib/ideas";
import { photoUrl } from "../lib/media";
import { adjacentDate, nightForIdea, nightsInRange } from "../lib/plan";
import { DIFFICULTY_HINT } from "../types";
import { HeartIcon } from "./Icons";
import { NightSheet, SwapSheet } from "./Pickers";
import { Viewer } from "./Viewer";

export function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const idea = getIdea(id);
  const { store, toggleFavorite, setDone, setNote, toggleSupply, moveOnPlan, clearPlanNight } = useTracker();
  const scroller = useRef<HTMLDivElement>(null);
  const [heroIndex, setHeroIndex] = useState(() => {
    if (!idea) return 0;
    const index = idea.photos.indexOf(idea.cover);
    return index < 0 ? 0 : index;
  });
  const [viewer, setViewer] = useState<number | null>(null);
  const [nightSheet, setNightSheet] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);

  useEffect(() => {
    const found = getIdea(id);
    if (!found) return;
    const index = found.photos.indexOf(found.cover);
    setHeroIndex(index < 0 ? 0 : index);
    setViewer(null);
    if (scroller.current) scroller.current.scrollLeft = 0;
  }, [id]);

  if (!idea) {
    return (
      <div className="empty">
        <p>That idea isn’t in the catalog.</p>
        <Link to="/" className="secondary linkish">
          Back to ideas
        </Link>
      </div>
    );
  }

  const favorite = store.favorites.includes(idea.id);
  const done = store.done[idea.id];
  const note = store.notes[idea.id] ?? "";
  const checked = new Set(store.checks[idea.id] ?? []);
  const dates = nightsInRange(store.planYear, store.planStart);
  const night = nightForIdea(store.nights, idea.id);
  const inRange = night ? dates.includes(night) : false;
  const up = night && inRange ? adjacentDate(dates, night, -1) : null;
  const down = night && inRange ? adjacentDate(dates, night, 1) : null;

  function scrollToPhoto(index: number) {
    const root = scroller.current;
    if (!root) return;
    root.scrollTo({ left: index * root.clientWidth, behavior: "smooth" });
    setHeroIndex(index);
  }

  function back() {
    const state = window.history.state as { idx?: number } | null;
    if (typeof state?.idx === "number" && state.idx > 0) navigate(-1);
    else navigate("/");
  }

  return (
    <article className="detail">
      <button type="button" className="back" onClick={back}>
        Back
      </button>
      <div
        className="hero"
        ref={scroller}
        onScroll={(event) => {
          const root = event.currentTarget;
          if (root.clientWidth === 0) return;
          setHeroIndex(Math.round(root.scrollLeft / root.clientWidth));
        }}
      >
        {idea.photos.map((photo, index) => (
          <button key={`${photo}-${index}`} type="button" className="hero-slide" onClick={() => setViewer(index)}>
            <img src={photoUrl(photo)} alt={`${idea.title}, photo ${index + 1}`} />
          </button>
        ))}
      </div>
      <p className="viewer-caption">Tap a photo to enlarge</p>
      {idea.photos.length > 1 && (
        <div className="dots" role="tablist" aria-label="Photos">
          {idea.photos.map((photo, index) => (
            <button
              key={`${photo}-dot-${index}`}
              type="button"
              className={index === heroIndex ? "dot on" : "dot"}
              aria-label={`Photo ${index + 1}`}
              aria-selected={index === heroIndex}
              onClick={() => scrollToPhoto(index)}
            />
          ))}
        </div>
      )}

      <header className="detail-head">
        <p className="source">{idea.source}</p>
        <h2>{idea.title}</h2>
        {idea.year && (
          <p className="didit">
            We did it in {idea.year}
            {idea.date ? ` · ${formatMonthDay(idea.date)}` : ""}.
          </p>
        )}
        {idea.credit && <p className="hint">Shared by {idea.credit}</p>}
        {idea.link && (
          <p>
            <a href={idea.link} rel="noreferrer">
              Open the original
            </a>
          </p>
        )}
      </header>

      <ul className="meta-row">
        <li className={`diff diff-${idea.difficulty.toLowerCase()}`}>
          {idea.difficulty} · {DIFFICULTY_HINT[idea.difficulty]}
        </li>
        <li className="pill">Time: {idea.time}</li>
        <li className={`pill mess-${idea.mess.toLowerCase()}`}>Mess: {idea.mess}</li>
      </ul>

      <p className="description">{idea.description}</p>

      <div className="action-grid">
        <button type="button" className={favorite ? "secondary on" : "secondary"} aria-pressed={favorite} onClick={() => toggleFavorite(idea.id)}>
          <HeartIcon filled={favorite} size={18} /> {favorite ? "Saved to try" : "Want to try"}
        </button>
        <button
          type="button"
          className={done ? "secondary on" : "secondary"}
          aria-pressed={Boolean(done)}
          onClick={() => setDone(idea.id, done ? null : doneToday())}
        >
          {done ? "Done" : "Mark done"}
        </button>
        <button type="button" className="primary" onClick={() => setNightSheet(true)}>
          Add to night…
        </button>
      </div>
      {done && (
        <label className="date-line">
          Done on
          <input type="date" value={done} onChange={(event) => setDone(idea.id, event.target.value || null)} />
        </label>
      )}

      {night && (
        <section className="night-card">
          <h3>On the plan</h3>
          <p>{formatNight(night)}</p>
          {inRange && (
            <div className="night-actions">
              <button type="button" disabled={!up} onClick={() => up && moveOnPlan(night, up)}>
                Move up
              </button>
              <button type="button" disabled={!down} onClick={() => down && moveOnPlan(night, down)}>
                Move down
              </button>
              <button type="button" onClick={() => setSwapOpen(true)}>
                Swap with another night
              </button>
              <button type="button" onClick={() => clearPlanNight(night)}>
                Clear night
              </button>
            </div>
          )}
        </section>
      )}

      <label className="note">
        Your note
        <textarea
          value={note}
          maxLength={2000}
          rows={4}
          placeholder="A reminder just for you. It stays on this phone."
          onChange={(event) => setNote(idea.id, event.target.value)}
        />
      </label>

      {idea.supplies.length > 0 && (
        <section>
          <h3>Supplies</h3>
          <ul className="supplies">
            {idea.supplies.map((item, index) => {
              const on = checked.has(item);
              return (
                <li key={`${item}-${index}`}>
                  <button type="button" className={on ? "check on" : "check"} role="checkbox" aria-checked={on} onClick={() => toggleSupply(idea.id, item)}>
                    <span className="box" aria-hidden="true">
                      {on ? "✓" : ""}
                    </span>
                    <span>{item}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {idea.tags.length > 0 && (
        <div className="chips">
          {idea.tags.map((tag) => (
            <Link key={tag} to={`/?tag=${encodeURIComponent(tag)}`} className="chip">
              {tag}
            </Link>
          ))}
        </div>
      )}

      {viewer != null && <Viewer photos={idea.photos} title={idea.title} startIndex={viewer} onClose={() => setViewer(null)} />}
      {nightSheet && <NightSheet ideaId={idea.id} onClose={() => setNightSheet(false)} />}
      {swapOpen && night && <SwapSheet date={night} dates={dates} onClose={() => setSwapOpen(false)} />}
    </article>
  );
}
