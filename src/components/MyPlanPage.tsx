import { Link } from "react-router-dom";
import { useTracker } from "../context/Tracker";
import { formatMonthDay, formatNight } from "../lib/dates";
import { getIdea, ideas } from "../lib/ideas";
import { photoUrl } from "../lib/media";
import { nightForIdea } from "../lib/plan";
import { BackupControls } from "./Backup";

export function MyPlanPage() {
  const { store } = useTracker();
  const order = new Map(ideas.map((idea, index) => [idea.id, index]));
  const want = store.favorites
    .filter((id) => !store.done[id] && getIdea(id))
    .sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
  const done = Object.keys(store.done)
    .filter((id) => getIdea(id))
    .sort((a, b) => (store.done[b] ?? "").localeCompare(store.done[a] ?? ""));

  return (
    <div className="mine">
      <p className="lede">Saved on this phone. Export the file if you switch phones.</p>
      <section>
        <h2>Want to try</h2>
        {want.length === 0 ? (
          <p className="hint">
            Tap the heart on an idea. <Link to="/">Browse ideas</Link>
          </p>
        ) : (
          <ul className="mine-list">
            {want.map((id) => (
              <PlanRow key={id} id={id} />
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2>Done</h2>
        {done.length === 0 ? (
          <p className="hint">When you mark an idea done, it lands here with the date.</p>
        ) : (
          <ul className="mine-list">
            {done.map((id) => (
              <PlanRow key={id} id={id} doneDate={store.done[id]} />
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2>Backup</h2>
        <BackupControls />
      </section>
    </div>
  );
}

function PlanRow({ id, doneDate }: { id: string; doneDate?: string }) {
  const { store } = useTracker();
  const idea = getIdea(id);
  if (!idea) return null;
  const night = nightForIdea(store.nights, id);
  const note = store.notes[id];
  return (
    <li>
      <Link to={`/idea/${idea.id}`} className="mine-row">
        <img src={photoUrl(idea.cover, true)} alt="" />
        <span>
          <strong>{idea.title}</strong>
          <span className="night-meta">
            {doneDate ? `Done ${formatMonthDay(doneDate)}` : `${idea.difficulty} · ${idea.time}`}
            {night ? ` · ${formatNight(night)}` : ""}
          </span>
          {note && <span className="note-preview">{note}</span>}
        </span>
      </Link>
    </li>
  );
}
