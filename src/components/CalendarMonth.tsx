import type { Child, CustodyDay } from "../types/custody";
import { formatMonthLabel, getCalendarGridDates, toDateKey } from "../utils/dates";
import { CalendarDay } from "./CalendarDay";

interface CalendarMonthProps {
  year: number;
  monthIndex: number;
  daysByDate: Record<string, CustodyDay>;
  childrenById: Record<Child["id"], Child>;
}

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonth({
  year,
  monthIndex,
  daysByDate,
  childrenById,
}: CalendarMonthProps) {
  const gridDates = getCalendarGridDates(year, monthIndex);

  return (
    <section className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        {formatMonthLabel(year, monthIndex)}
      </h2>
      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500">
        {weekdays.map((weekday) => (
          <div key={weekday}>{weekday}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-7">
        {gridDates.map((date) => {
          const dateKey = toDateKey(date);

          return (
            <CalendarDay
              key={dateKey}
              date={date}
              day={daysByDate[dateKey]}
              childrenById={childrenById}
              isInMonth={date.getMonth() === monthIndex}
            />
          );
        })}
      </div>
    </section>
  );
}
