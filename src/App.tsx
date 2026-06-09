import { AppHeader } from "./components/AppHeader";
import { CalendarMonth } from "./components/CalendarMonth";
import { Legend } from "./components/Legend";
import { StatsSidebar } from "./components/StatsSidebar";
import { children, mockSchedule, visibleMonths } from "./data/mockSchedule";
import type { Child, CustodyDay } from "./types/custody";

const daysByDate = mockSchedule.reduce<Record<string, CustodyDay>>((result, day) => {
  result[day.date] = day;
  return result;
}, {});

const childrenById = children.reduce<Record<Child["id"], Child>>(
  (result, child) => {
    result[child.id] = child;
    return result;
  },
  {} as Record<Child["id"], Child>,
);

export default function App() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef7f3_0%,#f7f4ee_52%,#f6f7fb_100%)]">
      <AppHeader />
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
        <section className="space-y-4" aria-label="Three month custody calendar">
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white/75 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Three-month view</h2>
              <p className="mt-1 text-sm text-slate-600">
                Custody blocks, transitions, and kid activities for M and N.
              </p>
            </div>
            <Legend />
          </div>

          <div className="grid gap-5">
            {visibleMonths.map((month) => (
              <CalendarMonth
                key={`${month.year}-${month.monthIndex}`}
                year={month.year}
                monthIndex={month.monthIndex}
                daysByDate={daysByDate}
                childrenById={childrenById}
              />
            ))}
          </div>
        </section>

        <StatsSidebar days={mockSchedule} />
      </main>
    </div>
  );
}
