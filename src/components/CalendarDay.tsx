import type { Child, CustodyDay } from "../types/custody";
import { formatDuration, isToday, parseDateKey } from "../utils/dates";
import { parentLabels } from "../data/mockSchedule";

interface CalendarDayProps {
  date: Date;
  day?: CustodyDay;
  childrenById: Record<Child["id"], Child>;
  isInMonth: boolean;
}

const parentStyles = {
  mom: "border-teal-200 bg-teal-50/85 text-teal-950",
  dad: "border-indigo-200 bg-indigo-50/85 text-indigo-950",
};

export function CalendarDay({ date, day, childrenById, isInMonth }: CalendarDayProps) {
  const dateNumber = date.getDate();
  const dayIsToday = day ? isToday(day.date) : false;

  return (
    <article
      className={[
        "min-h-36 rounded-lg border p-3 shadow-sm transition",
        day ? parentStyles[day.parentId] : "border-slate-200 bg-slate-50 text-slate-400",
        !isInMonth ? "opacity-45" : "",
        dayIsToday ? "ring-2 ring-rose-300 ring-offset-2" : "",
      ].join(" ")}
      aria-label={day ? `${parseDateKey(day.date).toDateString()} ${parentLabels[day.parentId]}` : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-lg font-semibold">{dateNumber}</span>
        {dayIsToday ? (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
            Today
          </span>
        ) : null}
      </div>

      {day ? (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase text-current/70">
              {parentLabels[day.parentId]}
            </p>
            <div className="mt-1 space-y-1">
              {day.childCustody.map((custody) => (
                <p key={custody.childId} className="text-sm">
                  <span className="font-medium">{childrenById[custody.childId].initial}:</span>{" "}
                  <span className="text-current/75">
                    {formatDuration(custody.qualityParentHours)}
                  </span>
                </p>
              ))}
            </div>
          </div>

          {day.transition ? (
            <div className="rounded-md border border-rose-200 bg-white/70 px-2 py-1.5 text-xs text-rose-800">
              <span className="font-semibold">{day.transition.name}</span>{" "}
              {formatDuration(day.transition.hours)} to {parentLabels[day.transition.otherParent]}
            </div>
          ) : null}

          {day.activities.length > 0 ? (
            <ul className="space-y-1.5">
              {day.activities.map((activity) => (
                <li
                  key={activity.id}
                  className="rounded-md border border-amber-200 bg-white/70 px-2 py-1.5 text-xs text-slate-700"
                >
                  <span className="font-semibold">{activity.time}</span> {activity.title}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
