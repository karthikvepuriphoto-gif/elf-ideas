import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTracker } from "../context/Tracker";
import { dayNumber, formatMonth, formatNight } from "../lib/dates";
import { getIdea } from "../lib/ideas";
import { photoUrl } from "../lib/media";
import { adjacentDate, calendarWeeks, nightsInRange } from "../lib/plan";
import { GripIcon } from "./Icons";
import { IdeaPicker, SwapSheet } from "./Pickers";

function useMinWidth(pixels: number): boolean {
  const query = `(min-width: ${pixels}px)`;
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export function PlanPage() {
  const { store, setPlanYear, setPlanStart, moveOnPlan } = useTracker();
  const dates = useMemo(() => nightsInRange(store.planYear, store.planStart), [store.planYear, store.planStart]);
  const weeks = useMemo(() => calendarWeeks(dates), [dates]);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const wide = useMinWidth(1000);
  const [pickerDate, setPickerDate] = useState<string | null>(null);
  const [swapDate, setSwapDate] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const planned = dates.filter((date) => store.nights[date]).length;
  const hidden = Object.keys(store.nights).filter((date) => {
    if (!date.startsWith(`${store.planYear}-`) || date >= store.planStart) return false;
    return date >= `${store.planYear}-11-01` && date <= `${store.planYear}-12-24`;
  }).length;

  function onDragEnd(event: DragEndEvent) {
    setActiveDate(null);
    const from = event.active.data.current?.date as string | undefined;
    const to = event.over?.data.current?.date as string | undefined;
    if (from && to && from !== to) moveOnPlan(from, to);
  }

  const activeIdea = activeDate ? getIdea(store.nights[activeDate]) : undefined;

  return (
    <div className="plan">
      <div className="plan-head">
        <button type="button" className="icon-button" aria-label="Previous year" onClick={() => setPlanYear(store.planYear - 1)}>
          ‹
        </button>
        <h2>December {store.planYear}</h2>
        <button type="button" className="icon-button" aria-label="Next year" onClick={() => setPlanYear(store.planYear + 1)}>
          ›
        </button>
      </div>
      <label className="arrival">
        <span>Elf arrives</span>
        <input
          type="date"
          value={store.planStart}
          min={`${store.planYear}-11-01`}
          max={`${store.planYear}-12-24`}
          onChange={(event) => {
            if (event.target.value) setPlanStart(event.target.value);
          }}
        />
      </label>
      <p className="hint">Nights run from arrival through Christmas Eve, December 24. Each square keeps the photo handy.</p>
      {hidden > 0 && <p className="hint">{hidden} earlier night{hidden === 1 ? "" : "s"} stay saved if you move arrival back.</p>}
      <p className="count-line">
        {planned} of {dates.length} nights planned
      </p>

      {!wide && (
        <div className="view-toggle" role="tablist" aria-label="Plan view">
          <button type="button" role="tab" aria-selected={view === "calendar"} className={view === "calendar" ? "on" : ""} onClick={() => setView("calendar")}>
            Calendar
          </button>
          <button type="button" role="tab" aria-selected={view === "list"} className={view === "list" ? "on" : ""} onClick={() => setView("list")}>
            List
          </button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(event) => setActiveDate((event.active.data.current?.date as string | undefined) ?? null)}
        onDragCancel={() => setActiveDate(null)}
        onDragEnd={onDragEnd}
      >
        <div className="plan-board">
          {(wide || view === "calendar") && (
            <section aria-label="December calendar">
              <div className="weekdays" aria-hidden="true">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              {weeks.map((week, index) => {
                const first = week.find((day): day is string => Boolean(day));
                const previous = weeks
                  .slice(0, index)
                  .flat()
                  .findLast((day): day is string => Boolean(day));
                const showMonth = first && (!previous || first.slice(0, 7) !== previous.slice(0, 7));
                return (
                  <div key={first ?? `pad-${index}`}>
                    {showMonth && first && <h3 className="month-label">{formatMonth(first)}</h3>}
                    <div className="week">
                      {week.map((date, cell) =>
                        date ? (
                          <DayCell key={date} date={date} onEmpty={setPickerDate} />
                        ) : (
                          <span key={`empty-${index}-${cell}`} className="day spacer" />
                        ),
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          )}
          {(wide || view === "list") && (
            <section aria-label="Plan list">
              <p className="hint">Drag a night by the handle, or use Move up, Move down, and Swap with another night.</p>
              <ul className="night-list">
                {dates.map((date) => (
                  <NightRow key={date} date={date} dates={dates} onAdd={setPickerDate} onSwap={setSwapDate} />
                ))}
              </ul>
            </section>
          )}
        </div>
        <DragOverlay>
          {activeIdea ? (
            <div className="drag-card">
              <img src={photoUrl(activeIdea.cover, true)} alt="" />
              <span>{activeIdea.title}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {pickerDate && <IdeaPicker date={pickerDate} onClose={() => setPickerDate(null)} />}
      {swapDate && <SwapSheet date={swapDate} dates={dates} onClose={() => setSwapDate(null)} />}
    </div>
  );
}

function DayCell({ date, onEmpty }: { date: string; onEmpty: (date: string) => void }) {
  const navigate = useNavigate();
  const { store } = useTracker();
  const idea = getIdea(store.nights[date]);
  return (
    <button
      type="button"
      className={idea ? "day filled" : "day"}
      onClick={() => (idea ? navigate(`/idea/${idea.id}`) : onEmpty(date))}
      aria-label={idea ? `${formatNight(date)}, ${idea.title}` : `${formatNight(date)}, empty. Add an idea.`}
    >
      {idea && <img src={photoUrl(idea.cover, true)} alt="" />}
      <span className="day-num">{dayNumber(date)}</span>
      {!idea && <span className="day-plus">+</span>}
    </button>
  );
}

function NightRow({
  date,
  dates,
  onAdd,
  onSwap,
}: {
  date: string;
  dates: string[];
  onAdd: (date: string) => void;
  onSwap: (date: string) => void;
}) {
  const navigate = useNavigate();
  const { store, moveOnPlan, clearPlanNight } = useTracker();
  const idea = getIdea(store.nights[date]);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `drag-${date}`,
    data: { date },
    disabled: !idea,
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `drop-${date}`, data: { date } });
  const up = adjacentDate(dates, date, -1);
  const down = adjacentDate(dates, date, 1);

  return (
    <li ref={setDropRef} className={isOver ? "night-row over" : "night-row"}>
      {idea ? (
        <div
          className="drag-handle"
          ref={setNodeRef}
          style={{ opacity: isDragging ? 0.35 : 1 }}
          {...listeners}
          {...attributes}
          aria-label={`Drag ${idea.title} to another night`}
        >
          <GripIcon />
        </div>
      ) : (
        <span className="drag-handle spacer-handle" aria-hidden="true" />
      )}
      {idea ? (
        <button type="button" className="night-open" onClick={() => navigate(`/idea/${idea.id}`)}>
          <img src={photoUrl(idea.cover, true)} alt="" />
          <span>
            <span className="night-date">{formatNight(date)}</span>
            <span className="night-title">{idea.title}</span>
            <span className="night-meta">
              {idea.difficulty} · {idea.time}
            </span>
          </span>
        </button>
      ) : (
        <div className="night-open quiet">
          <span>
            <span className="night-date">{formatNight(date)}</span>
            <span className="night-meta">Nothing planned</span>
          </span>
          <button type="button" className="secondary" onClick={() => onAdd(date)}>
            Add an idea
          </button>
        </div>
      )}
      {idea && (
        <div className="night-actions">
          <button type="button" disabled={!up} onClick={() => up && moveOnPlan(date, up)}>
            Move up
          </button>
          <button type="button" disabled={!down} onClick={() => down && moveOnPlan(date, down)}>
            Move down
          </button>
          <button type="button" onClick={() => onSwap(date)}>
            Swap with another night
          </button>
          <button type="button" onClick={() => clearPlanNight(date)}>
            Clear night
          </button>
        </div>
      )}
    </li>
  );
}
