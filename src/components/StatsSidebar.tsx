import type { Child, CustodyDay } from "../types/custody";
import { children, parentLabels, scheduleConfig } from "../data/mockSchedule";
import {
  calculateLongestStretchWithoutParent,
  calculateMonthlyStats,
  calculateWeeklyStats,
  findUpcomingTransition,
} from "../utils/custodyStats";
import { formatDuration, formatShortDate } from "../utils/dates";
import { ParentSplitDonut } from "./charts/ParentSplitDonut";
import { StackedTimeBars } from "./charts/StackedTimeBars";
import { WeeklyComparisonChart } from "./charts/WeeklyComparisonChart";
import { StatCard } from "./StatCard";

interface StatsSidebarProps {
  days: CustodyDay[];
}

function childInitial(childId: Child["id"]): string {
  return children.find((child) => child.id === childId)?.initial ?? childId;
}

export function StatsSidebar({ days }: StatsSidebarProps) {
  const monthlyStats = calculateMonthlyStats(days);
  const weeklyStats = calculateWeeklyStats(days).slice(0, 6);
  const totalHoursByParent = monthlyStats.reduce(
    (result, month) => {
      result.mom += month.hoursByParent.mom;
      result.dad += month.hoursByParent.dad;
      return result;
    },
    { mom: 0, dad: 0 },
  );
  const withoutMom = calculateLongestStretchWithoutParent(days, children, "mom");
  const withoutDad = calculateLongestStretchWithoutParent(days, children, "dad");
  const upcomingTransition = findUpcomingTransition(days);

  return (
    <aside className="space-y-4">
      <StatCard title="Quality Time Split">
        <ParentSplitDonut hoursByParent={totalHoursByParent} parentLabels={parentLabels} />
      </StatCard>

      <StatCard title="Monthly Balance">
        <StackedTimeBars
          items={monthlyStats.map((month) => ({
            key: month.monthKey,
            label: month.monthLabel.replace(" 2026", ""),
            hoursByParent: month.hoursByParent,
          }))}
          parentLabels={parentLabels}
        />
      </StatCard>

      <StatCard title="Weekly Balance">
        <WeeklyComparisonChart
          items={weeklyStats.map((week) => ({
            key: week.weekKey,
            label: `W${week.weekOfYear}`,
            hoursByParent: week.hoursByParent,
          }))}
          parentLabels={parentLabels}
        />
      </StatCard>

      <StatCard title="Quality Monthly Time">
        <div className="space-y-3">
          {monthlyStats.map((month) => (
            <div key={month.monthKey}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{month.monthLabel}</span>
                <span className="text-slate-500">
                  {month.percentByParent.mom}% / {month.percentByParent.dad}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-teal-50 p-2 text-teal-900">
                  <p className="font-semibold">{formatDuration(month.hoursByParent.mom)}</p>
                  <p className="text-xs">{parentLabels.mom}</p>
                </div>
                <div className="rounded-md bg-indigo-50 p-2 text-indigo-900">
                  <p className="font-semibold">{formatDuration(month.hoursByParent.dad)}</p>
                  <p className="text-xs">{parentLabels.dad}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </StatCard>

      <StatCard title="Quality Weekly Time">
        <div className="space-y-2">
          {weeklyStats.map((week) => (
            <div key={week.weekKey} className="rounded-md bg-slate-50 p-2 text-sm">
              <p className="font-medium text-slate-700">{week.label}</p>
              <p className="mt-1 text-slate-600">
                {parentLabels.mom} {formatDuration(week.hoursByParent.mom)} ·{" "}
                {parentLabels.dad} {formatDuration(week.hoursByParent.dad)}
              </p>
            </div>
          ))}
        </div>
      </StatCard>

      <StatCard title="Longest Stretch Away">
        <div className="space-y-3 text-sm text-slate-700">
          <div>
            <p className="font-medium">Without {parentLabels.mom} time</p>
            {Object.entries(withoutMom).map(([childId, daysAway]) => (
              <p key={childId} className="text-slate-600">
                {childInitial(childId as Child["id"])}: {formatDuration(daysAway * 24)}
              </p>
            ))}
          </div>
          <div>
            <p className="font-medium">Without {parentLabels.dad} time</p>
            {Object.entries(withoutDad).map(([childId, daysAway]) => (
              <p key={childId} className="text-slate-600">
                {childInitial(childId as Child["id"])}: {formatDuration(daysAway * 24)}
              </p>
            ))}
          </div>
        </div>
      </StatCard>

      <StatCard title="Daily Rhythm">
        <div className="space-y-2 text-sm text-slate-700">
          {children.map((child) => (
            <div key={child.id} className="rounded-md bg-slate-50 p-2">
              <p className="font-medium">{child.initial}</p>
              <p className="text-slate-600">
                Wake {child.wakeUpTime} · Bed {child.bedTime}
              </p>
              <p className="text-slate-600">
                School Sun-Thu from {child.schoolHours[0]?.start} to {child.schoolHours[0]?.end}
              </p>
            </div>
          ))}
          <p className="pt-1 text-xs text-slate-500">
            Summer vacation: {formatShortDate(scheduleConfig.summerVacation.startDate)} -{" "}
            {formatShortDate(scheduleConfig.summerVacation.endDate)}
          </p>
        </div>
      </StatCard>

      <StatCard title="Upcoming Transition">
        {upcomingTransition ? (
          <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-900">
            <p className="font-semibold">
              {upcomingTransition.name} · {formatDuration(upcomingTransition.hours)}
            </p>
            <p className="mt-1">
              {formatShortDate(upcomingTransition.date)} from{" "}
              {parentLabels[upcomingTransition.mainParent]} to{" "}
              {parentLabels[upcomingTransition.otherParent]}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-600">No upcoming transition in this range.</p>
        )}
      </StatCard>
    </aside>
  );
}
