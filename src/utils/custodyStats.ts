import type {
  Child,
  CustodyDay,
  MonthlyStats,
  ParentId,
  Transition,
  WeeklyStats,
} from "../types/custody";
import {
  formatMonthLabel,
  formatShortDate,
  getMonthKey,
  getWeekKey,
  getWeekOfYear,
  parseDateKey,
} from "./dates";

const parents: ParentId[] = ["mom", "dad"];

function emptyParentHours(): Record<ParentId, number> {
  return { mom: 0, dad: 0 };
}

export function calculateMonthlyStats(days: CustodyDay[]): MonthlyStats[] {
  const grouped = new Map<string, CustodyDay[]>();

  days.forEach((day) => {
    const key = getMonthKey(day.date);
    grouped.set(key, [...(grouped.get(key) ?? []), day]);
  });

  return [...grouped.entries()].map(([monthKey, monthDays]) => {
    const [year, month] = monthKey.split("-").map(Number);
    const hoursByParent = emptyParentHours();

    monthDays.forEach((day) => {
      day.childCustody.forEach((custody) => {
        hoursByParent.mom += custody.qualityHoursByParent.mom;
        hoursByParent.dad += custody.qualityHoursByParent.dad;
      });
    });

    const totalHours = parents.reduce((total, parentId) => total + hoursByParent[parentId], 0);
    const percentByParent = parents.reduce<Record<ParentId, number>>((result, parentId) => {
      result[parentId] = Math.round((hoursByParent[parentId] / totalHours) * 100);
      return result;
    }, emptyParentHours());

    return {
      monthKey,
      monthLabel: formatMonthLabel(year, month - 1),
      hoursByParent,
      percentByParent,
    };
  });
}

export function calculateWeeklyStats(days: CustodyDay[]): WeeklyStats[] {
  const grouped = new Map<string, CustodyDay[]>();

  days.forEach((day) => {
    const key = getWeekKey(parseDateKey(day.date));
    grouped.set(key, [...(grouped.get(key) ?? []), day]);
  });

  return [...grouped.entries()].map(([weekKey, weekDays]) => {
    const hoursByParent = emptyParentHours();

    weekDays.forEach((day) => {
      day.childCustody.forEach((custody) => {
        hoursByParent.mom += custody.qualityHoursByParent.mom;
        hoursByParent.dad += custody.qualityHoursByParent.dad;
      });
    });

    return {
      weekKey,
      weekOfYear: getWeekOfYear(weekKey),
      label: `Week ${getWeekOfYear(weekKey)} · ${formatShortDate(weekKey)}`,
      hoursByParent,
    };
  });
}

export function calculateLongestStretchWithoutParent(
  days: CustodyDay[],
  children: Child[],
  parentId: ParentId,
): Record<Child["id"], number> {
  return children.reduce<Record<Child["id"], number>>(
    (result, child) => {
      let currentStretch = 0;
      let longestStretch = 0;

      days.forEach((day) => {
        const childCustody = day.childCustody.find((custody) => custody.childId === child.id);
        const childIsPresent = Boolean(childCustody);
        const childIsWithParent = childCustody?.parentId === parentId;

        if (childIsPresent && !childIsWithParent) {
          currentStretch += 1;
          longestStretch = Math.max(longestStretch, currentStretch);
        } else {
          currentStretch = 0;
        }
      });

      result[child.id] = longestStretch;
      return result;
    },
    {} as Record<Child["id"], number>,
  );
}

export function findUpcomingTransition(days: CustodyDay[], today = new Date()): Transition | undefined {
  const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  return days
    .filter((day) => day.transition && parseDateKey(day.date).getTime() >= todayTime)
    .map((day) => day.transition)
    .find((transition): transition is Transition => Boolean(transition));
}
