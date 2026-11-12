import { useMemo, useState } from "react";
import { useTracker } from "../context/Tracker";
import { formatNight } from "../lib/dates";
import { filterIdeas } from "../lib/filters";
import { ideas, getIdea } from "../lib/ideas";
import { photoUrl } from "../lib/media";
import { nightForIdea, nightsInRange } from "../lib/plan";
import { emptyFilters } from "../lib/filters";
import { Sheet } from "./Sheet";

export function NightSheet({ ideaId, onClose }: { ideaId: string; onClose: () => void }) {
  const { store, placeOnNight, clearPlanNight } = useTracker();
  const dates = useMemo(() => nightsInRange(store.planYear, store.planStart), [store.planYear, store.planStart]);
  const current = nightForIdea(store.nights, ideaId);
  const [pending, setPending] = useState<string | null>(null);
  const occupant = pending ? getIdea(store.nights[pending]) : undefined;

  function choose(date: string) {
    const taken = store.nights[date];
    if (taken && taken !== ideaId && !current) {
      setPending(date);
      return;
    }
    placeOnNight(ideaId, date);
    onClose();
  }

  return (
    <Sheet title="Add to night…" onClose={onClose}>
      <p className="hint">
        December {store.planYear}, from {formatNight(store.planStart)} through Christmas Eve. Change the arrival day on the
        Nights tab.
      </p>
      {current && (
        <p className="hint">
          Already on {formatNight(current)}. Pick another night to move it.{" "}
          <button
            type="button"
            className="text-button"
            onClick={() => {
              clearPlanNight(current);
              onClose();
            }}
          >
            Remove from the plan
          </button>
        </p>
      )}
      {pending && occupant && (
        <div className="confirm">
          <p>
            {formatNight(pending)} already has {occupant.title}. Replace it? That idea will come off the plan.
          </p>
          <div className="row">
            <button
              type="button"
              className="primary"
              onClick={() => {
                placeOnNight(ideaId, pending);
                onClose();
              }}
            >
              Replace
            </button>
            <button type="button" className="secondary" onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      <ul className="pick-list">
        {dates.map((date) => {
          const idea = getIdea(store.nights[date]);
          const here = date === current;
          return (
            <li key={date}>
              <button type="button" className={here ? "pick on" : "pick"} onClick={() => choose(date)} disabled={here}>
                {idea ? <img src={photoUrl(idea.cover, true)} alt="" /> : <span className="pick-empty">+</span>}
                <span>
                  <strong>{formatNight(date)}</strong>
                  <span>{here ? "This idea is here" : idea ? idea.title : "Open night"}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}

export function IdeaPicker({ date, onClose }: { date: string; onClose: () => void }) {
  const { store, placeOnNight } = useTracker();
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const list = useMemo(() => filterIdeas(ideas, { ...emptyFilters, q: query }), [query]);
  const occupantId = store.nights[date];
  const occupant = getIdea(occupantId);
  const pendingIdea = pending ? getIdea(pending) : undefined;

  function choose(id: string) {
    if (occupantId && occupantId !== id && !nightForIdea(store.nights, id)) {
      setPending(id);
      return;
    }
    placeOnNight(id, date);
    onClose();
  }

  return (
    <Sheet title={`Add to ${formatNight(date)}`} onClose={onClose}>
      <label className="search">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search ideas"
          aria-label="Search ideas"
        />
      </label>
      {pending && pendingIdea && occupant && (
        <div className="confirm">
          <p>
            Replace {occupant.title} with {pendingIdea.title}? {occupant.title} will come off the plan.
          </p>
          <div className="row">
            <button
              type="button"
              className="primary"
              onClick={() => {
                placeOnNight(pending, date);
                onClose();
              }}
            >
              Replace
            </button>
            <button type="button" className="secondary" onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      <ul className="pick-list">
        {list.map((idea) => (
          <li key={idea.id}>
            <button type="button" className="pick" onClick={() => choose(idea.id)}>
              <img src={photoUrl(idea.cover, true)} alt="" />
              <span>
                <strong>{idea.title}</strong>
                <span>
                  {idea.difficulty} · {idea.time}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="hint">No ideas match that search.</p>}
    </Sheet>
  );
}

export function SwapSheet({ date, dates, onClose }: { date: string; dates: string[]; onClose: () => void }) {
  const { store, moveOnPlan } = useTracker();
  const idea = getIdea(store.nights[date]);

  return (
    <Sheet title="Swap with another night" onClose={onClose}>
      <p className="hint">{idea ? `Move ${idea.title}, or swap it with the idea already on a night.` : "Pick a night."}</p>
      <ul className="pick-list">
        {dates.map((target) => {
          if (target === date) return null;
          const other = getIdea(store.nights[target]);
          return (
            <li key={target}>
              <button
                type="button"
                className="pick"
                onClick={() => {
                  moveOnPlan(date, target);
                  onClose();
                }}
              >
                {other ? <img src={photoUrl(other.cover, true)} alt="" /> : <span className="pick-empty">+</span>}
                <span>
                  <strong>{formatNight(target)}</strong>
                  <span>{other ? `Swap with ${other.title}` : "Move to this open night"}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
