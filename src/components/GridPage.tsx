import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTracker } from "../context/Tracker";
import { activeFilterCount, emptyFilters, filterIdeas } from "../lib/filters";
import { allTags, allYears, ideas } from "../lib/ideas";
import { photoUrl } from "../lib/media";
import { nightForIdea } from "../lib/plan";
import { DIFFICULTY_HINT, DIFFICULTIES, MESS_LEVELS, type Difficulty, type Filters, type MessLevel } from "../types";
import { dayNumber, formatMonth } from "../lib/dates";
import { DiceIcon, HeartIcon, SearchIcon } from "./Icons";
import { Sheet } from "./Sheet";

function readFilters(params: URLSearchParams): Filters {
  const difficulty = params.get("difficulty") ?? "";
  const mess = params.get("mess") ?? "";
  const year = params.get("year") ?? "";
  return {
    q: params.get("q") ?? "",
    difficulty: DIFFICULTIES.includes(difficulty as Difficulty) ? (difficulty as Difficulty) : "",
    year: allYears.includes(Number(year)) ? Number(year) : "",
    tag: allTags.includes(params.get("tag") ?? "") ? (params.get("tag") ?? "") : "",
    mess: MESS_LEVELS.includes(mess as MessLevel) ? (mess as MessLevel) : "",
  };
}

function writeFilters(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.year) params.set("year", String(filters.year));
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.mess) params.set("mess", filters.mess);
  return params;
}

export function GridPage() {
  const navigate = useNavigate();
  const { store, toggleFavorite } = useTracker();
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtered = useMemo(() => filterIdeas(ideas, filters), [filters]);

  useEffect(() => {
    const saved = Number(sessionStorage.getItem("elf-ideas.grid-scroll") || 0);
    window.scrollTo(0, saved);
    return () => sessionStorage.setItem("elf-ideas.grid-scroll", String(window.scrollY));
  }, []);

  function update(partial: Partial<Filters>) {
    setParams(writeFilters({ ...filters, ...partial }), { replace: true });
  }

  function surprise() {
    const pool = filtered.length > 0 ? filtered : ideas;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) navigate(`/idea/${pick.id}`);
  }

  const count = activeFilterCount(filters);

  return (
    <div className="home">
      <p className="lede">Pick an idea for tonight.</p>
      <form role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="search">
          <SearchIcon />
          <input
            type="search"
            value={filters.q}
            onChange={(event) => update({ q: event.target.value })}
            placeholder="Search titles, tags, supplies"
            aria-label="Search ideas"
            enterKeyHint="search"
          />
        </label>
      </form>

      <section className="time-block" aria-label="How much time do you have tonight?">
        <h2>How much time do you have tonight?</h2>
        <div className="time-picks">
          {DIFFICULTIES.map((difficulty) => {
            const on = filters.difficulty === difficulty;
            return (
              <button
                key={difficulty}
                type="button"
                className={on ? `time-pick on ${difficulty.toLowerCase()}` : `time-pick ${difficulty.toLowerCase()}`}
                aria-pressed={on}
                onClick={() => update({ difficulty: on ? "" : difficulty })}
              >
                <strong>{DIFFICULTY_HINT[difficulty]}</strong>
                <span>{difficulty}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="tool-row">
        <button type="button" className="secondary" onClick={() => setFiltersOpen(true)}>
          Filters{count ? ` (${count})` : ""}
        </button>
        <button type="button" className="primary" onClick={surprise} disabled={filtered.length === 0}>
          <DiceIcon size={18} /> Surprise me
        </button>
      </div>

      {count > 0 && (
        <div className="chips" aria-label="Active filters">
          {filters.q && (
            <button type="button" className="chip" onClick={() => update({ q: "" })}>
              “{filters.q}” ×
            </button>
          )}
          {filters.difficulty && (
            <button type="button" className="chip" onClick={() => update({ difficulty: "" })}>
              {filters.difficulty} · {DIFFICULTY_HINT[filters.difficulty]} ×
            </button>
          )}
          {filters.year && (
            <button type="button" className="chip" onClick={() => update({ year: "" })}>
              {filters.year} ×
            </button>
          )}
          {filters.mess && (
            <button type="button" className="chip" onClick={() => update({ mess: "" })}>
              Mess: {filters.mess} ×
            </button>
          )}
          {filters.tag && (
            <button type="button" className="chip" onClick={() => update({ tag: "" })}>
              {filters.tag} ×
            </button>
          )}
        </div>
      )}

      <p className="count-line">
        Showing {filtered.length} of {ideas.length}
      </p>

      {filtered.length === 0 ? (
        <div className="empty">
          <p>Nothing matches that. Try a shorter search, or clear the filters.</p>
          <button type="button" className="secondary" onClick={() => setParams(writeFilters(emptyFilters), { replace: true })}>
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="grid">
          {filtered.map((idea, index) => {
            const fav = store.favorites.includes(idea.id);
            const done = store.done[idea.id];
            const night = nightForIdea(store.nights, idea.id);
            return (
              <li key={idea.id}>
                <article className="card">
                  <Link to={`/idea/${idea.id}`} className="card-link">
                    <span className="card-photo">
                      <img
                        src={photoUrl(idea.cover, true)}
                        alt=""
                        loading={index < 4 ? "eager" : "lazy"}
                        decoding="async"
                      />
                      {idea.year && <span className="year-chip">{idea.year}</span>}
                      {done && <span className="done-chip">Done</span>}
                      {night && <span className="plan-chip">{formatMonth(night).slice(0, 3)} {dayNumber(night)}</span>}
                    </span>
                    <span className="card-body">
                      <span className="card-title">{idea.title}</span>
                      <span className={`diff diff-${idea.difficulty.toLowerCase()}`}>
                        {idea.difficulty} · {idea.time}
                      </span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    className={fav ? "heart on" : "heart"}
                    aria-pressed={fav}
                    aria-label={fav ? `Remove ${idea.title} from Want to try` : `Save ${idea.title} to Want to try`}
                    onClick={() => toggleFavorite(idea.id)}
                  >
                    <HeartIcon filled={fav} />
                  </button>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {filtersOpen && (
        <Sheet title="Filters" onClose={() => setFiltersOpen(false)}>
          <fieldset>
            <legend>Difficulty</legend>
            <div className="chips">
              <button type="button" className={filters.difficulty === "" ? "chip on" : "chip"} onClick={() => update({ difficulty: "" })}>
                Any time
              </button>
              {DIFFICULTIES.map((difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  className={filters.difficulty === difficulty ? "chip on" : "chip"}
                  aria-pressed={filters.difficulty === difficulty}
                  onClick={() => update({ difficulty })}
                >
                  {difficulty} · {DIFFICULTY_HINT[difficulty]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Year we did it</legend>
            <div className="chips">
              <button type="button" className={filters.year === "" ? "chip on" : "chip"} onClick={() => update({ year: "" })}>
                All years
              </button>
              {allYears.map((year) => (
                <button
                  key={year}
                  type="button"
                  className={filters.year === year ? "chip on" : "chip"}
                  aria-pressed={filters.year === year}
                  onClick={() => update({ year })}
                >
                  {year}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Mess</legend>
            <div className="chips">
              <button type="button" className={filters.mess === "" ? "chip on" : "chip"} onClick={() => update({ mess: "" })}>
                Any mess
              </button>
              {MESS_LEVELS.map((mess) => (
                <button
                  key={mess}
                  type="button"
                  className={filters.mess === mess ? "chip on" : "chip"}
                  aria-pressed={filters.mess === mess}
                  onClick={() => update({ mess })}
                >
                  {mess}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Tag</legend>
            <div className="chips">
              <button type="button" className={filters.tag === "" ? "chip on" : "chip"} onClick={() => update({ tag: "" })}>
                All tags
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={filters.tag === tag ? "chip on" : "chip"}
                  aria-pressed={filters.tag === tag}
                  onClick={() => update({ tag })}
                >
                  {tag}
                </button>
              ))}
            </div>
          </fieldset>
          <button
            type="button"
            className="secondary wide"
            onClick={() => {
              setParams(writeFilters(emptyFilters), { replace: true });
              setFiltersOpen(false);
            }}
          >
            Clear filters
          </button>
        </Sheet>
      )}
    </div>
  );
}
